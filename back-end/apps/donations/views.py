from django.utils import timezone
from datetime import timedelta
from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.utils import create_notification
from .models import Donation, Reservation, NotInterested
from .serializers import DonationSerializer, ReservationSerializer

from django.utils.timezone import now


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
        ).count()

        if not request.user.is_verified:
            if donations_today >= 1:
                return Response(
                    {'error': 'Unverified users can only make 1 donation per day. Get verified to unlock full access.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            if donations_today >= 5:
                return Response(
                    {'error': 'You have reached the maximum of 5 donations for today.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = DonationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            donation = serializer.save(donor=request.user)

            # ✅ Notify nearby users and food savers
            from apps.notifications.utils import (
                notify_nearby_users_new_donation,
                notify_nearby_food_savers,
                notify_urgent_donation
            )
            notify_nearby_users_new_donation(donation)
            notify_nearby_food_savers(donation)
            notify_urgent_donation(donation)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class EditDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id, donor=request.user)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found or not yours.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.status in ['completed', 'expired']:
            return Response(
                {'error': f'Cannot edit a {donation.status} donation.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        allowed_fields = [
            'title', 'description', 'expiry_date', 'pickup_address',
            'latitude', 'longitude', 'urgency', 'image',
            'quantity', 'unit', 'category'
        ]
        data = {k: v for k, v in request.data.items() if k in allowed_fields}

        # if quantity is increased, add the difference to available_quantity
        if 'quantity' in data:
            new_quantity = int(data['quantity'])
            if new_quantity < donation.quantity:
                return Response(
                    {'error': 'Cannot reduce total quantity below original.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            diff = new_quantity - donation.quantity
            donation.available_quantity += diff

        serializer = DonationSerializer(donation, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save(available_quantity=donation.available_quantity)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id, donor=request.user)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found or not yours.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.reservations.filter(status__in=['pending', 'confirmed']).exists():
            return Response(
                {'error': 'Cannot delete donation with active reservations.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        donation.delete()
        return Response({'message': 'Donation deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class CompleteDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id, donor=request.user)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found or not yours.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.status == 'completed':
            return Response({'error': 'Donation is already completed.'}, status=status.HTTP_400_BAD_REQUEST)

        if donation.status == 'expired':
            return Response({'error': 'Cannot complete an expired donation.'}, status=status.HTTP_400_BAD_REQUEST)

        # BUG FIX: guard — must have at least one confirmed reservation
        if not donation.reservations.filter(status='confirmed').exists():
            return Response(
                {'error': 'Cannot complete a donation with no confirmed reservations.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        donation.status = 'completed'
        donation.save()
        Reservation.objects.filter(donation=donation, status='confirmed').update(status='completed')
        request.user.reputation_score += 10
        request.user.save()
        return Response({'message': 'Donation marked as completed. +10 reputation!'})


class MyDonationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # BUG FIX: pure read — no DB writes here anymore
        donations = Donation.objects.filter(donor=request.user).order_by('-created_at')
        active = donations.filter(status__in=['available', 'reserved'])
        expired = donations.filter(status='expired')
        donated = donations.filter(status='completed')
        return Response({
            'active': DonationSerializer(active, many=True, context={'request': request}).data,
            'expired': DonationSerializer(expired, many=True, context={'request': request}).data,
            'donated': DonationSerializer(donated, many=True, context={'request': request}).data,
        })

    def post(self, request):
        # Call POST /my-donations/ to trigger expiry + deadline sync
        donations = Donation.objects.filter(donor=request.user)
        for donation in donations:
            if donation.expiry_date and donation.is_expired():
                if donation.status in ['available', 'reserved']:
                    donation.status = 'expired'
                    donation.save(update_fields=['status'])
                    donation.reservations.filter(status='pending').update(status='cancelled')
                continue

            pending_reservations = donation.reservations.filter(status='pending')
            for res in pending_reservations:
                if res.confirmation_deadline and timezone.now() > res.confirmation_deadline:
                    res.status = 'cancelled'
                    res.save(update_fields=['status'])
                    donation.available_quantity += res.quantity_requested
                    donation.save(update_fields=['available_quantity'])

            if donation.available_quantity <= 0 and donation.status != 'completed':
                donation.status = 'reserved'
            elif donation.available_quantity > 0 and donation.status not in ['completed', 'expired']:
                donation.status = 'available'
            donation.save(update_fields=['status', 'available_quantity'])

        return Response({'message': 'Donations synced.'})


class AvailableDonationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Base: only available donations
        donations = Donation.objects.filter(status='available')

        #  exclude own donations
        donations = donations.exclude(donor=request.user)
        #exclude donations user already has an active reservation on
        reserved_ids = Reservation.objects.filter(
            beneficiary=request.user
        ).exclude(status__in=['cancelled', 'rejected']).values_list('donation_id', flat=True)
        donations = donations.exclude(id__in=reserved_ids)

        # NEW: exclude not-interested donations
        ignored_ids = NotInterested.objects.filter(
            user=request.user
        ).values_list('donation_id', flat=True)
        donations = donations.exclude(id__in=ignored_ids)

        # Filter by category
        category = request.query_params.get('category')
        if category:
            donations = donations.filter(category=category)

        # Filter by urgency
        urgency = request.query_params.get('urgency')
        if urgency:
            donations = donations.filter(urgency=urgency)

        # Filter by expiry — "expiring_soon" = within 2 days
        expiring_soon = request.query_params.get('expiring_soon')
        if expiring_soon:
            from datetime import date, timedelta
            soon = date.today() + timedelta(days=2)
            donations = donations.filter(expiry_date__lte=soon)

        # BUG FIX: distance filter — use .values() to avoid loading full objects into memory
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        max_km = request.query_params.get('max_km')
        if lat and lng and max_km:
            from geopy.distance import geodesic
            coords = donations.values('id', 'latitude', 'longitude')
            filtered_ids = [
                d['id'] for d in coords
                if geodesic((float(lat), float(lng)), (d['latitude'], d['longitude'])).km <= float(max_km)
            ]
            donations = donations.filter(id__in=filtered_ids)

        serializer = DonationSerializer(donations, many=True, context={'request': request})
        return Response(serializer.data)


class PublicDonationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DonationSerializer(donation, context={'request': request})
        return Response(serializer.data)


class DonationReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id, donor=request.user)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found or not yours.'}, status=status.HTTP_404_NOT_FOUND)

        reservations = Reservation.objects.filter(donation=donation).order_by('-created_at')
        serializer = ReservationSerializer(reservations, many=True, context={'request': request})
        return Response({
            'donation': donation.title,
            'total_quantity': donation.quantity,
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
            ).exclude(status__in=['cancelled', 'rejected', 'expired']).count()
            if reservation_count >= 2:
                return Response(
                    {'error': 'Unverified users can only make 2 reservations. Get verified to unlock full access.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        try:
            with transaction.atomic():
                donation = Donation.objects.select_for_update().get(id=donation_id, status='available')
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not available.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.donor == request.user:
            return Response({'error': 'You cannot reserve your own donation.'}, status=status.HTTP_400_BAD_REQUEST)

        quantity_requested = int(request.data.get('quantity_requested', 1))

        if quantity_requested > donation.available_quantity or quantity_requested <= 0:
            return Response({'error': 'Invalid quantity requested.'}, status=status.HTTP_400_BAD_REQUEST)

        reservation = Reservation.objects.create(
            donation=donation,
            beneficiary=request.user,
            quantity_requested=quantity_requested,
            status='pending',
            confirmation_deadline=timezone.now() + timedelta(hours=2),
        )

        donation.available_quantity -= quantity_requested
        if donation.available_quantity <= 0:
            donation.status = 'reserved'
        donation.save()

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
            message=f'{request.user.username} reserved {quantity_requested} {donation.unit} of your "{donation.title}"',
            related_object_id=reservation.id
        )

        serializer = ReservationSerializer(reservation, context={'request': request})
        return Response({
            'message': 'Reservation created successfully!',
            'reservation': serializer.data,
            'conversation_id': conversation.id,
        }, status=status.HTTP_201_CREATED)


class ConfirmReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):
        try:
            reservation = Reservation.objects.get(id=reservation_id, donation__donor=request.user)
        except Reservation.DoesNotExist:
            return Response({'error': 'Reservation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if reservation.status != 'pending':
            return Response({'error': 'Reservation is not pending.'}, status=status.HTTP_400_BAD_REQUEST)

        if reservation.confirmation_deadline and timezone.now() > reservation.confirmation_deadline:
            reservation.status = 'cancelled'
            reservation.save()
            donation = reservation.donation
            donation.available_quantity += reservation.quantity_requested
            if donation.status == 'reserved':
                donation.status = 'available'
            donation.save()
            return Response(
                {'error': 'Confirmation deadline has passed. Reservation cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservation.status = 'confirmed'
        reservation.save()

        
        donor = reservation.donation.donor
        donor.reputation_score += 10
        donor.save()

        create_notification(
            recipient=reservation.beneficiary,
            notification_type='reservation_confirmed',
            title='Reservation Confirmed!',
            message=f'Your reservation for "{reservation.donation.title}" has been confirmed!',
            related_object_id=reservation.id
        )

        return Response({'message': 'Reservation confirmed successfully.'})
class RejectReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):
        try:
            reservation = Reservation.objects.get(id=reservation_id, donation__donor=request.user)
        except Reservation.DoesNotExist:
            return Response({'error': 'Reservation not found.'}, status=status.HTTP_404_NOT_FOUND)
        if reservation.status != 'pending':
            return Response({'error': 'Reservation is not pending.'}, status=status.HTTP_400_BAD_REQUEST)

        donation = reservation.donation
        donation.available_quantity += reservation.quantity_requested
        if donation.status == 'reserved':
            donation.status = 'available'
        donation.save()

        reservation.status = 'rejected'
        reservation.save()

        create_notification(
            recipient=reservation.beneficiary,
            notification_type='reservation_rejected',
            title='Reservation Rejected',
            message=f'Your reservation for "{reservation.donation.title}" was rejected.',
            related_object_id=reservation.id
        )

        return Response({'message': 'Reservation rejected successfully.'})


class CancelReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):
        try:
            reservation = Reservation.objects.get(id=reservation_id, beneficiary=request.user)
        except Reservation.DoesNotExist:
            return Response({'error': 'Reservation not found or not yours.'}, status=status.HTTP_404_NOT_FOUND)

        if reservation.status in ['cancelled', 'completed']:
            return Response(
                {'error': f'Cannot cancel a {reservation.status} reservation.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        donation = reservation.donation
        donation.available_quantity += reservation.quantity_requested
        if donation.status == 'reserved':
            donation.status = 'available'
        donation.save()

        reservation.status = 'cancelled'
        reservation.save()

        return Response({'message': 'Reservation cancelled successfully.'})
    

    

class MyReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        incoming = Reservation.objects.filter(
            donation__donor=request.user
        ).select_related('donation', 'beneficiary').order_by('-created_at')

        my_requests = Reservation.objects.filter(
            beneficiary=request.user
        ).select_related('donation', 'donation__donor').order_by('-created_at')

        return Response({
            'incoming': {
                'pending': ReservationSerializer(incoming.filter(status='pending'), many=True, context={'request': request}).data,
                'confirmed': ReservationSerializer(incoming.filter(status='confirmed'), many=True, context={'request': request}).data,
                'rejected': ReservationSerializer(incoming.filter(status__in=['rejected', 'cancelled']), many=True, context={'request': request}).data,
            },
            'my_requests': {
                'pending': ReservationSerializer(my_requests.filter(status='pending'), many=True, context={'request': request}).data,
                'confirmed': ReservationSerializer(my_requests.filter(status='confirmed'), many=True, context={'request': request}).data,
                'rejected': ReservationSerializer(my_requests.filter(status__in=['rejected', 'cancelled']), many=True, context={'request': request}).data,
            }
        })
class MyReceivedReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reservations = Reservation.objects.filter(
            donation__donor=request.user
        ).order_by('-created_at')
        serializer = ReservationSerializer(reservations, many=True, context={'request': request})
        return Response(serializer.data)


# ─────────────────────────────────────────────
# NOT INTERESTED
# ─────────────────────────────────────────────

class NotInterestedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.donor == request.user:
            return Response(
                {'error': 'Cannot mark your own donation as not interested.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        obj, created = NotInterested.objects.get_or_create(user=request.user, donation=donation)
        if not created:
            return Response({'message': 'Already marked as not interested.'})
        return Response({'message': 'Donation hidden from your feed.'}, status=status.HTTP_201_CREATED)

    def delete(self, request, donation_id):
        deleted, _ = NotInterested.objects.filter(
            user=request.user, donation_id=donation_id
        ).delete()
        if deleted:
            return Response({'message': 'Donation restored to your feed.'})
        return Response({'error': 'No record found.'}, status=status.HTTP_404_NOT_FOUND)