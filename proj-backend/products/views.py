# products/views.py
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.core.cache import cache
from django.db.models import Prefetch, Q

from .models import (
    Product, ProductVariant, Category, Brand, ProductImage, GlobalOption
)
from .serializers import (
    ProductListSerializer,
    ProductCreateUpdateSerializer,
    ProductVariantSerializer,
    CategorySerializer,
    BrandSerializer,
    ProductImageSerializer,
    GlobalOptionSerializer
)


# ===================================================================
# GLOBAL OPTION VIEWSET
# ===================================================================
class GlobalOptionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only for frontend. Admins can manage via admin panel.
    """
    queryset = GlobalOption.objects.all().order_by('type', 'value')
    serializer_class = GlobalOptionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['type']
    search_fields = ['value']


# ===================================================================
# CUSTOM PERMISSION: Admin can write, anyone can read
# ===================================================================
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


# ===================================================================
# PRODUCT VIEWSET — FULLY OPTIMIZED & FIXED
# ===================================================================
class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand__id', 'categories__id', 'is_active', 'is_featured']
    search_fields = ['title', 'description', 'brand__name', 'tags__name']
    ordering_fields = ['price', 'created_at', 'discount', 'final_price']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve', 'featured']:
            return ProductListSerializer
        return ProductCreateUpdateSerializer  # For create, update, partial_update

    # ===================================================================
    # OPTIMIZED + CACHED QUERYSET
    # ===================================================================
    def get_queryset(self):
        # Build cache key
        category_slug = self.request.query_params.get('category')
        brand_id = self.request.query_params.get('brand')
        is_featured = self.request.query_params.get('is_featured')
        cache_key = f"products_qs_{category_slug or 'all'}_{brand_id or 'all'}_{is_featured or 'all'}"

        cached_qs = cache.get(cache_key)
        if cached_qs is not None:
            return cached_qs

        # Base queryset — only active products
        queryset = Product.objects.filter(is_active=True).select_related('brand').prefetch_related(
            'tags',
            'categories',
            'ram_options',
            'storage_options',
            'colors',
            Prefetch(
                'images',
                queryset=ProductImage.objects.filter(is_primary=True),
                to_attr='primary_image_list'
            ),
            Prefetch(
                'images',
                queryset=ProductImage.objects.filter(is_primary=False),
                to_attr='gallery_images_list'
            ),
            'variants'
        )

        # Filters
        if category_slug:
            queryset = queryset.filter(categories__slug=category_slug)
        if brand_id:
            queryset = queryset.filter(brand_id=brand_id)
        if is_featured is not None:
            queryset = queryset.filter(is_featured=(is_featured.lower() == 'true'))

        # Cache for 5 minutes
        cache.set(cache_key, queryset, timeout=60 * 5)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    # ===================================================================
    # CUSTOM ACTION: /api/products/featured/
    # ===================================================================
    @action(detail=False, methods=['get'], url_path='featured')
    @method_decorator(cache_page(60 * 5))
    def featured(self, request):
        queryset = self.get_queryset().filter(is_featured=True)[:12]
        serializer = ProductListSerializer(queryset, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    # ===================================================================
    # OVERRIDE PERFORM CREATE/UPDATE TO ENSURE FINAL PRICE
    # ===================================================================
    def perform_create(self, serializer):
        product = serializer.save()
        product.final_price = self._calc_final_price(product)
        product.save(update_fields=['final_price'])

    def perform_update(self, serializer):
        product = serializer.save()
        product.final_price = self._calc_final_price(product)
        product.save(update_fields=['final_price'])

    def _calc_final_price(self, product):
        if product.discount and product.discount > 0:
            return round(product.price * (1 - product.discount / 100), 2)
        return product.price


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
# PRODUCT IMAGE VIEWSET
# ===================================================================
class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.select_related('product').all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product__id', 'is_primary']