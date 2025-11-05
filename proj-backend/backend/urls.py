from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from . import views
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Health check endpoint
def health_check(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path('', views.home, name='home'),
    path('admin/', admin.site.urls),

    # JWT token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),   # POST email + password → get access + refresh
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # POST refresh token → get new access

    # App endpoints
    path('api/', include('products.urls')),
    path('api/', include('contact.urls')),
    path('api/', include('testimonials.urls')),
    path('api/repairs/', include('repairs.urls')),
    path('api/health', health_check, name='health'),
    path('api/accounts/', include('accounts.urls')),  # email/password login
    path('api/purchases/', include('purchases.urls')),

]

# SERVE MEDIA IN DEV + FORCE IN PRODUCTION
if settings.DEBUG or True:  # ← Force on Render
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)