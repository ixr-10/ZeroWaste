import requests
from .models import Notification

def create_notification(recipient, notification_type, title, message, related_object_id=None):
    # 1. Save to DB as before
    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        related_object_id=related_object_id,
    )

    # 2. Send Expo push notification if user has a token
    push_token = getattr(recipient, 'push_token', None)
    if push_token and push_token.startswith("ExponentPushToken"):
        try:
            requests.post(
                "https://exp.host/--/api/v2/push/send",
                json={
                    "to": push_token,
                    "title": title,
                    "body": message,
                    "sound": "default",
                    "data": {
                        "notification_type": notification_type,
                        "related_object_id": related_object_id,
                    },
                },
                headers={"Content-Type": "application/json"},
                timeout=5,
            )
        except Exception as e:
            print(f"Push notification failed: {e}")

    return notification