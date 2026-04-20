from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta

from .models import Donation, Reservation
from .serializers import DonationSerializer, ReservationSerializer


# ====================== CREATE DONATION ======================
class CreateDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DonationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(donor=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ====================== MY DONATIONS (Donor Profile) ======================
class MyDonationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        donations = Donation.objects.filter(donor=request.user).order_by('-created_at')

        for donation in donations:

            # ---------- 1. EXPIRY CHECK ----------
            if donation.expiry_date and donation.is_expired():
                if donation.status in ['available', 'reserved']:
                    donation.status = 'expired'
                    donation.save(update_fields=['status'])

                    donation.reservations.filter(status='pending').update(status='expired')
                continue

            # ---------- 2. HANDLE PENDING RESERVATIONS ----------
            pending_reservations = donation.reservations.filter(status='pending')

            for res in pending_reservations:
                if res.is_expired:
                    res.status = 'expired'
                    res.save(update_fields=['status'])

                    # restore quantity
                    donation.available_quantity += res.quantity_requested
                    donation.save(update_fields=['available_quantity'])

            # ---------- 3. FIX STATUS (STRICT LOGIC) ----------
            if donation.available_quantity == 0:
                donation.status = 'reserved'   # NOT completed yet
            elif donation.available_quantity > 0:
                donation.status = 'available'

            donation.save(update_fields=['status'])

        serializer = DonationSerializer(donations, many=True, context={'request': request})
        return Response(serializer.data)


# ====================== RESERVE DONATION ======================
class ReserveDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id, status='available')
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not available.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.donor == request.user:
            return Response({'error': 'You cannot reserve your own donation.'}, status=status.HTTP_400_BAD_REQUEST)

        quantity_requested = int(request.data.get('quantity_requested', 1))

        if quantity_requested > donation.available_quantity:
            return Response({'error': 'Not enough quantity available.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create reservation (confirmation_deadline is auto-set in model)
        reservation = Reservation.objects.create(
            donation=donation,
            beneficiary=request.user,
            quantity_requested=quantity_requested,
            status='pending',
        )

        # Update donation quantity (fix for partial reservations)
        donation.available_quantity -= quantity_requested
        if donation.available_quantity <= 0:
            donation.status = 'reserved'
        # else: remains 'available'

        donation.save()

        # Create conversation for chat
        from apps.chat.models import Conversation
        conversation, _ = Conversation.objects.get_or_create(
            donation=donation,
            beneficiary=request.user,
            defaults={'donor': donation.donor}
        )

        serializer = ReservationSerializer(reservation, context={'request': request})

        return Response({
            "message": "Reservation created successfully!",
            "reservation": serializer.data,
            "conversation_id": conversation.id,
        }, status=status.HTTP_201_CREATED)


# ====================== CONFIRM RESERVATION ======================
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

        if reservation.is_expired:
            return Response({'error': 'Confirmation deadline has passed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Confirm reservation
        reservation.status = 'confirmed'
        reservation.save()

        # Update donation quantity (do NOT force 'completed')
        donation = reservation.donation
        # We already deducted quantity when reservation was created
        # So we just check if it's now fully taken
        if donation.available_quantity <= 0:
            donation.status = 'completed'
        donation.save()

        # Optional: Give reputation
        request.user.reputation_score += 10
        request.user.save()

        return Response({
            'message': 'Reservation confirmed successfully.',
            'donation_status': donation.status
        })


# ====================== REJECT RESERVATION ======================
class RejectReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):
        try:
            reservation = Reservation.objects.get(
                id=reservation_id, donation__donor=request.user
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

        reservation.status = 'rejected'
        reservation.save()

        return Response({'message': 'Reservation rejected successfully.'})


# ====================== OTHER VIEWS ======================
class MyReceivedReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reservations = Reservation.objects.filter(
            donation__donor=request.user
        ).order_by('-created_at')
        serializer = ReservationSerializer(reservations, many=True, context={'request': request})
        return Response(serializer.data)


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

        # Location filtering
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


# ====================== EDIT DONATION ======================
class EditDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id, donor=request.user)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found or not yours.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DonationSerializer(donation, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)