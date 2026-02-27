from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('donateur', 'Donateur'),
        ('beneficiaire', 'Bénéficiaire'),
        ('admin', 'Administrateur'),
        ('collectivite', 'Collectivité Locale'),
        ('food_saver', 'Food Saver'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='donateur')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    reputation_score = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"