from datetime import timedelta
from pathlib import Path
import os
import ssl
import certifi
from dotenv import load_dotenv

load_dotenv()
# ====================== EMAIL CONFIG - FORCE RELAXED FOR PYTHON 3.14 ======================
import ssl
import certifi

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 465
EMAIL_USE_SSL = True
EMAIL_USE_TLS = False

EMAIL_HOST_USER = os.getenv('EMAIL_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('EMAIL_USER')

# This is the strongest relaxation needed for Python 3.14
EMAIL_SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
EMAIL_SSL_CONTEXT.check_hostname = False
EMAIL_SSL_CONTEXT.verify_mode = ssl.CERT_NONE

# Explicitly disable the new strict Basic Constraints check
if hasattr(ssl, 'VERIFY_X509_STRICT'):
    EMAIL_SSL_CONTEXT.verify_flags &= ~ssl.VERIFY_X509_STRICT
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-*mla&@o&@8a+n^xf6qu@#*%8nd3^3lkrcw%&6#&(4@maq-@^7y'
FRONTEND_URL = "http://localhost:3000"
DEBUG = True

ALLOWED_HOSTS = ['*']  # For development only

# ====================== Rest of settings ======================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'channels',
    'rest_framework_simplejwt.token_blacklist',
    'apps.users',
    'apps.donations',
    'apps.chat',
    'apps.gamification',
    'apps.notifications',
    'apps.moderation',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ASGI_APPLICATION = 'core.asgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '3306'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://192.168.1.38:8081",
    "http://192.168.1.37:8081",
    "http://192.168.43.100:8081",
    "http://172.26.33.147:8081",  
    "http://192.168.67.243:8081",
    "http://192.168.86.147:8081",
    "http://10.0.2.2:8000",
]

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

AUTH_USER_MODEL = 'users.User'

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'