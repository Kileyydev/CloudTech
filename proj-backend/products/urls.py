# products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    ProductVariantViewSet,
    CategoryViewSet,
    ProductImageViewSet,
    BrandViewSet,
    GlobalOptionViewSet,  # 👈 add this
)

router = DefaultRouter()

# CLEAN PATHS
router.register(r'products', ProductViewSet, basename='product')
router.register(r'variants', ProductVariantViewSet, basename='variant')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'images', ProductImageViewSet, basename='image')
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'options', GlobalOptionViewSet, basename='option')  # 👈 new addition

urlpatterns = [
    path('', include(router.urls)),
]
