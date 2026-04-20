from django.urls import path
from .views import (
    MyNotificationsView, MarkNotificationReadView,
    MarkAllReadView, SavePushTokenView, UpdateLocationView
)

urlpatterns = [
    path('', MyNotificationsView.as_view(), name='my_notifications'),
    path('<int:notification_id>/read/', MarkNotificationReadView.as_view(), name='mark_read'),
    path('read-all/', MarkAllReadView.as_view(), name='mark_all_read'),
    path('save-token/', SavePushTokenView.as_view(), name='save_push_token'),
    path('update-location/', UpdateLocationView.as_view(), name='update_location'),
]