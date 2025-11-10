# fixrequests/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RepairRequestViewSet

router = DefaultRouter()
router.register(r'repairs', RepairRequestViewSet, basename='repair')

urlpatterns = [
    path('', include(router.urls)),
]
