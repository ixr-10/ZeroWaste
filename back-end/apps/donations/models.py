from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Donation(models.Model):
    CATEGORY_CHOICES = [
        ('fruits', 'Fruits'),
        ('legumes', 'Légumes'),
        ('pain', 'Pain'),
        ('conserves', 'Conserves'),
        ('produits_laitiers', 'Produits Laitiers'),
        ('autre', 'Autre'),
    ]
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('reserved', 'Reserved'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    ]
    URGENCY_CHOICES = [
        ('green', 'Fresh but not urgent'),
        ('orange', 'Dry or less perishable'),
        ('red', 'Urgent - pick up fast'),
    ]

    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    quantity = models.PositiveIntegerField()
    available_quantity = models.PositiveIntegerField()
    unit = models.CharField(max_length=50)
    expiry_date = models.DateField()
    pickup_address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='green')  # ← NEW
    image = models.ImageField(upload_to='donations/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.available_quantity = self.quantity
        super().save(*args, **kwargs)

    def is_expired(self):
        return self.expiry_date < timezone.now().date()

    def __str__(self):
        return f"{self.title} by {self.donor.username}"


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name='reservations')
    beneficiary = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    quantity_requested = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    pickup_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    confirmation_deadline = models.DateTimeField(null=True, blank=True)  # ← NEW
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.beneficiary.username} reserved {self.quantity_requested} of {self.donation.title}"