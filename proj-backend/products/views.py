# products/views.py
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.core.cache import cache
from django.db.models import Prefetch, Q
from django.db import transaction
from decimal import Decimal, InvalidOperation
import logging

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

logger = logging.getLogger(__name__)


# ===================================================================
# GLOBAL OPTION VIEWSET
# ===================================================================
class GlobalOptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GlobalOption.objects.all().order_by('type', 'value')
    serializer_class = GlobalOptionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['type']
    search_fields = ['value']


# ===================================================================
# PERMISSION: Admin write, anyone read
# ===================================================================
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


# ===================================================================
# PRODUCT VIEWSET — FULLY FIXED & CACHE-SAFE
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
        return ProductCreateUpdateSerializer

    # ===================================================================
    # DYNAMIC + CACHED QUERYSET WITH INVALIDATION
    # ===================================================================
    def get_queryset(self):
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

        # Apply filters
        category_slug = self.request.query_params.get('category')
        brand_id = self.request.query_params.get('brand')
        is_featured = self.request.query_params.get('is_featured')

        if category_slug:
            queryset = queryset.filter(categories__slug=category_slug)
        if brand_id:
            queryset = queryset.filter(brand_id=brand_id)
        if is_featured is not None:
            queryset = queryset.filter(is_featured=(is_featured.lower() == 'true'))

        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    # ===================================================================
    # CACHE KEY HELPER
    # ===================================================================
    def _get_cache_key(self, suffix=''):
        params = self.request.query_params.copy()
        # Normalize featured
        if 'is_featured' in params:
            params['is_featured'] = 'true' if params['is_featured'].lower() == 'true' else 'false'
        key = f"product_qs_{self.action}_{params.urlencode()}_{suffix}"
        return key

    # ===================================================================
    # LIST + RETRIEVE: CACHED
    # ===================================================================
    def list(self, request, *args, **kwargs):
        cache_key = self._get_cache_key()
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
        else:
            serializer = self.get_serializer(queryset, many=True)
            response = Response(serializer.data)

        cache.set(cache_key, response.data, timeout=60 * 5)
        return response

    def retrieve(self, request, *args, **kwargs):
        cache_key = f"product_detail_{kwargs['pk']}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        cache.set(cache_key, data, timeout=60 * 10)
        return Response(data)

    # ===================================================================
    # FEATURED: CACHED
    # ===================================================================
    @action(detail=False, methods=['get'], url_path='featured')
    @method_decorator(cache_page(60 * 5))
    def featured(self, request):
        queryset = self.filter_queryset(self.get_queryset()).filter(is_featured=True)[:12]
        serializer = ProductListSerializer(queryset, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    # ===================================================================
    # CREATE / UPDATE: INVALIDATE CACHES + USE SERIALIZER LOGIC
    # ===================================================================
    @transaction.atomic
    def perform_create(self, serializer):
        product = serializer.save()
        self._invalidate_product_caches()
        return product

    @transaction.atomic
    def perform_update(self, serializer):
        product = serializer.save()
        self._invalidate_product_caches(product)
        return product

    def _invalidate_product_caches(self, product=None):
        # Invalidate list caches
        cache.delete_pattern("product_qs_list_*")
        cache.delete_pattern("product_qs_retrieve_*")
        # Invalidate detail
        if product:
            cache.delete(f"product_detail_{product.id}")
        # Invalidate featured
        cache.delete("view_cache_featured")

    # ===================================================================
    # NO MORE FINAL PRICE HERE — HANDLED IN SERIALIZER
    # ===================================================================
    # Removed _calc_final_price — already in serializer with Decimal safety


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