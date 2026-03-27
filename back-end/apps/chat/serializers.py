from rest_framework import serializers
from .models import Conversation

class ConversationSerializer(serializers.ModelSerializer):
    donor_username = serializers.CharField(source='donor.username', read_only=True)
    beneficiary_username = serializers.CharField(source='beneficiary.username', read_only=True)
    donation_title = serializers.CharField(source='donation.title', read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id', 'donation', 'donation_title',
            'donor', 'donor_username',
            'beneficiary', 'beneficiary_username',
            'firebase_room_id', 'created_at'
        ]
        read_only_fields = ['donor', 'beneficiary', 'firebase_room_id', 'created_at']