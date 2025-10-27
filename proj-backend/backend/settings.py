import os
from pathlib import Path
import environ

# === Base Directory ===
BASE_DIR = Path(__file__).resolve().parent.parent

# === Environment Variables ===
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# === Security ===
SECRET_KEY = env("SECRET_KEY", default="django-insecure-your-secret-key-here")
DEBUG = env.bool("DEBUG", default=True)
ALLOWED_HOSTS = ['*']  # 👈 you can restrict later for production

# === Installed Apps ===
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',  # API
    'corsheaders',     # CORS
    'products',
    'accounts',
    'contact',
    'repairs',
    'testimonials',
]

CORS_ALLOWED_ORIGINS = [
    "https://cloud-tech-eta.vercel.app",  # frontend URL
    "http://localhost:3000",              # local dev
]


# === Middleware ===
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",  # 👈 ADD THIS
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # 👈 add this before CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

# === Templates ===
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# === Custom User Model ===
AUTH_USER_MODEL = 'accounts.User'

# === Database ===
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'neondb',
        'USER': 'neondb_owner',
        'PASSWORD': 'npg_i6HWNMPIJfb7',
        'HOST': 'ep-holy-silence-adqn8djl-pooler.c-2.us-east-1.aws.neon.tech',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
            'channel_binding': 'require',
        },
    }
}


# Django REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',  # for admin & browsable API
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # if using JWTs
    ],
    'DEFAULT_PERMISSION_CLASSES': [
    'rest_framework.permissions.AllowAny',
]

}

CORS_ALLOW_ALL_ORIGINS = True  # only for development
CORS_ALLOW_CREDENTIALS = True

# === Email (SendGrid) ===
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.sendgrid.net"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="apikey")
EMAIL_HOST_PASSWORD = env("SENDGRID_API_KEY")
DEFAULT_FROM_EMAIL = env("EMAIL_FROM", default="no-reply@cloudtech.com")

# === Password Validators ===
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# === Internationalization ===
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

# === Static & Media Files ===
STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# === CORS ===
CORS_ALLOW_ALL_ORIGINS = True  # 👈 for development
CORS_ALLOW_CREDENTIALS = True

# === Default Auto Field ===
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
