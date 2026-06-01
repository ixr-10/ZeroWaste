from django.utils import timezone
from datetime import timedelta
from django.db import transaction, models
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth

from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.utils import create_notification
from .models import Donation, Reservation, NotInterested, Rating
from .serializers import DonationSerializer, ReservationSerializer

from django.utils.timezone import now


# ─────────────────────────────────────────────
# HELPER: unified reputation recalculation
# ─────────────────────────────────────────────

def recalculate_reputation(user):
    """
    Single source of truth for reputation_score.

    Formula:
        score = round(avg_rating × 20) + activity_bonus

    activity_bonus:
        +10 per reservation the user confirmed (as donor)
        +10 per donation the user marked as donated (completed)

    If the user has no ratings yet, the rating part is 0,
    so activity bonuses still accumulate correctly.
    """
    avg_result = Rating.objects.filter(
        rated_user=user
    ).aggregate(avg=Avg('score'))['avg']

    rating_component = round((avg_result or 0) * 20)

    confirmed_count = Reservation.objects.filter(
        donation__donor=user,
        status__in=['confirmed', 'completed']
    ).count()

    completed_donations_count = Donation.objects.filter(
        donor=user,
        status='donated'
    ).count()

    activity_bonus = (confirmed_count + completed_donations_count) * 10

    user.reputation_score = rating_component + activity_bonus
    user.save(update_fields=['reputation_score'])


# ─────────────────────────────────────────────
# DONATIONS
# ─────────────────────────────────────────────

class CreateDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        today = now().date()

        donations_today = Donation.objects.filter(
            donor=request.user,
            created_at__date=today
        ).exclude(status='deleted').count()

        if not request.user.is_verified:
            if donations_today >= 1:
                return Response(
                    {'error': 'Unverified users can only make 1 donation per day.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            if donations_today >= 5:
                return Response(
                    {'error': 'You have reached the maximum of 5 donations for today.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = DonationSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            donation = serializer.save(donor=request.user)

            try:
                from apps.notifications.utils import (
                    notify_nearby_users_new_donation,
                    notify_nearby_food_savers,
                    notify_urgent_donation
                )

                notify_nearby_users_new_donation(donation)
                notify_nearby_food_savers(donation)
                notify_urgent_donation(donation)

            except Exception:
                pass

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, donation_id):
        try:
            donation = Donation.objects.get(
                id=donation_id,
                donor=request.user
            )
        except Donation.DoesNotExist:
            return Response(
                {'error': 'Donation not found or not yours.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if donation.status in ['donated', 'expired', 'deleted']:
            return Response(
                {'error': f'Cannot edit a {donation.status} donation.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        allowed_fields = [
            'title',
            'description',
            'expiry_date',
            'pickup_address',
            'latitude',
            'longitude',
            'urgency',
            'image',
            'quantity',
            'unit',
            'category'
        ]

        data = {
            k: v for k, v in request.data.items()
            if k in allowed_fields
        }

        if 'quantity' in data:
            new_quantity = int(data['quantity'])

            already_reserved = donation.quantity - donation.available_quantity

            if new_quantity < already_reserved:
                return Response(
                    {
                        'error': (
                            f'Cannot reduce quantity below reserved amount '
                            f'({already_reserved}).'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            donation.available_quantity = (
                new_quantity - already_reserved
            )

        serializer = DonationSerializer(
            donation,
            data=data,
            partial=True,
            context={'request': request}
        )

        if serializer.is_valid():
            updated = serializer.save(
                available_quantity=donation.available_quantity
            )

            updated.recalculate_status()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteDonationView(APIView):
    """
    Soft-delete donation.
    Cancels reservations and restores quantities.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, donation_id):
        try:
            if request.user.is_staff:
                donation = Donation.objects.get(id=donation_id)
            else:
                donation = Donation.objects.get(
                    id=donation_id,
                    donor=request.user
                )

        except Donation.DoesNotExist:
            return Response(
                {'error': 'Donation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        active_reservations = donation.reservations.filter(
            status__in=['pending', 'confirmed']
        )

        restored_quantity = 0

        for res in active_reservations:
            restored_quantity += res.quantity_confirmed

            res.status = 'cancelled'
            res.save(update_fields=['status'])

            create_notification(
                recipient=res.beneficiary,
                notification_type='reservation_cancelled',
                title='Reservation Cancelled',
                message=f'The donation "{donation.title}" was removed by the donor.',
                related_object_id=res.id
            )

        donation.available_quantity += restored_quantity
        donation.status = 'deleted'

        donation.save(
            update_fields=['available_quantity', 'status']
        )

        return Response(
            {'message': 'Donation deleted successfully.'},
            status=status.HTTP_200_OK
        )


class CompleteDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, donation_id):
        try:
            donation = Donation.objects.get(
                id=donation_id,
                donor=request.user
            )

        except Donation.DoesNotExist:
            return Response(
                {'error': 'Donation not found or not yours.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if donation.status == 'donated':
            return Response(
                {'error': 'Donation is already completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if donation.status == 'expired':
            return Response(
                {'error': 'Cannot complete an expired donation.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not donation.reservations.filter(
            status='confirmed'
        ).exists():
            return Response(
                {
                    'error': (
                        'Cannot complete a donation with no confirmed reservations.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        donation.status = 'donated'
        donation.save(update_fields=['status'])

        Reservation.objects.filter(
            donation=donation,
            status='confirmed'
        ).update(status='completed')

        recalculate_reputation(request.user)

        return Response({
            'message': 'Donation marked as donated. Reputation updated!'
        })


class MyDonationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        donations = Donation.objects.filter(
            donor=request.user
        ).exclude(
            status='deleted'
        ).order_by('-created_at')

        active = donations.filter(status='active')
        expired = donations.filter(status='expired')
        donated = donations.filter(status='donated')

        return Response({
            'active': DonationSerializer(
                active,
                many=True,
                context={'request': request}
            ).data,

            'expired': DonationSerializer(
                expired,
                many=True,
                context={'request': request}
            ).data,

            'donated': DonationSerializer(
                donated,
                many=True,
                context={'request': request}
            ).data,
        })

    def post(self, request):
        """
        Sync donation statuses.
        """

        donations = Donation.objects.filter(
            donor=request.user
        ).exclude(
            status__in=['deleted', 'donated']
        )

        for donation in donations:

            if donation.is_expired():

                donation.status = 'expired'
                donation.save(update_fields=['status'])

                pending = donation.reservations.filter(
                    status='pending'
                )

                for res in pending:
                    donation.available_quantity += res.quantity_confirmed

                    res.status = 'expired'
                    res.save(update_fields=['status'])

                donation.save(update_fields=['available_quantity'])

                continue

            pending_reservations = donation.reservations.filter(
                status='pending'
            )

            for res in pending_reservations:

                if (
                    res.confirmation_deadline and
                    timezone.now() > res.confirmation_deadline
                ):

                    res.status = 'expired'
                    res.save(update_fields=['status'])

                    donation.available_quantity += (
                        res.quantity_confirmed
                    )

                    donation.save(
                        update_fields=['available_quantity']
                    )

            donation.recalculate_status()

        return Response({'message': 'Donations synced.'})


class AvailableDonationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        donations = Donation.objects.filter(
            status='active',
            available_quantity__gt=0
        ).exclude(
            donor=request.user
        )

        # FIX: Previously ALL donations the user had reserved were excluded,
        # which meant the beneficiary could never see the updated remaining
        # quantity for a donation they partially reserved.
        #
        # New behaviour:
        #   • If the user has a PENDING or CONFIRMED reservation for a donation,
        #     include it in the response so they can see the remaining quantity —
        #     but annotate it so the frontend knows they've already reserved it.
        #   • Only hide a donation from the feed if available_quantity has
        #     dropped to 0 (already handled by the filter above).
        #
        # We expose `user_reservation_status` on each serialised item so the
        # frontend can show "You already reserved X of these" instead of the
        # Reserve button.

        ignored_ids = NotInterested.objects.filter(
            user=request.user
        ).values_list('donation_id', flat=True)

        donations = donations.exclude(id__in=ignored_ids)

        # Collect the user's active reservation data keyed by donation id.
        user_active_reservations = {
            str(r.donation_id): r
            for r in Reservation.objects.filter(
                beneficiary=request.user,
                status__in=['pending', 'confirmed']
            ).select_related('donation')
        }

        donor_id = request.query_params.get('donor')
        if donor_id:
            donations = donations.filter(donor_id=donor_id)

        # FIX: category filter — use exact match against backend category choices.
        category = request.query_params.get('category')
        if category:
            donations = donations.filter(category=category)

        # FIX: urgency filter — backend stores 'red' | 'orange' | 'green' | null.
        # Passing urgency=emergency from the frontend was never a valid value.
        # The frontend should send the actual urgency level, or use the
        # has_urgency=true shorthand handled below.
        urgency = request.query_params.get('urgency')
        if urgency:
            donations = donations.filter(urgency=urgency)

        # Shorthand: ?has_urgency=true returns all items that have any urgency set.
        has_urgency = request.query_params.get('has_urgency')
        if has_urgency and has_urgency.lower() == 'true':
            donations = donations.filter(
                urgency__in=['red', 'orange', 'green']
            )

        expiring_soon = request.query_params.get('expiring_soon')
        if expiring_soon:
            from datetime import date
            soon = date.today() + timedelta(days=2)
            donations = donations.filter(expiry_date__lte=soon)

        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        max_km = request.query_params.get('max_km')

        if lat and lng and max_km:
            from geopy.distance import geodesic

            coords = donations.values('id', 'latitude', 'longitude')

            filtered_ids = [
                d['id']
                for d in coords
                if geodesic(
                    (float(lat), float(lng)),
                    (d['latitude'], d['longitude'])
                ).km <= float(max_km)
            ]

            donations = donations.filter(id__in=filtered_ids)

        serializer = DonationSerializer(
            donations,
            many=True,
            context={'request': request}
        )

        data = serializer.data

        # Annotate each donation with the user's own reservation info so the
        # frontend can render the correct state (e.g. "Already reserved 2").
        for item in data:
            donation_id = str(item.get('id'))
            reservation = user_active_reservations.get(donation_id)
            if reservation:
                item['user_reservation'] = {
                    'id': reservation.id,
                    'status': reservation.status,
                    'quantity': reservation.quantity_confirmed,
                }
            else:
                item['user_reservation'] = None

        return Response(data)


class PublicDonationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, donation_id):
        try:
            donation = Donation.objects.exclude(
                status='deleted'
            ).get(id=donation_id)

        except Donation.DoesNotExist:
            return Response(
                {'error': 'Donation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = DonationSerializer(
            donation,
            context={'request': request}
        )

        return Response(serializer.data)


class DonationReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id)

        except Donation.DoesNotExist:
            return Response(
                {'error': 'Donation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user

        is_donor = donation.donor == user

        is_beneficiary = Reservation.objects.filter(
            donation=donation,
            beneficiary=user
        ).exists()

        if not is_donor and not is_beneficiary:
            return Response(
                {'error': 'Not authorized.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if is_beneficiary and not is_donor:

            reservations = Reservation.objects.filter(
                donation=donation,
                beneficiary=user
            ).order_by('-created_at')

        else:
            reservations = Reservation.objects.filter(
                donation=donation
            ).order_by('-created_at')

        serializer = ReservationSerializer(
            reservations,
            many=True,
            context={'request': request}
        )

        return Response({
            'donation': donation.title,
            'total_quantity': donation.quantity,
            # FIX: Always return the live available_quantity so the beneficiary
            # (who is also part of this conversation) sees the correct remainder.
            'available_quantity': donation.available_quantity,
            'reservations': serializer.data,
        })


# ─────────────────────────────────────────────
# RESERVATIONS
# ─────────────────────────────────────────────

class ReserveDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, donation_id):

        if not request.user.is_verified:

            reservation_count = Reservation.objects.filter(
                beneficiary=request.user
            ).exclude(
                status__in=[
                    'cancelled',
                    'rejected',
                    'expired'
                ]
            ).count()

            if reservation_count >= 2:
                return Response(
                    {
                        'error': (
                            'Unverified users can only make 2 reservations.'
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        try:
            with transaction.atomic():

                donation = Donation.objects.select_for_update().get(
                    id=donation_id,
                    status='active',
                    available_quantity__gt=0,
                )

        except Donation.DoesNotExist:
            return Response(
                {'error': 'Donation not available.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if donation.donor == request.user:
            return Response(
                {'error': 'You cannot reserve your own donation.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        already_reserved = Reservation.objects.filter(
            donation=donation,
            beneficiary=request.user,
            status__in=['pending', 'confirmed']
        ).exists()

        if already_reserved:
            return Response(
                {
                    'error': (
                        'You already have an active reservation '
                        'for this donation.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        quantity_requested = int(
            request.data.get('quantity_requested', 1)
        )

        if (
            quantity_requested <= 0 or
            quantity_requested > donation.available_quantity
        ):
            return Response(
                {'error': 'Invalid quantity requested.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        donation.available_quantity -= quantity_requested

        donation.save(update_fields=['available_quantity'])

        donation.recalculate_status()

        reservation = Reservation.objects.create(
            donation=donation,
            beneficiary=request.user,
            quantity_requested=quantity_requested,
            quantity_confirmed=quantity_requested,
            status='pending',
            confirmation_deadline=timezone.now() + timedelta(hours=2),
        )

        from apps.chat.models import Conversation

        conversation, _ = Conversation.objects.get_or_create(
            donation=donation,
            beneficiary=request.user,
            defaults={'donor': donation.donor}
        )

        create_notification(
            recipient=donation.donor,
            notification_type='new_reservation',
            title='New Reservation!',
            message=(
                f'{request.user.username} wants '
                f'{quantity_requested} {donation.unit} '
                f'of your "{donation.title}"'
            ),
            related_object_id=reservation.id
        )

        serializer = ReservationSerializer(
            reservation,
            context={'request': request}
        )

        return Response({
            'message': (
                'Reservation request sent! '
                'Waiting for donor to confirm.'
            ),
            'reservation': serializer.data,
            'conversation_id': conversation.id,
        }, status=status.HTTP_201_CREATED)


class ConfirmReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):

        try:
            reservation = Reservation.objects.select_related(
                'donation'
            ).get(
                id=reservation_id,
                donation__donor=request.user
            )

        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Reservation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if reservation.status != 'pending':
            return Response(
                {'error': 'Reservation is not pending.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if (
            reservation.confirmation_deadline and
            timezone.now() > reservation.confirmation_deadline
        ):

            reservation.status = 'expired'
            reservation.save(update_fields=['status'])

            donation = reservation.donation

            donation.available_quantity += (
                reservation.quantity_confirmed
            )

            donation.save(update_fields=['available_quantity'])

            donation.recalculate_status()

            return Response(
                {
                    'error': (
                        'Confirmation deadline has passed. '
                        'Reservation expired.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        reservation.status = 'confirmed'
        reservation.save(update_fields=['status'])

        reservation.donation.recalculate_status()

        recalculate_reputation(request.user)

        create_notification(
            recipient=reservation.beneficiary,
            notification_type='reservation_confirmed',
            title='Reservation Confirmed!',
            message=(
                f'Your reservation for '
                f'"{reservation.donation.title}" '
                f'has been confirmed!'
            ),
            related_object_id=reservation.id
        )

        return Response({
            'message': 'Reservation confirmed successfully.'
        })


class RejectReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):

        try:
            reservation = Reservation.objects.select_related(
                'donation'
            ).get(
                id=reservation_id,
                donation__donor=request.user
            )

        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Reservation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if reservation.status != 'pending':
            return Response(
                {'error': 'Reservation is not pending.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        donation = reservation.donation

        donation.available_quantity += (
            reservation.quantity_confirmed
        )

        donation.save(update_fields=['available_quantity'])

        reservation.status = 'rejected'
        reservation.save(update_fields=['status'])

        donation.recalculate_status()

        create_notification(
            recipient=reservation.beneficiary,
            notification_type='reservation_rejected',
            title='Reservation Rejected',
            message=(
                f'Your reservation for '
                f'"{donation.title}" was rejected.'
            ),
            related_object_id=reservation.id
        )

        return Response({
            'message': 'Reservation rejected successfully.'
        })


class CancelReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):

        try:
            reservation = Reservation.objects.select_related(
                'donation'
            ).get(
                id=reservation_id,
                beneficiary=request.user
            )

        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Reservation not found or not yours.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if reservation.status in ['cancelled', 'completed']:
            return Response(
                {
                    'error': (
                        f'Cannot cancel a '
                        f'{reservation.status} reservation.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        donation = reservation.donation

        if reservation.status in ['pending', 'confirmed']:

            donation.available_quantity += (
                reservation.quantity_confirmed
            )

            donation.save(update_fields=['available_quantity'])

            donation.recalculate_status()

        reservation.status = 'cancelled'

        reservation.save(update_fields=['status'])

        return Response({
            'message': 'Reservation cancelled successfully.'
        })


class MyReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        incoming = Reservation.objects.filter(
            donation__donor=request.user
        ).select_related(
            'donation',
            'beneficiary'
        ).order_by('-created_at')

        my_requests = Reservation.objects.filter(
            beneficiary=request.user
        ).select_related(
            'donation',
            'donation__donor'
        ).order_by('-created_at')

        return Response({
            'incoming': {
                'pending': ReservationSerializer(
                    incoming.filter(status='pending'),
                    many=True,
                    context={'request': request}
                ).data,

                'confirmed': ReservationSerializer(
                    incoming.filter(status='confirmed'),
                    many=True,
                    context={'request': request}
                ).data,

                'rejected': ReservationSerializer(
                    incoming.filter(
                        status__in=[
                            'rejected',
                            'cancelled',
                            'expired'
                        ]
                    ),
                    many=True,
                    context={'request': request}
                ).data,
            },

            'my_requests': {
                'pending': ReservationSerializer(
                    my_requests.filter(status='pending'),
                    many=True,
                    context={'request': request}
                ).data,

                'confirmed': ReservationSerializer(
                    my_requests.filter(status='confirmed'),
                    many=True,
                    context={'request': request}
                ).data,

                'rejected': ReservationSerializer(
                    my_requests.filter(
                        status__in=[
                            'rejected',
                            'cancelled',
                            'expired'
                        ]
                    ),
                    many=True,
                    context={'request': request}
                ).data,
            }
        })


class MyReceivedReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        reservations = Reservation.objects.filter(
            donation__donor=request.user
        ).order_by('-created_at')

        serializer = ReservationSerializer(
            reservations,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)


# ─────────────────────────────────────────────
# NOT INTERESTED
# ─────────────────────────────────────────────

class NotInterestedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, donation_id):

        try:
            donation = Donation.objects.exclude(
                status='deleted'
            ).get(id=donation_id)

        except Donation.DoesNotExist:
            return Response(
                {'error': 'Donation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if donation.donor == request.user:
            return Response(
                {
                    'error': (
                        'Cannot mark your own donation '
                        'as not interested.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        obj, created = NotInterested.objects.get_or_create(
            user=request.user,
            donation=donation
        )

        if not created:
            return Response({
                'message': 'Already marked as not interested.'
            })

        return Response(
            {'message': 'Donation hidden from your feed.'},
            status=status.HTTP_201_CREATED
        )

    def delete(self, request, donation_id):

        deleted, _ = NotInterested.objects.filter(
            user=request.user,
            donation_id=donation_id
        ).delete()

        if deleted:
            return Response({
                'message': 'Donation restored to your feed.'
            })

        return Response(
            {'error': 'No record found.'},
            status=status.HTTP_404_NOT_FOUND
        )


# ─────────────────────────────────────────────
# ADMIN
# ─────────────────────────────────────────────

class AdminAllDonationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not hasattr(user, 'role') or user.role not in ['admin', 'localauthority']:
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        donations = Donation.objects.all().order_by('-created_at')

        status_filter = request.query_params.get('status')
        category = request.query_params.get('category')
        urgency = request.query_params.get('urgency')

        if status_filter:
            donations = donations.filter(status=status_filter)

        if category:
            donations = donations.filter(category=category)

        if urgency:
            donations = donations.filter(urgency=urgency)

        serializer = DonationSerializer(
            donations,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)


class AdminStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not hasattr(user, 'role') or user.role not in ['admin', 'localauthority']:
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        today = now()

        first_of_month = today.replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )

        seven_months_ago = (
            today.replace(day=1) - timedelta(days=6 * 30)
        ).replace(day=1)

        thirty_days_ago = today - timedelta(days=30)

        MONTH_ABBR = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]

        total_donations = Donation.objects.exclude(
            status='deleted'
        ).count()

        donations_this_month = Donation.objects.exclude(
            status='deleted'
        ).filter(
            created_at__gte=first_of_month
        ).count()

        donated_all = Donation.objects.filter(status='donated')
        total_food_saved = round(
            sum(d.quantity_in_kg() for d in donated_all), 1
        )

        total_co2_avoided = round(
            sum(d.co2_avoided_kg() for d in donated_all), 1
        )

        from django.contrib.auth import get_user_model
        User = get_user_model()

        active_users = User.objects.filter(
            is_active=True
        ).filter(
            models.Q(donations__created_at__gte=thirty_days_ago) |
            models.Q(reservations__created_at__gte=thirty_days_ago)
        ).distinct().count()

        donated_this_month = Donation.objects.filter(
            status='donated',
            updated_at__gte=first_of_month
        )
        this_month_food_saved = round(
            sum(d.quantity_in_kg() for d in donated_this_month), 1
        )
        this_month_co2 = round(
            sum(d.co2_avoided_kg() for d in donated_this_month), 1
        )

        donations_by_month = (
            Donation.objects
            .exclude(status='deleted')
            .filter(created_at__gte=seven_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(value=Count('id'))
            .order_by('month')
        )

        donations_chart = [
            {
                'month': MONTH_ABBR[entry['month'].month - 1],
                'value': entry['value'] or 0
            }
            for entry in donations_by_month
        ]

        from collections import defaultdict

        food_month_raw = Donation.objects.filter(
            status='donated',
            updated_at__gte=seven_months_ago
        ).values('updated_at__year', 'updated_at__month', 'quantity', 'unit', 'category')

        month_food = defaultdict(float)
        month_co2  = defaultdict(float)

        for d in food_month_raw:
            key     = (d['updated_at__year'], d['updated_at__month'])
            unit    = (d['unit'] or '').lower().strip()
            factor  = Donation.UNIT_TO_KG.get(unit, 0.3)
            kg      = d['quantity'] * factor
            co2_f   = Donation.CATEGORY_CO2_FACTOR.get(d['category'], 2.5)

            month_food[key] += kg
            month_co2[key]  += kg * co2_f

        food_chart = [
            {
                'month': MONTH_ABBR[month - 1],
                'value': round(val, 1)
            }
            for (year, month), val in sorted(month_food.items())
        ]

        co2_chart = [
            {
                'month': MONTH_ABBR[month - 1],
                'value': round(val, 1)
            }
            for (year, month), val in sorted(month_co2.items())
        ]

        return Response({
            'generalStats': {
                'totalDonations':         total_donations,
                'donationsAddedThisMonth': donations_this_month,
                'totalFoodSaved':         total_food_saved,
                'totalCo2Avoided':        total_co2_avoided,
                'activeUsers':            active_users,
                'thisMonthDonations':     donations_this_month,
                'thisMonthFoodSaved':     this_month_food_saved,
                'thisMonthCo2':           this_month_co2,
            },
            'charts': {
                'donations': donations_chart,
                'foodSaved': food_chart,
                'co2':       co2_chart,
            }
        })


# ─────────────────────────────────────────────
# RATINGS
# ─────────────────────────────────────────────

class RateReservationView(APIView):
    """
    POST /donations/reservations/<reservation_id>/rate/
    Body: { "score": 4 }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):

        score = request.data.get('score')

        try:
            score = int(score)
        except (TypeError, ValueError):
            return Response(
                {'error': 'Score must be an integer between 1 and 5.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not (1 <= score <= 5):
            return Response(
                {'error': 'Score must be between 1 and 5.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            reservation = Reservation.objects.select_related(
                'donation__donor',
                'beneficiary',
            ).get(id=reservation_id)
        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Reservation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user

        if user.id == reservation.beneficiary_id:
            rated_user = reservation.donation.donor
        elif user.id == reservation.donation.donor_id:
            rated_user = reservation.beneficiary
        else:
            return Response(
                {'error': 'You are not part of this reservation.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Safety net: if rated_user is somehow still None, reject early
        if rated_user is None:
            return Response(
                {'error': 'Could not determine the user to rate.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Rating.objects.filter(reservation=reservation, rater=user).exists():
            return Response(
                {'error': 'You have already rated this reservation.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        Rating.objects.create(
            reservation=reservation,
            rater=user,
            rated_user=rated_user,
            score=score,
        )

        recalculate_reputation(rated_user)

        avg = Rating.objects.filter(
            rated_user=rated_user
        ).aggregate(avg=Avg('score'))['avg'] or 0

        return Response({
            'message': (
                f'Rating submitted successfully. '
                f'{rated_user.username} now has a score of {round(avg, 1)}/5.'
            )
        })

class ReservationByConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        from apps.chat.models import Conversation

        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        reservation = Reservation.objects.filter(
            donation=conversation.donation,
            beneficiary=conversation.beneficiary,
        ).order_by('-created_at').first()

        if not reservation:
            return Response(
                {'error': 'No reservation linked to this conversation.'},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user
        if user not in [reservation.beneficiary, reservation.donation.donor]:
            return Response(
                {'error': 'Forbidden.'},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response({'id': reservation.id})