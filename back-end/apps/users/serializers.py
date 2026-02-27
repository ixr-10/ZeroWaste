from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[
        ('donateur', 'Donateur'),
        ('beneficiaire', 'Bénéficiaire'),
        ('collectivite', 'Collectivité Locale'),
        ('food_saver', 'Food Saver'),
    ], required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(required=True)
    address = serializers.CharField(required=True)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'first_name',    # required
            'last_name',     # required
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
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'username',
            'email',
            'phone',
            'role',
            'address',
            'avatar',
            'reputation_score',
            'is_verified',
            'created_at',
        ]