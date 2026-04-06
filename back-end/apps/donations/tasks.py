from celery import shared_task
from django.utils import timezone
from datetime import timedelta

from .models import Reservation, Donation


@shared_task
def expire_pending_reservations():
    now = timezone.now()
    two_hours_ago = now - timedelta(hours=2)

    # Find old pending reservations
    old_reservations = Reservation.objects.filter(
        status='pending',
        confirmation_deadline__lt=now
    )

    count = 0
    for res in old_reservations:
        res.status = 'expired'
        res.save()

        # Restore quantity to donation
        donation = res.donation
        donation.available_quantity += res.quantity_requested
        donation.save()

        if donation.available_quantity > 0 and donation.status == 'reserved':
            donation.status = 'available'
            donation.save()

        count += 1

    print(f"Expired {count} old pending reservations.")
    return f"Expired {count} reservations."