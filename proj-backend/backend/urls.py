# backend/urls.py
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from . import views
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

def health_check(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path('', views.home, name='home'),
    path('admin/', admin.site.urls),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/', include('products.urls')),
    path('api/', include('contact.urls')),
    path('api/', include('testimonials.urls')),
    path('api/repairs/', include('repairs.urls')),
    path('api/health', health_check, name='health'),
    path('api/accounts/', include('accounts.urls')),
    path('api/purchases/', include('purchases.urls')),
    path('api/products/', include('products.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)