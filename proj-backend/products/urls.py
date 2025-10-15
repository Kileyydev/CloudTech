# products/urls.py
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    ProductVariantViewSet,
    CategoryViewSet,
    BrandViewSet
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')
router.register(r'variants', ProductVariantViewSet, basename='variants')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'brands', BrandViewSet, basename='brands')

urlpatterns = router.urls
