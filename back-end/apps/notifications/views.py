from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer


class MyNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            recipient=request.user
        ).order_by('-created_at')[:50]
        serializer = NotificationSerializer(notifications, many=True)
        
        return Response({
            'count': notifications.count(),
            'unread_count': notifications.filter(is_read=False).count(),
            'notifications': serializer.data
        })


class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id, recipient=request.user
            )
            notification.is_read = True
            notification.save()
            return Response({'message': 'Marked as read.'})
        except Notification.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


class MarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            recipient=request.user, is_read=False
        ).update(is_read=True)
        return Response({'message': 'All notifications marked as read.'})


class SavePushTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get('push_token')
        if not token:
            return Response({'error': 'Token required.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.push_token = token
        request.user.save()
        return Response({'message': 'Push token saved.'})


class UpdateLocationView(APIView):
    """
    Called periodically from mobile app to update user location.
    Also checks if any Food Savers are nearby and notifies them.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from django.contrib.auth import get_user_model
        from geopy.distance import geodesic
        from .utils import create_notification

        User = get_user_model()

        lat = request.data.get('latitude')
        lng = request.data.get('longitude')

        if not lat or not lng:
            return Response({'error': 'latitude and longitude required.'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.latitude = float(lat)
        request.user.longitude = float(lng)
        request.user.last_location_update = timezone.now()
        request.user.save()

        # Notify nearby Food Savers about this user
        food_savers = User.objects.filter(
            role='food_saver',
            is_verified=True,
            latitude__isnull=False,
            longitude__isnull=False
        ).exclude(id=request.user.id)

        notified = 0
        for fs in food_savers:
            try:
                distance = geodesic(
                    (float(lat), float(lng)),
                    (fs.latitude, fs.longitude)
                ).km
                if distance <= 0.5:  # 500m
                    # Avoid spam — check if already notified recently
                    already_notified = Notification.objects.filter(
                        recipient=fs,
                        notification_type='nearby_user',
                        related_object_id=request.user.id,
                        created_at__gte=timezone.now() - timezone.timedelta(hours=1)
                    ).exists()

                    if not already_notified:
                        create_notification(
                            recipient=fs,
                            notification_type='nearby_user',
                            title='👤 User nearby!',
                            message=f'{request.user.username} is {round(distance * 1000)}m away. You can chat with them!',
                            related_object_id=request.user.id
                        )
                        notified += 1
            except Exception as e:
                print(f"Location notify error: {e}")

        return Response({'message': 'Location updated.', 'food_savers_notified': notified})