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
            headers={
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
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
        data={
            'type': notification_type,
            'id': notification.id,
            'related_id': related_object_id,
        }
    )

    return notification