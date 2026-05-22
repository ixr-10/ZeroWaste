from django.db import models
from django.contrib.auth import get_user_model
from apps.donations.models import Donation

User = get_user_model()

class Conversation(models.Model):
    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name='conversations')
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donor_conversations')
    beneficiary = models.ForeignKey(User, on_delete=models.CASCADE, related_name='beneficiary_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('donation', 'beneficiary')

    def __str__(self):
        return f"{self.donor.username} ↔ {self.beneficiary.username} | {self.donation.title}"

    def get_room_name(self):
        return f"conversation_{self.id}"
class DirectConversation(models.Model):
    
    food_saver = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='direct_conversations_as_fs'
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='direct_conversations_as_user'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('food_saver', 'user')

    def __str__(self):
        return f"Direct: {self.food_saver.username} ↔ {self.user.username}"


class DirectMessage(models.Model):
    conversation = models.ForeignKey(
        DirectConversation, on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        

    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}"