from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    reported_username = serializers.CharField(source='reported_user.username', read_only=True)
    reported_user_avatar = serializers.SerializerMethodField()
    reported_email = serializers.CharField(source='reported_user.email', read_only=True)
    reported_donations_count = serializers.SerializerMethodField()
    reported_user_score = serializers.SerializerMethodField()
    donation_title = serializers.CharField(source='reported_donation.title', read_only=True)
    donation_image = serializers.SerializerMethodField()
    action_taken_display = serializers.CharField(source='get_action_taken_display', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'reporter_username',
            'reported_user', 'reported_username', 'reported_user_avatar',
            'reported_email', 'reported_donations_count', 'reported_user_score',
            'reported_donation', 'donation_title', 'donation_image',
            'reason', 'description', 'screenshot',
            'status', 'created_at',
            'action_taken', 'action_taken_display', 'treated_at',
        ]
        read_only_fields = ['reporter', 'status', 'created_at', 'action_taken', 'treated_at']

    def get_reported_user_avatar(self, obj):
        request = self.context.get('request')
        if obj.reported_user and obj.reported_user.avatar:
            url = obj.reported_user.avatar.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_donation_image(self, obj):
        request = self.context.get('request')
        if obj.reported_donation and obj.reported_donation.image:
            url = obj.reported_donation.image.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_reported_donations_count(self, obj):
        if obj.reported_user:
            return obj.reported_user.donations.exclude(status='deleted').count()
        return 0

    def get_reported_user_score(self, obj):
        if obj.reported_user:
            return round(obj.reported_user.reputation_score / 20, 1)
        return 0.0

    def validate(self, data):
        if not data.get('reported_user') and not data.get('reported_donation'):
            raise serializers.ValidationError("You must report either a user or a donation.")
        if data.get('reported_user') and data.get('reported_donation'):
            raise serializers.ValidationError("Report only one target at a time.")
        return data