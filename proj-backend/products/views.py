# products/views.py
from rest_framework import viewsets, permissions, filters
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.core.cache import cache
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
import logging

from .models import Product, ProductVariant, Category, Brand, ProductImage, Color
from .serializers import (
    ProductListSerializer,
    ProductCreateUpdateSerializer,
    ProductVariantSerializer,
    CategorySerializer,
    BrandSerializer,
    ProductImageSerializer,
    ColorSerializer
)

logger = logging.getLogger(__name__)

# ===================================================================
# CUSTOM PERMISSION: Admin can write, anyone can read
# ===================================================================
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

# ===================================================================
# COLOR VIEWSET — PUBLIC READ
# ===================================================================
class ColorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Color.objects.all().order_by('name')
    serializer_class = ColorSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

# ===================================================================
# PRODUCT VIEWSET — FULLY OPTIMIZED
# ===================================================================
class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'brand__id', 'categories__id', 'is_active', 'is_featured',
        'storage_gb', 'ram_gb', 'color__id', 'condition'
    ]
    search_fields = ['title', 'description', 'brand__name', 'tags__name']
    ordering_fields = ['price', 'created_at', 'discount', 'final_price', 'stock']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve', 'featured']:
            return ProductListSerializer
        return ProductCreateUpdateSerializer

    def get_queryset(self):
        category_slug = self.request.query_params.get('category')
        is_featured = self.request.query_params.get('is_featured') == 'true'
        cache_key = f"products_v3_{category_slug or 'all'}_featured_{is_featured}"

        cached_qs = cache.get(cache_key)
        if cached_qs is not None:
            return cached_qs

        queryset = Product.objects.filter(is_active=True).select_related('brand', 'color')
        if category_slug:
            queryset = queryset.filter(categories__slug=category_slug)
        if is_featured:
            queryset = queryset.filter(is_featured=True)

        queryset = queryset.prefetch_related(
            'tags',
            'categories',
            Prefetch('images', queryset=ProductImage.objects.filter(is_primary=True), to_attr='primary_image'),
            Prefetch('images', queryset=ProductImage.objects.all(), to_attr='gallery_images')
        )

        cache.set(cache_key, queryset, timeout=60 * 5)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def create(self, request, *args, **kwargs):
        logger.info(f"=== PRODUCT CREATE STARTED ===\nDATA: {request.data}\nFILES: {request.FILES}")
        try:
            # Handle category_ids[] from frontend
            data = request.data.copy()
            category_ids = request.data.getlist('category_ids[]') or request.data.getlist('category_ids')
            if category_ids:
                data.setlist('category_ids', category_ids)

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            product = serializer.save()
            headers = self.get_success_headers(serializer.data)
            logger.info(f"PRODUCT CREATED: {product.id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        except Exception as e:
            logger.error(f"PRODUCT CREATE FAILED: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to create product", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='featured', url_name='featured')
    @method_decorator(cache_page(60 * 5))
    def featured(self, request):
        queryset = self.get_queryset().filter(is_featured=True)[:12]
        serializer = ProductListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

# ===================================================================
# PRODUCT VARIANT VIEWSET
# ===================================================================
class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.select_related('product__brand', 'color').all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'product__id', 'color__id', 'storage', 'ram', 'condition', 'is_active'
    ]
    search_fields = ['sku', 'product__title']
    ordering_fields = ['price', 'stock', 'created_at']
    ordering = ['-created_at']

# ===================================================================
# CATEGORY VIEWSET
# ===================================================================
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'slug']

# ===================================================================
# BRAND VIEWSET
# ===================================================================
class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all().order_by('name')
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'slug']

# ===================================================================
# PRODUCT IMAGE VIEWSET
# ===================================================================
class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.select_related('product', 'variant').all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product__id', 'variant__id', 'is_primary']