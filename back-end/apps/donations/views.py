from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from django.db import transaction

from apps.notifications.utils import create_notification

from .models import Donation, Reservation
from .serializers import DonationSerializer, ReservationSerializer


class CreateDonationView(APIView):
   
    permission_classes = [IsAuthenticated]

    def post(self, request):
         if not request.user.is_verified:
            donation_count = Donation.objects.filter(donor=request.user).count()
            if donation_count >= 2:
                return Response(
                    {'error': 'Unverified users can only make 2 donations. Get verified by a Food Saver to unlock full access.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer = DonationSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(donor=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyDonationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        donations = Donation.objects.filter(donor=request.user).order_by('-created_at')

        for donation in list(donations):
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

        active = donations.filter(status__in=['available', 'reserved'])
        expired = donations.filter(status='expired')
        donated = donations.filter(status='completed')

        return Response({
            'active': DonationSerializer(active, many=True, context={'request': request}).data,
            'expired': DonationSerializer(expired, many=True, context={'request': request}).data,
            'donated': DonationSerializer(donated, many=True, context={'request': request}).data,
        })


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


class ReserveDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, donation_id):
        if not request.user.is_verified:
            reservation_count = Reservation.objects.filter(
                beneficiary=request.user
            ).exclude(status__in=['cancelled', 'rejected', 'expired']).count()
            if reservation_count >= 2:
                return Response(
                    {'error': 'Unverified users can only make 2 reservations. Get verified by a Food Saver to unlock full access.'},
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
            title='New Reservation! ',
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
            return Response({'error': 'Confirmation deadline has passed. Reservation cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        reservation.status = 'confirmed'
        reservation.save()

        create_notification(
            recipient=reservation.beneficiary,
            notification_type='reservation_confirmed',
            title='Reservation Confirmed! ',
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
            title='Reservation Rejected ',
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
            return Response({'error': f'Cannot cancel a {reservation.status} reservation.'}, status=status.HTTP_400_BAD_REQUEST)

        donation = reservation.donation
        donation.available_quantity += reservation.quantity_requested
        if donation.status == 'reserved':
            donation.status = 'available'
        donation.save()

        reservation.status = 'cancelled'
        reservation.save()

        return Response({'message': 'Reservation cancelled successfully.'})


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

        donation.status = 'completed'
        donation.save()

        Reservation.objects.filter(donation=donation, status='confirmed').update(status='completed')

        request.user.reputation_score += 10
        request.user.save()

        return Response({'message': 'Donation marked as completed. +10 reputation!'})

class DeleteDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id, donor=request.user)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found or not yours.'}, status=status.HTTP_404_NOT_FOUND)

        
        if donation.reservations.filter(status__in=['pending', 'confirmed']).exists():
            return Response({'error': 'Cannot delete donation with active reservations.'}, status=status.HTTP_400_BAD_REQUEST)

        donation.delete()
        return Response({'message': 'Donation deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
class AvailableDonationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        donations = Donation.objects.filter(status='available')

        category = request.query_params.get('category')
        if category:
            donations = donations.filter(category=category)

        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        max_km = request.query_params.get('max_km')
        if lat and lng and max_km:
            from geopy.distance import geodesic
            filtered = []
            for d in donations:
                dist = geodesic((float(lat), float(lng)), (d.latitude, d.longitude)).km
                if dist <= float(max_km):
                    filtered.append(d.id)
            donations = donations.filter(id__in=filtered)

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
            'reservations': serializer.data
        })


class MyReceivedReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reservations = Reservation.objects.filter(donation__donor=request.user).order_by('-created_at')
        serializer = ReservationSerializer(reservations, many=True, context={'request': request})
        return Response(serializer.data)