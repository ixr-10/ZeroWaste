from django.db import models
from django.contrib.auth import get_user_model
from apps.donations.models import Donation

User = get_user_model()

class Conversation(models.Model):
    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name='conversations')
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donor_conversations')
    beneficiary = models.ForeignKey(User, on_delete=models.CASCADE, related_name='beneficiary_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    firebase_room_id = models.CharField(max_length=255, unique=True)

    class Meta:
        unique_together = ('donation', 'beneficiary')

    def __str__(self):
        return f"Chat: {self.donor.username} ↔ {self.beneficiary.username} | Donation: {self.donation.title}"