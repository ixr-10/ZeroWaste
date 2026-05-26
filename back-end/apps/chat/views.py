import uuid
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.donations.models import Donation, Reservation
from .models import Conversation, Message,DirectConversation, DirectMessage
from .serializers import ConversationSerializer, MessageSerializer


class StartConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user == donation.donor:
            return Response({'error': 'You are the donor of this donation.'}, status=status.HTTP_400_BAD_REQUEST)

        has_reservation = Reservation.objects.filter(
            donation=donation,
            beneficiary=request.user,
            status__in=['pending', 'confirmed', 'completed']
        ).exists()

        if not has_reservation:
            return Response(
                {'error': 'You must have a reservation to start a chat.'},
                status=status.HTTP_403_FORBIDDEN
            )

        conversation, created = Conversation.objects.get_or_create(
            donation=donation,
            beneficiary=request.user,
            defaults={'donor': donation.donor}
        )

        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response({
            'conversation': serializer.data,
            'websocket_url': f'ws://192.168.1.38:8000/ws/chat/{conversation.id}/',
            'created': created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class StartConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user == donation.donor:
            return Response({'error': 'You are the donor of this donation.'}, status=status.HTTP_400_BAD_REQUEST)

        # Food Savers can chat without reservation
        is_food_saver = request.user.role == 'food_saver' and request.user.is_verified

        if not is_food_saver:
            has_reservation = Reservation.objects.filter(
                donation=donation,
                beneficiary=request.user,
                status__in=['pending', 'confirmed', 'completed']
            ).exists()
            if not has_reservation:
                return Response(
                    {'error': 'You must have a reservation to start a chat.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        conversation, created = Conversation.objects.get_or_create(
            donation=donation,
            beneficiary=request.user,
            defaults={'donor': donation.donor}
        )

        host = request.get_host()
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response({
            'conversation': serializer.data,
            'websocket_url': f'ws://{host}/ws/chat/{conversation.id}/',
            'created': created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class StartConversationWithUserView(APIView):
    """Food Saver starts a chat directly with a nearby user (no donation needed)"""
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        if request.user.role != 'food_saver' or not request.user.is_verified:
            return Response(
                {'error': 'Only verified Food Savers can initiate direct chats.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if target_user == request.user:
            return Response({'error': 'Cannot chat with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create a direct conversation (no donation)
        conversation, created = DirectConversation.objects.get_or_create(
            food_saver=request.user,
            user=target_user,
        )

        host = request.get_host()
        return Response({
            'conversation_id': conversation.id,
            'websocket_url': f'ws://{host}/ws/chat/direct/{conversation.id}/',
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
        conversations = conversations.order_by('-updated_at')
        serializer = ConversationSerializer(conversations, many=True, context={'request': request})
        return Response(serializer.data)


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user not in [conversation.donor, conversation.beneficiary]:
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response({
            'conversation': serializer.data,
            'websocket_url': f'ws://localhost:8000/ws/chat/{conversation.id}/',
        })


class MarkMessagesReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user not in [conversation.donor, conversation.beneficiary]:
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        Message.objects.filter(
            conversation=conversation,
            is_read=False
        ).exclude(sender=request.user).update(is_read=True)

        return Response({'message': 'Messages marked as read.'})