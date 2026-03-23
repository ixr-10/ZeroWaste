from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Donation, Reservation
from .serializers import DonationSerializer


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