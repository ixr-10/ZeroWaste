from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta

from .models import Donation, Reservation
from .serializers import DonationSerializer, ReservationSerializer


class CreateDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DonationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(donor=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyDonationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        donations = Donation.objects.filter(donor=request.user).order_by('-created_at')
        for donation in donations:
            if donation.is_expired() and donation.status == 'available':
                donation.status = 'expired'
                donation.save()
        serializer = DonationSerializer(donations, many=True, context={'request': request})
        return Response(serializer.data)


class DonationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, donation_id, user):
        try:
            return Donation.objects.get(id=donation_id, donor=user)
        except Donation.DoesNotExist:
            return None

    def put(self, request, donation_id):
        donation = self.get_object(donation_id, request.user)
        if not donation:
            return Response({'error': 'Donation not found or not yours.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = DonationSerializer(donation, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, donation_id):
        donation = self.get_object(donation_id, request.user)
        if not donation:
            return Response({'error': 'Donation not found or not yours.'}, status=status.HTTP_404_NOT_FOUND)
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
            return Response({'error': 'Donation is already completed.'})

        if donation.status == 'expired':
            return Response({'error': 'Cannot complete an expired donation.'}, status=status.HTTP_400_BAD_REQUEST)

        donation.status = 'completed'
        donation.save()

        Reservation.objects.filter(donation=donation, status='confirmed').update(status='completed')

        request.user.reputation_score += 10
        request.user.save()

        return Response({'message': 'Donation marked as completed. +10 reputation!'})


class AvailableDonationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        donations = Donation.objects.filter(status='available')

        category = request.query_params.get('category')
        if category:
            donations = donations.filter(category=category)

        expiry_before = request.query_params.get('expiry_before')
        if expiry_before:
            donations = donations.filter(expiry_date__lte=expiry_before)

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

class MyReceivedReservationsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        reservations = Reservation.objects.filter(
            donation__donor=request.user
        ).order_by('-created_at')
        serializer = ReservationSerializer(reservations, many=True, context={'request': request})
        return Response(serializer.data)

class ReserveDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id, status='available')
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not available.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.donor == request.user:
            return Response({'error': 'You cannot reserve your own donation.'}, status=status.HTTP_400_BAD_REQUEST)

        # Limit for unverified users
        if not request.user.is_verified:
            today = timezone.now().date()
            daily_count = Reservation.objects.filter(
                beneficiary=request.user,
                created_at__date=today
            ).count()
            if daily_count >= 2:
                return Response(
                    {'error': 'Unverified users can only make 2 reservations per day.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        quantity_requested = int(request.data.get('quantity_requested', 1))

        if quantity_requested > donation.available_quantity:
            return Response({'error': 'Not enough quantity available.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create reservation
        reservation = Reservation.objects.create(
            donation=donation,
            beneficiary=request.user,
            quantity_requested=quantity_requested,
            status='pending',
            confirmation_deadline=timezone.now() + timedelta(hours=2)
        )

        # Update donation
        donation.available_quantity -= quantity_requested
        if donation.available_quantity == 0:
            donation.status = 'reserved'
        donation.save()

        # Create/Get conversation
        from apps.chat.models import Conversation

        conversation, created = Conversation.objects.get_or_create(
            donation=donation,
            beneficiary=request.user,
            defaults={'donor': donation.donor}
        )

        serializer = ReservationSerializer(reservation, context={'request': request})

        return Response({
            "message": "Reservation created successfully!",
            "reservation": serializer.data,
            "conversation_id": conversation.id,
            "conversation_created": created
        }, status=status.HTTP_201_CREATED)

class ConfirmReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):
        try:
            reservation = Reservation.objects.get(
                id=reservation_id,
                donation__donor=request.user
            )
        except Reservation.DoesNotExist:
            return Response({'error': 'Reservation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if reservation.status != 'pending':
            return Response({'error': 'Reservation is not pending.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if deadline passed
        if reservation.confirmation_deadline and timezone.now() > reservation.confirmation_deadline:
            reservation.status = 'cancelled'
            reservation.save()
            # Restore quantity
            donation = reservation.donation
            donation.available_quantity += reservation.quantity_requested
            if donation.status == 'reserved':
                donation.status = 'available'
            donation.save()
            return Response(
                {'error': 'Confirmation deadline passed. Reservation has been cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservation.status = 'confirmed'
        reservation.save()
        return Response({'message': 'Reservation confirmed successfully.'})


# ── FIX 2: Donor rejects reservation ──
class RejectReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):
        try:
            reservation = Reservation.objects.get(
                id=reservation_id,
                donation__donor=request.user
            )
        except Reservation.DoesNotExist:
            return Response({'error': 'Reservation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if reservation.status != 'pending':
            return Response({'error': 'Reservation is not pending.'}, status=status.HTTP_400_BAD_REQUEST)

        # Restore quantity
        donation = reservation.donation
        donation.available_quantity += reservation.quantity_requested
        if donation.status == 'reserved':
            donation.status = 'available'
        donation.save()

        reservation.status = 'cancelled'
        reservation.save()
        return Response({'message': 'Reservation rejected.'})


# ── View pending reservations on my donations (donor) ──
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


class MyReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reservations = Reservation.objects.filter(
            beneficiary=request.user
        ).order_by('-created_at')

        serializer = ReservationSerializer(reservations, many=True, context={'request': request})
        return Response(serializer.data)