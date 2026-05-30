from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Donation(models.Model):
    CATEGORY_CHOICES = [
        ('Fruit', 'Fruit & Vegetables'),
        ('Pastries', 'Pastries'),
        ('Milk', 'Milk Products'),
        ('Meat', 'Meat & Fish'),
        ('Preserved', 'Preserved Food'),
        ('Cooked', 'Cooked Meals'),
        ('Drinks', 'Drinks'),
        ('Other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),        # has available quantity & not expired
        ('donated', 'Donated'),      # all quantity confirmed/completed
        ('expired', 'Expired'),      # past expiry_date
        ('deleted', 'Deleted'),      # soft-deleted, hidden from app
    ]
    URGENCY_CHOICES = [
        ('green', 'Fresh but not urgent'),
        ('orange', 'Dry or less perishable'),
        ('red', 'Urgent - pick up fast'),
    ]

    UNIT_TO_KG = {
        'kg':     1.0,
        'g':      0.001,
        'gram':   0.001,
        'grams':  0.001,
        'l':      1.0,
        'litre':  1.0,
        'litres': 1.0,
        'ml':     0.001,
        'pieces': 0.3,
        'piece':  0.3,
        'pcs':    0.3,
     }

    CATEGORY_CO2_FACTOR = {
        'Meat':      6.0,
        'Milk':      3.2,
        'Fruit':     1.1,
        'Pastries':  2.0,
        'Cooked':    2.5,
        'Preserved': 1.8,
        'Drinks':    1.0,
        'Other':     2.5,
    }


    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations',null=True, blank=True)
    title = models.CharField(max_length=255, default="Untitled Donation")
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    quantity = models.PositiveIntegerField(default=1)
    available_quantity = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=50, default="pieces")
    expiry_date = models.DateField(default=timezone.now)   # fallback: today
    pickup_address = models.TextField(default="Not provided")
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='green')
    image = models.ImageField(upload_to='donations/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.available_quantity = self.quantity
        super().save(*args, **kwargs)

    def is_expired(self):
        return self.expiry_date < timezone.now().date()

    def recalculate_status(self):
        """Call this after any reservation change to sync donation status."""
        if self.status == 'deleted':
            return  # never auto-change a deleted donation
        if self.is_expired():
            self.status = 'expired'
        elif self.available_quantity <= 0:
            # check if there's at least one confirmed reservation
            if self.reservations.filter(status='confirmed').exists():
                self.status = 'donated'
            else:
                self.status = 'active'  # all pending, nothing confirmed yet
        else:
            self.status = 'active'
        self.save(update_fields=['status'])

    def __str__(self):
        return f"{self.title} by {self.donor.username}"
    def quantity_in_kg(self):
        factor = self.UNIT_TO_KG.get(self.unit.lower().strip(), 0.3)
        return round(self.quantity * factor, 2)

    def co2_avoided_kg(self):
        co2_factor = self.CATEGORY_CO2_FACTOR.get(self.category, 2.5)
        return round(self.quantity_in_kg() * co2_factor, 2)


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name='reservations')
    beneficiary = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    quantity_requested = models.PositiveIntegerField()
    # How much was actually confirmed (deducted from available_quantity)
    quantity_confirmed = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    pickup_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    confirmation_deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.pk and self.status == 'pending' and not self.confirmation_deadline:
            self.confirmation_deadline = timezone.now() + timezone.timedelta(hours=2)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        if self.confirmation_deadline:
            return timezone.now() > self.confirmation_deadline
        return False

    def __str__(self):
        return f"{self.beneficiary.username} reserved {self.quantity_requested} of {self.donation.title}"


class NotInterested(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='not_interested')
    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name='not_interested')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'donation')

    def __str__(self):
        return f"{self.user.username} not interested in {self.donation.title}"


        # ─── Add this class at the bottom of donations/models.py ─────────────────────

class Rating(models.Model):
    reservation = models.OneToOneField(
        Reservation,
        on_delete=models.CASCADE,
        related_name='rating'
    )
    rater = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ratings_given'
    )
    rated_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ratings_received'
    )
    score = models.PositiveSmallIntegerField()  # 1 to 5
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('reservation', 'rater')

    def __str__(self):
        return f"{self.rater.username} rated {self.rated_user.username} {self.score}/5"