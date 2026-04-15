from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    reported_username = serializers.CharField(source='reported_user.username', read_only=True)
    reported_user_avatar = serializers.ImageField(source='reported_user.avatar', read_only=True)
    donation_title = serializers.CharField(source='reported_donation.title', read_only=True)
    donation_image = serializers.ImageField(source='reported_donation.image', read_only=True)

    
    action_taken_display = serializers.CharField(
        source='get_action_taken_display', read_only=True
    )

    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'reporter_username',
            'reported_user', 'reported_username', 'reported_user_avatar',
            'reported_donation', 'donation_title', 'donation_image',
            'reason', 'description', 'screenshot',
            'status', 'created_at',
            'action_taken', 'action_taken_display', 'treated_at',
        ]
        read_only_fields = ['reporter', 'status', 'created_at', 'action_taken', 'treated_at']

    def validate(self, data):
        if not data.get('reported_user') and not data.get('reported_donation'):
            raise serializers.ValidationError("You must report either a user or a donation.")
        if data.get('reported_user') and data.get('reported_donation'):
            raise serializers.ValidationError("Report only one target at a time.")
        return data