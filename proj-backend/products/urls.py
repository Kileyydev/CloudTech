# products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    ProductVariantViewSet,
    CategoryViewSet,
    BrandViewSet,
    ColorViewSet,        # ← CHANGE THIS
    ProductImageViewSet
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')
router.register(r'variants', ProductVariantViewSet, basename='variants')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'brands', BrandViewSet, basename='brands')
router.register(r'colors', ColorViewSet, basename='colors')  # ← AND THIS
router.register(r'images', ProductImageViewSet, basename='images')

urlpatterns = [
    path('', include(router.urls)),
]