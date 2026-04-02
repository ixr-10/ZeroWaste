from rest_framework import serializers
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_username',
                  'content', 'is_read', 'created_at']
        read_only_fields = ['sender', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    donor_username = serializers.CharField(source='donor.username', read_only=True)
    beneficiary_username = serializers.CharField(source='beneficiary.username', read_only=True)
    donation_title = serializers.CharField(source='donation.title', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'donation', 'donation_title',
            'donor', 'donor_username',
            'beneficiary', 'beneficiary_username',
            'created_at', 'updated_at',
            'last_message', 'unread_count'
        ]
        read_only_fields = ['donor', 'beneficiary', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {
                'content': last.content,
                'sender_username': last.sender.username,
                'created_at': last.created_at.isoformat(),
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()