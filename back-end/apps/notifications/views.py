from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Notification
from ..donations.models import Reservation
from .serializers import NotificationSerializer
from .utils import create_notification


class MyNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # ✅ Use 'recipient' (actual model field), and count BEFORE slicing
        base_qs = Notification.objects.filter(recipient=request.user)
        total_count = base_qs.count()
        unread_count = base_qs.filter(is_read=False).count()
        notifications = base_qs.order_by("-created_at")[:50]

        serializer = NotificationSerializer(notifications, many=True)
        return Response({
            "count": total_count,
            "unread_count": unread_count,
            "notifications": serializer.data,
        })


class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=request.user  # ✅ was 'beneficiary'
            )
            notification.is_read = True
            notification.save()
            return Response({"message": "Marked as read."})
        except Notification.DoesNotExist:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)


class MarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            recipient=request.user,  # ✅ was 'beneficiary'
            is_read=False
        ).update(is_read=True)
        return Response({"message": "All notifications marked as read."})


class SavePushTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get("push_token")
        if not token:
            return Response({"error": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
        request.user.push_token = token
        request.user.save()
        return Response({"message": "Push token saved."})


class UpdateLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from django.contrib.auth import get_user_model
        from geopy.distance import geodesic

        User = get_user_model()

        lat = request.data.get("latitude")
        lng = request.data.get("longitude")

        if not lat or not lng:
            return Response(
                {"error": "latitude and longitude required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.latitude = float(lat)
        request.user.longitude = float(lng)
        request.user.last_location_update = timezone.now()
        request.user.save()

        food_savers = User.objects.filter(
            role="food_saver",
            is_verified=True,
            latitude__isnull=False,
            longitude__isnull=False,
        ).exclude(id=request.user.id)

        notified = 0
        for fs in food_savers:
            try:
                distance = geodesic(
                    (float(lat), float(lng)),
                    (fs.latitude, fs.longitude),
                ).km
                if distance <= 0.5:
                    already_notified = Notification.objects.filter(
                        recipient=fs,  # ✅ was 'beneficiary'
                        notification_type="nearby_user",
                        related_object_id=request.user.id,
                        created_at__gte=timezone.now() - timezone.timedelta(hours=1),
                    ).exists()

                    if not already_notified:
                        create_notification(
                            recipient=fs,  # ✅ was 'beneficiary'
                            notification_type="nearby_user",
                            title="👤 User nearby!",
                            message=(
                                f"{request.user.username} is "
                                f"{round(distance * 1000)}m away. You can chat with them!"
                            ),
                            related_object_id=request.user.id,
                        )
                        notified += 1
            except Exception as e:
                print(f"Location notify error: {e}")

        return Response({"message": "Location updated.", "food_savers_notified": notified})


class ConfirmReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):
        try:
            reservation = Reservation.objects.get(
                id=reservation_id,
                product__owner=request.user,
            )
            reservation.status = "confirmed"
            reservation.save()

            create_notification(
                recipient=reservation.requester,  # ✅ was 'beneficiary'
                notification_type="reservation_confirmed",
                title="Reservation Confirmed",
                message=f"Your reservation for {reservation.product.name} was confirmed!",
                related_object_id=reservation.product.id,
            )
            return Response({"status": "confirmed"})

        except Reservation.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RejectReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reservation_id):
        try:
            reservation = Reservation.objects.get(
                id=reservation_id,
                product__owner=request.user,
            )
            reservation.status = "rejected"
            reservation.save()

            create_notification(
                recipient=reservation.requester,  # ✅ was 'beneficiary'
                notification_type="reservation_rejected",
                title="Reservation Rejected",
                message=f"Your reservation for {reservation.product.name} was rejected.",
                related_object_id=reservation.product.id,
            )
            return Response({"status": "rejected"})

        except Reservation.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)