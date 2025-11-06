# products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    ProductVariantViewSet,
    CategoryViewSet,
    ProductImageViewSet
)

router = DefaultRouter()

# CLEAN PATHS
router.register(r'products', ProductViewSet, basename='product')
router.register(r'variants', ProductVariantViewSet, basename='variant')
router.register(r'categories', CategoryViewSet, basename='category')

router.register(r'images', ProductImageViewSet, basename='image')

urlpatterns = [
    path('', include(router.urls)),
]