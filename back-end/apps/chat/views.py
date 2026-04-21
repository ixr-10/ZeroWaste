from django.db import models as db_models
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.donations.models import Donation, Reservation
from apps.users.models import BlockedUser          # ← adjust import path if needed
from .models import Conversation, Message, DirectConversation, DirectMessage
from .serializers import ConversationSerializer, MessageSerializer


# ─── Helper ──────────────────────────────────────────────────────────────────

def are_blocked(user1, user2) -> bool:
    """Returns True if either user has blocked the other."""
    return BlockedUser.objects.filter(
        db_models.Q(blocker=user1, blocked=user2) |
        db_models.Q(blocker=user2, blocked=user1)
    ).exists()


# ─── Start a donation-linked conversation ─────────────────────────────────────

class StartConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user == donation.donor:
            return Response({'error': 'You are the donor of this donation.'}, status=status.HTTP_400_BAD_REQUEST)

        # Block guard — prevent starting a conversation with a blocked user
        if are_blocked(request.user, donation.donor):
            return Response(
                {'error': 'You cannot start a conversation with this user.'},
                status=status.HTTP_403_FORBIDDEN
            )

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


# ─── Start a direct conversation (Food Saver only) ───────────────────────────

class StartConversationWithUserView(APIView):
    """Food Saver starts a chat directly with a nearby user (no donation needed)."""
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

        # Block guard
        if are_blocked(request.user, target_user):
            return Response(
                {'error': 'You cannot start a conversation with this user.'},
                status=status.HTTP_403_FORBIDDEN
            )

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


# ─── My conversations (excludes blocked users) ────────────────────────────────

class MyConversationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Find all user IDs the current user has a block relationship with
        blocked_qs = BlockedUser.objects.filter(
            db_models.Q(blocker=request.user) | db_models.Q(blocked=request.user)
        ).values_list('blocker_id', 'blocked_id')

        excluded_ids = set()
        for b1, b2 in blocked_qs:
            excluded_ids.add(b1 if b2 == request.user.id else b2)

        conversations = (
            Conversation.objects.filter(
                db_models.Q(donor=request.user) | db_models.Q(beneficiary=request.user)
            )
            .exclude(donor__id__in=excluded_ids)
            .exclude(beneficiary__id__in=excluded_ids)
            .order_by('-updated_at')
        )

        serializer = ConversationSerializer(conversations, many=True, context={'request': request})
        return Response(serializer.data)


# ─── Send a message via REST (WebSocket consumer should mirror this check) ────

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user not in [conversation.donor, conversation.beneficiary]:
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        # Determine the other participant
        other_user = (
            conversation.beneficiary
            if request.user == conversation.donor
            else conversation.donor
        )

        # Block guard — stops sending even if block happened mid-conversation
        if are_blocked(request.user, other_user):
            return Response(
                {'error': 'You cannot send messages to this user.'},
                status=status.HTTP_403_FORBIDDEN
            )

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Message cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        msg = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content,
        )
        serializer = MessageSerializer(msg)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ─── Conversation detail ──────────────────────────────────────────────────────

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
        host = request.get_host()
        return Response({
            'conversation': serializer.data,
            'websocket_url': f'ws://{host}/ws/chat/{conversation.id}/',
        })


# ─── Mark messages as read ───────────────────────────────────────────────────

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