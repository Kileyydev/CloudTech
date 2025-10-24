from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RepairRequestViewSet  # <-- updated

router = DefaultRouter()
router.register('', RepairRequestViewSet, basename='repairs')

urlpatterns = [
    path('', include(router.urls)),
]
