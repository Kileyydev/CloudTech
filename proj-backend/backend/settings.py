import os
from pathlib import Path
import environ
from corsheaders.defaults import default_headers
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()


BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# -------------------------------------------------------------------------------------
# GENERAL CONFIG
# -------------------------------------------------------------------------------------

SECRET_KEY = env("SECRET_KEY", default="django-insecure-your-secret-key-here")
DEBUG = env.bool("DEBUG", default=False)

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "api.cloudtechstore.net",
    "cloudtechstore.net",
    "www.cloudtechstore.net",
    "cloudtech-c4ft.onrender.com",
    "cloudtech-c4ft.vercel.app",
]

# -------------------------------------------------------------------------------------
# INSTALLED APPS
# -------------------------------------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",

    # Local apps
    "products",
    "accounts",
    "contact",
    "repairs",
    "testimonials",
    "django_filters",
]


# -------------------------------------------------------------------------------------
# MIDDLEWARE
# -------------------------------------------------------------------------------------
# ✅ Order matters: CorsMiddleware must be above CommonMiddleware
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # must be above CommonMiddleware
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

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

# -------------------------------------------------------------------------------------
# DATABASE
# -------------------------------------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "neondb",
        "USER": "neondb_owner",
        "PASSWORD": "npg_i6HWNMPIJfb7",
        "HOST": "ep-holy-silence-adqn8djl-pooler.c-2.us-east-1.aws.neon.tech",
        "PORT": "5432",
        "OPTIONS": {"sslmode": "require"},
    }
}

# -------------------------------------------------------------------------------------
# REST FRAMEWORK
# -------------------------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
}

AUTH_USER_MODEL = "accounts.User"

# -------------------------------------------------------------------------------------
# CORS & CSRF
# -------------------------------------------------------------------------------------

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://cloudtech-c4ft.onrender.com",
    "https://cloudtech-c4ft.vercel.app",
    "https://cloud-tech-eta.vercel.app",
    "https://www.cloudtechstore.net",
    "https://cloudtechstore.net",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "https://cloudtech-c4ft.onrender.com",
    "https://cloudtech-c4ft.vercel.app",
    "https://www.cloudtechstore.net",
    "https://cloudtechstore.net",
    "https://api.cloudtechstore.net",
]

CORS_ALLOW_HEADERS = list(default_headers) + [
    "Content-Type",
    "Authorization",
    "X-CSRFToken",
]

CORS_ALLOW_METHODS = ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"]
CORS_URLS_REGEX = r"^/api/.*$"

# Render-specific fix for proxy SSL headers
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# -------------------------------------------------------------------------------------
# EMAIL (SENDGRID)
# -------------------------------------------------------------------------------------

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.sendgrid.net"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="apikey")
EMAIL_HOST_PASSWORD = env("SENDGRID_API_KEY", default="")
DEFAULT_FROM_EMAIL = env("EMAIL_FROM", default="no-reply@cloudtech.com")

# -------------------------------------------------------------------------------------
# PASSWORD VALIDATION
# -------------------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -------------------------------------------------------------------------------------
# LOCALIZATION
# -------------------------------------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True

# -------------------------------------------------------------------------------------
# STATIC & MEDIA
# -------------------------------------------------------------------------------------

STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ADD THIS LINE
APPEND_SLASH = False
