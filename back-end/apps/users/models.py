import random
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings


class User(AbstractUser):
    ROLE_CHOICES = [
        ('donateur', 'Donateur'),
        ('beneficiaire', 'Bénéficiaire'),
        ('admin', 'Administrateur'),
        ('localauthority', 'Local Authority'),
        ('food_saver', 'Food Saver'),
        ('user', 'Utilisateur Standard'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    reputation_score = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)  # verified by food saver
    is_email_confirmed = models.BooleanField(default=False)  # confirmed via OTP email
    is_active = models.BooleanField(default=False)  #  inactive until email confirmed
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    push_token = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class OTPCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        # Code expires after 10 minutes
        return not self.is_used and (timezone.now() - self.created_at).total_seconds() < 600

    @staticmethod
    def generate_code():
        return str(random.randint(100000, 999999))

    def send_to_email(self, subject, message_prefix):
        """Generate a code, save it, and send it to the user’s email."""
        self.code = OTPCode.generate_code()
        self.save()

        subject_line = subject
        message = f"{message_prefix}\nYour verification code is: {self.code}\nThis code expires in 10 minutes."
        send_mail(
            subject=subject_line,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[self.user.email],
        )

class BlockedUser(models.Model):
    """Stores which users a person has blocked"""
    blocker = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='blocking'
    )
    blocked = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='blocked_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')

    def __str__(self):
        return f"{self.blocker.username} blocked {self.blocked.username}"


class SystemSettings(models.Model):
    """Global settings configurable by admin"""
    food_saver_score_threshold = models.IntegerField(default=100)

    class Meta:
        verbose_name = "System Settings"

    def __str__(self):
        return f"System Settings (FoodSaver threshold: {self.food_saver_score_threshold})"