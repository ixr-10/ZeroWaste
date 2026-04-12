from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static   # ← This line must be here

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/donations/', include('apps.donations.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/gamification/', include('apps.gamification.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/moderation/', include('apps.moderation.urls')),
]

# Serve media files in development (This is the correct place)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)