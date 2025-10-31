from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from . import views
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path('', views.home, name='home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('products.urls')),
    path('api/', include('contact.urls')),
    path('api/', include('testimonials.urls')),  # ✅ correct
    path('api/repairs/', include('repairs.urls')),
    path('api/health', health_check, name='health'),
    path('api/auth/', include('rest_framework_simplejwt.urls')),  # ADD THIS
]

# ✅ Serve media files in both development and production
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
