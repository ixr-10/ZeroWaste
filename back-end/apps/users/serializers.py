from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import BlockedUser, SystemSettings

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(required=True)
    address = serializers.CharField(required=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    role = serializers.ChoiceField(
        choices=[
            ('donateur', 'Donateur'),
            ('admin', 'Administrateur'),
            ('beneficiaire', 'Bénéficiaire'),
            ('localauthority', 'Local authority'),
            ('food_saver', 'Food Saver'),
            ('user', 'Utilisateur Standard'),
        ],
        default='user',
        required=False)

    class Meta:
        model = User
        fields = [
           
            'username',      # required
            'email',         # required
            'phone',         # required
            'password',      # required
            'password2',     # required
            'role',          # required
            'address',       # required
            'avatar',        # optional
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        user.is_active = False          
        user.is_email_confirmed = False  
        user.is_verified = False        
        user.save()
        return user

 
class UserSerializer(serializers.ModelSerializer):
    donation_count = serializers.IntegerField(
        source='donations.count', read_only=True
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone',
                  'address', 'reputation_score', 'is_verified',
                  'avatar', 'created_at', 'is_active', 'is_email_confirmed','donation_count']
        
class AdminCreateUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(required=True)
    address = serializers.CharField(required=True)
    role = serializers.ChoiceField(choices=[
    ('admin', 'Admin'),
    ('localauthority', 'Local authority'),
])

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'address', 'role']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_unusable_password()
        user.is_active = False         
        user.is_email_confirmed = False  
        user.save()
        return user


class BlockedUserSerializer(serializers.ModelSerializer):
    blocked_username = serializers.CharField(source='blocked.username', read_only=True)
    blocked_avatar = serializers.ImageField(source='blocked.avatar', read_only=True)

    class Meta:
        model = BlockedUser
        fields = ['id', 'blocked', 'blocked_username', 'blocked_avatar', 'created_at']
        read_only_fields = ['created_at']


class PublicUserSerializer(serializers.ModelSerializer):
    """For viewing another user's public profile"""
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'reputation_score', 'role', 'created_at']


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ['food_saver_score_threshold']


    