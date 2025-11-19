# products/views.py
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.core.cache import cache
from django.db.models import Prefetch
import traceback

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
# GLOBAL OPTION VIEWSET — READ-ONLY
# ===================================================================
class GlobalOptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GlobalOption.objects.all().order_by('type', 'value')
    serializer_class = GlobalOptionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['type']
    search_fields = ['value']


# ===================================================================
# PERMISSIONS
# ===================================================================
class AllowAll(permissions.BasePermission):
    def has_permission(self, request, view):
        return True


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


# ===================================================================
# PRODUCT VIEWSET — UPDATED FOR CATEGORY SLUG FILTER
# ===================================================================

class AllowAll(permissions.BasePermission):
    def has_permission(self, request, view):
        return True


# ==========================================================
# PRODUCT VIEWSET — FULLY OPTIMIZED
# ==========================================================
class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAll]
    parser_classes = [MultiPartParser, FormParser]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand__id', 'categories__id', 'categories__slug', 'is_active', 'is_featured']
    search_fields = ['title', 'description', 'brand__name', 'tags__name']
    ordering_fields = ['price', 'created_at', 'discount', 'final_price']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve', 'featured']:
            return ProductListSerializer
        return ProductCreateUpdateSerializer

    def get_serializer(self, *args, **kwargs):
        if self.action in ['update', 'partial_update']:
            kwargs.setdefault('partial', True)
        return super().get_serializer(*args, **kwargs)

    def get_queryset(self):
        # Build cache key from sorted query params to avoid hash issues
        query_params_tuple = tuple(sorted(self.request.query_params.items()))
        cache_key = f"products_all_{hash(query_params_tuple)}"
        cached_qs = cache.get(cache_key)
        if cached_qs is not None:
            return cached_qs

        # Prefetch related objects for efficiency
        queryset = Product.objects.select_related('brand').prefetch_related(
            'tags',
            'categories',
            'ram_options',
            'storage_options',
            'colors',
            Prefetch('images', queryset=ProductImage.objects.filter(is_primary=True), to_attr='primary_image_list'),
            Prefetch('images', queryset=ProductImage.objects.filter(is_primary=False), to_attr='gallery_images_list'),
            'variants'
        )

        # Apply filters
        category_slug = self.request.query_params.get('categories__slug')
        brand_id = self.request.query_params.get('brand__id')
        is_featured = self.request.query_params.get('is_featured')
        is_active = self.request.query_params.get('is_active')

        if category_slug:
            queryset = queryset.filter(categories__slug=category_slug)
        if brand_id:
            queryset = queryset.filter(brand_id=brand_id)
        if is_featured is not None:
            queryset = queryset.filter(is_featured=(is_featured.lower() == 'true'))
        if is_active is not None:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))

        cache.set(cache_key, queryset, timeout=60 * 5)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    # ==========================================================
    # FEATURED PRODUCTS
    # ==========================================================
    @action(detail=False, methods=['get'], url_path='featured')
    @method_decorator(cache_page(60 * 5))
    def featured(self, request):
        queryset = self.get_queryset().filter(is_featured=True)[:12]
        serializer = ProductListSerializer(queryset, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    # ==========================================================
    # SAFE CREATE & UPDATE WITH ERROR LOGGING
    # ==========================================================
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print("🚨 ERROR in Product create:", e)
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            print("🚨 ERROR in Product update:", e)
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ===================================================================
# PRODUCT VARIANT VIEWSET
# ===================================================================
class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.select_related('product__brand').all()
    serializer_class = ProductVariantSerializer
    permission_classes = [AllowAll]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product__id', 'color', 'storage', 'ram', 'processor']
    search_fields = ['sku', 'processor', 'product__title']
    ordering_fields = ['price', 'stock', 'created_at']
    ordering = ['-created_at']


# ===================================================================
# CATEGORY VIEWSET — READ-ONLY
# ===================================================================
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'slug']


# ===================================================================
# BRAND VIEWSET — READ-ONLY
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
    permission_classes = [AllowAll]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product__id']
