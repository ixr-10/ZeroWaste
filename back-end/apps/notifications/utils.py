import requests
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()


def send_push_notification(user, title, body, data=None):
    
    if not user.push_token:
        return

    message = {
        'to': user.push_token,
        'sound': 'default',
        'title': title,
        'body': body,
        'data': data or {},
    }

    try:
        requests.post(
            'https://exp.host/--/api/v2/push/send',
            json=message,
            headers={'Accept': 'application/json', 'Content-Type': 'application/json'},
            timeout=10
        )
    except Exception as e:
        print(f"Push notification failed: {e}")


def create_notification(recipient, notification_type, title, message, related_object_id=None):
   
    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        related_object_id=related_object_id,
    )

    
    send_push_notification(
        user=recipient,
        title=title,
        body=message,
        data={'type': notification_type, 'id': notification.id, 'related_id': related_object_id}
    )
    
    return notification


def notify_nearby_food_savers(donation):
    """Notify Food Savers within 500m when a new donation is published"""
    from geopy.distance import geodesic
    food_savers = User.objects.filter(
        role='food_saver',
        is_verified=True,
        latitude__isnull=False,
        longitude__isnull=False
    ).exclude(id=donation.donor.id)

    for fs in food_savers:
        try:
            distance = geodesic(
                (donation.latitude, donation.longitude),
                (fs.latitude, fs.longitude)
            ).km
            if distance <= 0.5:  # 500m
                create_notification(
                    recipient=fs,
                    notification_type='nearby_donation',
                    title='📍 New donation near you!',
                    message=f'{donation.donor.username} just posted "{donation.title}" {round(distance * 1000)}m away.',
                    related_object_id=donation.id
                )
        except Exception as e:
            print(f"Nearby notification failed for {fs.username}: {e}")


def notify_nearby_users_new_donation(donation):
    """Notify all users within 500m when a new donation is published"""
    from geopy.distance import geodesic
    users = User.objects.filter(
        latitude__isnull=False,
        longitude__isnull=False
    ).exclude(id=donation.donor.id)

    for user in users:
        try:
            distance = geodesic(
                (donation.latitude, donation.longitude),
                (user.latitude, user.longitude)
            ).km
            if distance <= 0.5:
                create_notification(
                    recipient=user,
                    notification_type='nearby_donation',
                    title=f'📍 {round(distance * 1000)}m away!',
                    message=f'"{donation.title}" is available near you. Pick it up fast!',
                    related_object_id=donation.id
                )
        except Exception as e:
            print(f"Notify user failed: {e}")


def notify_urgent_donation(donation):
    """Notify users who previously reserved same category — urgency alert"""
    from apps.donations.models import Reservation
    from django.utils import timezone
    from datetime import timedelta

    if donation.urgency != 'red':
        return

    # Find users who reserved same category in last 30 days
    interested_users = User.objects.filter(
        reservations__donation__category=donation.category,
        reservations__created_at__gte=timezone.now() - timedelta(days=30)
    ).exclude(id=donation.donor.id).distinct()

    for user in interested_users:
        create_notification(
            recipient=user,
            notification_type='urgent_donation',
            title=f'🚨 URGENT — {donation.category}',
            message=f'Pick up fast: "{donation.title}" expires very soon!',
            related_object_id=donation.id
        )