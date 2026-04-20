import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from .models import Conversation, Message

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'conversation_{self.conversation_id}'

        token = self.scope['query_string'].decode().split('token=')[-1]
        self.user = await self.get_user_from_token(token)

        if not self.user:
            await self.close()
            return

        allowed = await self.is_participant(self.conversation_id, self.user)
        if not allowed:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        messages = await self.get_message_history(self.conversation_id)
        await self.send(text_data=json.dumps({
            'type': 'history',
            'messages': messages
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'message')

        if message_type == 'message':
            content = data.get('content', '').strip()
            if not content:
                return

            message = await self.save_message(
                self.conversation_id,
                self.user,
                content
            )

            # ← Send notification to other user
            await self.notify_other_user(
                self.conversation_id,
                self.user,
                content
            )

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': message['id'],
                        'content': message['content'],
                        'sender_id': message['sender_id'],
                        'sender_username': message['sender_username'],
                        'created_at': message['created_at'],
                        'is_read': False,
                    }
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message']
        }))

    @database_sync_to_async
    def notify_other_user(self, conversation_id, sender, content):
        from apps.notifications.utils import create_notification
        from .models import Conversation
        try:
            conv = Conversation.objects.get(id=conversation_id)
            recipient = conv.beneficiary if sender == conv.donor else conv.donor
            create_notification(
                recipient=recipient,
                notification_type='new_message',
                title=f'New message from {sender.username} 💬',
                message=content[:100],
                related_object_id=conversation_id
            )
        except Exception as e:
            print(f'Notification failed: {e}')

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            return User.objects.get(id=user_id)
        except Exception:
            return None

    @database_sync_to_async
    def is_participant(self, conversation_id, user):
        try:
            conv = Conversation.objects.get(id=conversation_id)
            return user in [conv.donor, conv.beneficiary]
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def get_message_history(self, conversation_id):
        messages = Message.objects.filter(
            conversation_id=conversation_id
        ).select_related('sender').order_by('created_at')[:50]
        return [
            {
                'id': m.id,
                'content': m.content,
                'sender_id': m.sender.id,
                'sender_username': m.sender.username,
                'created_at': m.created_at.isoformat(),
                'is_read': m.is_read,
            }
            for m in messages
        ]

    @database_sync_to_async
    def save_message(self, conversation_id, sender, content):
        conv = Conversation.objects.get(id=conversation_id)
        message = Message.objects.create(
            conversation=conv,
            sender=sender,
            content=content
        )
        conv.save()
        return {
            'id': message.id,
            'content': message.content,
            'sender_id': sender.id,
            'sender_username': sender.username,
            'created_at': message.created_at.isoformat(),
        }