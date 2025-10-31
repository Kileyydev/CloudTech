# products/views.py
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.conf import settings
from django.core.cache import cache

from .models import Product, ProductVariant, Category, Brand, Tag, ProductImage
from .serializers import (
    ProductListSerializer,
    ProductCreateUpdateSerializer,
    ProductVariantSerializer,
    CategorySerializer,
    BrandSerializer,
    ProductImageSerializer
)


# ----------------------------------------
# ✅ Custom permission
# ----------------------------------------
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


# ----------------------------------------
# ✅ Product ViewSet (with caching)
# ----------------------------------------
@method_decorator(cache_page(60 * 5), name='list')  # cache list responses for 5 min
@method_decorator(cache_page(60 * 5), name='list')
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.prefetch_related(
        'variants', 'images', 'tags', 'categories'
    ).select_related('brand').all()

    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand__id', 'categories__id', 'is_active', 'is_featured']
    search_fields = ['title', 'description', 'brand__name', 'variants__sku']
    ordering_fields = ['created_at', 'title', 'price']

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ProductListSerializer
        return ProductCreateUpdateSerializer

    def get_queryset(self):
        category_slug = self.request.query_params.get('category')
        cache_key = f"product_qs_{category_slug or 'all'}"
        qs = cache.get(cache_key)
        if qs is not None:
            return qs

        queryset = super().get_queryset()
        if category_slug:
            queryset = queryset.filter(categories__slug=category_slug, is_active=True)
        else:
            queryset = queryset.filter(is_active=True)

        cache.set(cache_key, queryset, timeout=60 * 5)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    @action(detail=False, methods=['get'])
    def featured(self, request):
        cache_key = "featured_products"
        data = cache.get(cache_key)
        if data is None:
            queryset = self.get_queryset().filter(is_featured=True)
            serializer = ProductListSerializer(queryset, many=True, context={'request': request})
            data = serializer.data
            cache.set(cache_key, data, timeout=60 * 5)
        return Response(data)


# ----------------------------------------
# ✅ ProductVariant ViewSet
# ----------------------------------------
class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.select_related('product').all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product__id', 'color', 'storage', 'ram', 'is_active']
    search_fields = ['sku', 'processor']
    ordering_fields = ['price', 'stock']


# ----------------------------------------
# ✅ Category ViewSet
# ----------------------------------------
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


# ----------------------------------------
# ✅ Brand ViewSet
# ----------------------------------------
class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
