from apps.users.models import User
from apps.notifications.utils import notify_nearby_food_savers_user
from apps.notifications.models import Notification

layal = User.objects.get(username='layal')
ibtihal = User.objects.get(username='ibtihal22')

print(f"Layal: {layal.latitude}, {layal.longitude}, verified={layal.is_verified}")
print(f"Ibtihal: {ibtihal.latitude}, {ibtihal.longitude}, role={ibtihal.role}, verified={ibtihal.is_verified}")

# Clear previous notifications for testing
Notification.objects.filter(recipient=ibtihal, notification_type='nearby_user').delete()

# Trigger notification
notify_nearby_food_savers_user(layal)

# Check if notification was created
notifs = Notification.objects.filter(recipient=ibtihal, notification_type='nearby_user')
if notifs.exists():
    print(f"SUCCESS: Notification created for {ibtihal.username}")
    for n in notifs:
        print(f" - {n.message}")
else:
    print(f"FAILURE: No notification created for {ibtihal.username}")

# Calculate distance manually
from geopy.distance import geodesic
dist = geodesic((layal.latitude, layal.longitude), (ibtihal.latitude, ibtihal.longitude)).km
print(f"Manual Distance check: {dist} km ({dist*1000} meters)")
