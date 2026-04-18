from rest_framework import serializers
from .models import Donation, Reservation

class DonationSerializer(serializers.ModelSerializer):
    donor_username = serializers.CharField(source='donor.username', read_only=True)
    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            'id', 'donor', 'donor_username', 'title', 'description',
            'category', 'quantity', 'available_quantity', 'unit',
            'expiry_date', 'pickup_address', 'latitude', 'longitude',
            'status', 'urgency',  
            'image', 'created_at', 'distance_km'
        ]
        read_only_fields = ['donor', 'available_quantity', 'status', 'created_at']

    def get_distance_km(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        if not lat or not lng:
            return None
        try:
            from geopy.distance import geodesic
            user_location = (float(lat), float(lng))
            donation_location = (obj.latitude, obj.longitude)
            return round(geodesic(user_location, donation_location).km, 2)
        except Exception:
            return None


class ReservationSerializer(serializers.ModelSerializer):
    beneficiary_username = serializers.CharField(source='beneficiary.username', read_only=True)
    donation_title = serializers.CharField(source='donation.title', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'donation', 'donation_title', 'beneficiary',
            'beneficiary_username', 'quantity_requested', 'status',
            'pickup_date', 'notes', 'confirmation_deadline', 'created_at' 
        ]
        read_only_fields = ['beneficiary', 'status', 'created_at', 'confirmation_deadline']