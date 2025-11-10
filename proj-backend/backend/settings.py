# backend/settings.py
import os
from pathlib import Path
from datetime import timedelta
import environ
from corsheaders.defaults import default_headers
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environ
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# ===================================================================
# SECURITY & HOSTS
# ===================================================================
SECRET_KEY = env("SECRET_KEY", default="django-insecure-change-me-now")
DEBUG = True
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "http://localhost:3000",
    "cloudtech-c4ft.onrender.com",
    "api.cloudtechstore.net",
    "cloudtechstore.net",
    "www.cloudtechstore.net",
]

# ===================================================================
# INSTALLED APPS
# ===================================================================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "cloudinary",
    "cloudinary_storage",

    "products",
    "accounts",
    "contact",
    "testimonials",
    "purchases",
    "fixrequests",
]

# ===================================================================
# MIDDLEWARE
# ===================================================================
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ===================================================================
# URLS & TEMPLATES
# ===================================================================
ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# ===================================================================
# DATABASE
# ===================================================================
DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        default="postgresql://neondb_owner:npg_i6HWNMPIJfb7@ep-holy-silence-adqn8djl-pooler.c-2.us-east-1.aws.neon.tech:5432/neondb?sslmode=require"
    )
}

# ===================================================================
# REST FRAMEWORK & JWT
# ===================================================================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

AUTH_USER_MODEL = "accounts.User"

# ===================================================================
# CORS & CSRF
# ===================================================================
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "https://cloudtechstore.net",
    "https://www.cloudtechstore.net",
    "https://cloudtech-c4ft.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_HEADERS = list(default_headers) + [
    "content-type",
    "authorization",
    "x-csrftoken",
    "x-requested-with",
    "x-device-id",
]

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# ===================================================================
# CLOUDINARY — FULLY ENABLED
# ===================================================================
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": env("CLOUDINARY_CLOUD_NAME"),
    "API_KEY": env("CLOUDINARY_API_KEY"),
    "API_SECRET": env("CLOUDINARY_API_SECRET"),
}

# ALWAYS USE CLOUDINARY — NO LOCAL MEDIA
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

# NO MEDIA_URL, NO MEDIA_ROOT — CLOUDINARY SERVES DIRECTLY
# REMOVED: MEDIA_URL, MEDIA_ROOT

# ===================================================================
# STATIC FILES (WhiteNoise)
# ===================================================================
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ===================================================================
# EMAIL (SendGrid)
# ===================================================================
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.sendgrid.net"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "apikey"
EMAIL_HOST_PASSWORD = env("SENDGRID_API_KEY")
DEFAULT_FROM_EMAIL = env("EMAIL_FROM", default="no-reply@cloudtechstore.net")

# ===================================================================
# PASSWORD & INTERNATIONALIZATION
# ===================================================================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
APPEND_SLASH = True

SITE_URL = env("SITE_URL", default="https://cloudtech-c4ft.onrender.com")

import os

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "file": {
            "level": "ERROR",
            "class": "logging.FileHandler",
            "filename": os.path.join(BASE_DIR, "django_errors.log"),
        },
    },
    "loggers": {
        "django": {
            "handlers": ["file"],
            "level": "ERROR",
            "propagate": True,
        },
    },
}


# settings.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Media files (uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# In development, serve media files
from django.conf import settings
from django.conf.urls.static import static