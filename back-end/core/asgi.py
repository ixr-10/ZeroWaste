import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from django.core.asgi import get_asgi_application
from django.contrib.staticfiles.handlers import ASGIStaticFilesHandler
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
import apps.chat.routing

application = ProtocolTypeRouter({
    'http': ASGIStaticFilesHandler(get_asgi_application()),  # ✅ this line changed
    'websocket': AllowedHostsOriginValidator(
        URLRouter(
            apps.chat.routing.websocket_urlpatterns
        )
    ),
})