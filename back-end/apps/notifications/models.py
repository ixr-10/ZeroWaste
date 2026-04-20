from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    TYPE_CHOICES = [
    ('new_reservation', 'New Reservation'),
    ('reservation_confirmed', 'Reservation Confirmed'),
    ('reservation_rejected', 'Reservation Rejected'),
    ('new_message', 'New Message'),
    ('nearby_donation', 'Nearby Donation'),
    ('urgent_donation', 'Urgent Donation'),
    ('nearby_user', 'Nearby User (Food Saver)'),
]
   
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_object_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.username} - {self.notification_type}"