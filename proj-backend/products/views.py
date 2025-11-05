# products/views.py
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.core.cache import cache
from django.db.models import Prefetch

from .models import Product, ProductVariant, Category, Brand, ProductImage
from .serializers import (
    ProductListSerializer,
    ProductCreateUpdateSerializer,
    ProductVariantSerializer,
    CategorySerializer,
    BrandSerializer,
    ProductImageSerializer
)


# ===================================================================
# CUSTOM PERMISSION: Admin can write, anyone can read
# ===================================================================
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


# ===================================================================
# PRODUCT VIEWSET — FULLY OPTIMIZED
# ===================================================================
class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand__id', 'categories__id', 'is_active', 'is_featured']
    search_fields = ['title', 'description', 'brand__name', 'tags__name']
    ordering_fields = ['price', 'created_at', 'discount', 'final_price']
    ordering = ['-created_at']

    def get_serializer_class(self):
        return ProductListSerializer if self.action in ['list', 'retrieve', 'featured'] else ProductCreateUpdateSerializer

    def get_queryset(self):
        # Build cache key
        category_slug = self.request.query_params.get('category')
        is_featured = self.request.query_params.get('is_featured') == 'true'
        cache_key = f"products_{category_slug or 'all'}_featured_{is_featured}"

        # Try cache
        cached_qs = cache.get(cache_key)
        if cached_qs is not None:
            return cached_qs

        # Base queryset
        queryset = Product.objects.filter(is_active=True).select_related('brand')

        # Apply filters
        if category_slug:
            queryset = queryset.filter(categories__slug=category_slug)
        if is_featured:
            queryset = queryset.filter(is_featured=True)

        # OPTIMIZED PREFETCH: Use real relation names
        queryset = queryset.prefetch_related(
            'tags',
            'categories',
            Prefetch('productimage_set', queryset=ProductImage.objects.filter(is_primary=True), to_attr='primary_image'),
            Prefetch('productimage_set', queryset=ProductImage.objects.all(), to_attr='gallery_images')
        )

        # Cache for 5 minutes
        cache.set(cache_key, queryset, timeout=60 * 5)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    # ===================================================================
    # CUSTOM ACTION: /api/products/featured/
    # ===================================================================
    @action(detail=False, methods=['get'], url_path='featured', url_name='featured')
    @method_decorator(cache_page(60 * 5))  # Cache featured list
    def featured(self, request):
        queryset = self.get_queryset().filter(is_featured=True)[:12]  # Limit to 12
        serializer = ProductListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)


# ===================================================================
# PRODUCT VARIANT VIEWSET
# ===================================================================
class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.select_related('product__brand').all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product__id', 'color', 'storage', 'ram', 'processor', 'is_active']
    search_fields = ['sku', 'processor', 'product__title']
    ordering_fields = ['price', 'stock', 'created_at']
    ordering = ['-created_at']


# ===================================================================
# CATEGORY VIEWSET
# ===================================================================
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'slug']


# ===================================================================
# BRAND VIEWSET
# ===================================================================
class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'slug']


# ===================================================================
# PRODUCT IMAGE VIEWSET (Optional: for direct management)
# ===================================================================
class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.select_related('product').all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product__id', 'is_primary']