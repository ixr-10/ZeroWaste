from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification
from .serializers import NotificationSerializer


class MyNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        queryset = Notification.objects.filter(
            recipient=request.user
        ).order_by('-created_at')

        
        total_count = queryset.count()
        unread_count = queryset.filter(is_read=False).count()

        
        notifications = queryset[:50]

        serializer = NotificationSerializer(notifications, many=True)

        return Response({
            'count': total_count,
            'unread_count': unread_count,
            'notifications': serializer.data
        })


class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=request.user
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
            recipient=request.user,
            is_read=False
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