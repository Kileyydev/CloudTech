# products/serializers.py
from rest_framework import serializers
from django.conf import settings
from django.utils.text import slugify
from .models import Category, Brand, Tag, Product, ProductVariant, ProductImage


# ===================================================================
# BASIC SERIALIZERS
# ===================================================================
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


# ===================================================================
# PRODUCT IMAGE (WITH FULL URL)
# ===================================================================
class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        # Fallback for non-request contexts
        base_url = getattr(settings, 'SITE_URL', 'https://cloudtech-c4ft.onrender.com')
        return f"{base_url}{obj.image.url}"


# ===================================================================
# PRODUCT VARIANT
# ===================================================================
class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'color', 'storage', 'ram', 'processor',
            'size', 'price', 'compare_at_price', 'stock', 'is_active'
        ]


# ===================================================================
# PRODUCT LIST (READ-ONLY)
# ===================================================================
class ProductListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    images = ProductImageSerializer(many=True, read_only=True, source='productimage_set')
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'brand', 'categories', 'tags',
            'cover_image', 'images', 'price', 'stock', 'discount', 'final_price',
            'is_active', 'is_featured', 'colors', 'storage_options',
            'condition_options', 'features', 'created_at'
        ]

    def get_cover_image(self, obj):
        if not obj.cover_image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.cover_image.url)
        base_url = getattr(settings, 'SITE_URL', 'https://cloudtech-c4ft.onrender.com')
        return f"{base_url}{obj.cover_image.url}"


# ===================================================================
# PRODUCT CREATE / UPDATE
# ===================================================================
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    # Write-only fields
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source='brand', write_only=True
    )
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True, write_only=True
    )
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=60), write_only=True, required=False
    )
    cover_image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    gallery = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    # Read-only fields
    brand = BrandSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True, source='productimage_set')

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'stock', 'discount',
            'final_price', 'is_active', 'is_featured', 'colors',
            'storage_options', 'condition_options', 'features',
            'brand', 'brand_id', 'categories', 'category_ids',
            'tag_names', 'cover_image', 'gallery', 'images'
        ]
        read_only_fields = ['final_price', 'id', 'slug']

    # ===================================================================
    # CREATE
    # ===================================================================
    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        tag_names = validated_data.pop('tag_names', [])
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', [])

        # Auto-generate slug
        if 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['title'])

        product = Product.objects.create(**validated_data)
        product.categories.set(category_ids)

        # Handle tags
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name, defaults={'slug': slugify(name)})
            product.tags.add(tag)

        # Cover image
        if cover_file:
            product.cover_image = cover_file

        # Gallery images
        for img_file in gallery_files:
            ProductImage.objects.create(product=product, image=img_file)

        product.final_price = self._calc_final_price(product)
        product.save()
        return product

    # ===================================================================
    # UPDATE
    # ===================================================================
    def update(self, instance, validated_data):
        category_ids = validated_data.pop('category_ids', None)
        tag_names = validated_data.pop('tag_names', None)
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', None)

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update slug if title changed
        if 'title' in validated_data:
            instance.slug = slugify(validated_data['title'])

        # Categories
        if category_ids is not None:
            instance.categories.set(category_ids)

        # Tags
        if tag_names is not None:
            instance.tags.clear()
            for name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=name, defaults={'slug': slugify(name)})
                instance.tags.add(tag)

        # Cover image
        if cover_file is not None:
            instance.cover_image = cover_file

        # Gallery
        if gallery_files is not None:
            instance.productimage_set.all().delete()
            for img_file in gallery_files:
                ProductImage.objects.create(product=instance, image=img_file)

        instance.final_price = self._calc_final_price(instance)
        instance.save()
        return instance

    # ===================================================================
    # HELPERS
    # ===================================================================
    def _calc_final_price(self, obj):
        if obj.discount and obj.discount > 0:
            return round(obj.price * (1 - obj.discount / 100), 2)
        return obj.price