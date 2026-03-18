from rest_framework import serializers
from .models import Donation, Reservation

class DonationSerializer(serializers.ModelSerializer):
    donor_username = serializers.CharField(source='donor.username', read_only=True)

    class Meta:
        model = Donation
        fields = [
            'id', 'donor', 'donor_username', 'title', 'description',
            'category', 'quantity', 'available_quantity', 'unit',
            'expiry_date', 'pickup_address', 'latitude', 'longitude',
            'status', 'image', 'created_at'
        ]
        read_only_fields = ['donor', 'available_quantity', 'status', 'created_at']