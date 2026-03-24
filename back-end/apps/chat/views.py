import uuid
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.donations.models import Donation, Reservation
from .models import Conversation
from .serializers import ConversationSerializer


class StartConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check that requester is the beneficiary of this donation
        is_beneficiary = Reservation.objects.filter(
            donation=donation,
            beneficiary=request.user,
            status__in=['confirmed', 'completed']
        ).exists()

        if not is_beneficiary and request.user != donation.donor:
            return Response(
                {'error': 'You must have a reservation for this donation to start a chat.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get or create conversation
        conversation, created = Conversation.objects.get_or_create(
            donation=donation,
            beneficiary=request.user if request.user != donation.donor else None,
            defaults={
                'donor': donation.donor,
                'beneficiary': request.user,
                'firebase_room_id': f"chat_{donation_id}_{request.user.id}_{uuid.uuid4().hex[:8]}"
            }
        )

        serializer = ConversationSerializer(conversation)
        return Response({
            'conversation': serializer.data,
            'firebase_room_id': conversation.firebase_room_id,
            'created': created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class MyConversationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(
            donor=request.user
        ) | Conversation.objects.filter(
            beneficiary=request.user
        )
        conversations = conversations.order_by('-created_at')
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Only donor or beneficiary can access
        if request.user not in [conversation.donor, conversation.beneficiary]:
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ConversationSerializer(conversation)
        return Response({
            'conversation': serializer.data,
            'firebase_room_id': conversation.firebase_room_id
        })