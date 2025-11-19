# products/serializers.py
import json
import re
from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction
from rest_framework import serializers
from django.utils.text import slugify

from .models import (
    Category, Brand, Tag, GlobalOption,
    Product, ProductVariant, ProductImage
)


# ===================================================================
# CUSTOM FIELD: Accept JSON as Blob from React
# ===================================================================
class BlobJSONField(serializers.Field):
    def to_internal_value(self, data):
        if hasattr(data, 'read'):
            try:
                content = data.read()
                if isinstance(content, bytes):
                    content = content.decode('utf-8')
                parsed = json.loads(content)
            except Exception as e:
                raise serializers.ValidationError(f"Invalid variants JSON: {e}")
        elif isinstance(data, str):
            try:
                parsed = json.loads(data)
            except json.JSONDecodeError:
                parsed = []
        else:
            parsed = data if isinstance(data, (list, dict)) else []

        if isinstance(parsed, dict):
            parsed = [parsed]
        return parsed or []


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


class GlobalOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalOption
        fields = ['id', 'type', 'value']


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']

    def get_image(self, obj):
        return obj.image.url if obj.image else None


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'color', 'ram', 'storage', 'processor',
            'size', 'price', 'compare_at_price', 'stock',
            'is_active', 'final_price', 'created_at'
        ]


# ===================================================================
# PRODUCT LIST / DETAIL
# ===================================================================
class ProductListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    ram_options = GlobalOptionSerializer(many=True, read_only=True)
    storage_options = GlobalOptionSerializer(many=True, read_only=True)
    colors = GlobalOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'price', 'stock',
            'discount', 'final_price', 'is_active', 'is_featured',
            'cover_image', 'images', 'variants', 'brand', 'categories',
            'tags', 'ram_options', 'storage_options', 'colors',
            'condition_options', 'features', 'created_at', 'has_variants'
        ]

    def get_cover_image(self, obj):
        return obj.cover_image.url if obj.cover_image else None


# ===================================================================
# PRODUCT CREATE / UPDATE — FINAL BULLETPROOF VERSION
# ===================================================================
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    brand_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    category_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    ram_option_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    storage_option_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    color_option_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    tag_names = serializers.ListField(child=serializers.CharField(max_length=60), write_only=True, required=False)

    cover_image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    gallery_images = serializers.ListField(child=serializers.ImageField(), write_only=True, required=False)
    keep_gallery = serializers.ListField(child=serializers.URLField(), write_only=True, required=False)
    variants = BlobJSONField(write_only=True, required=False)

    # Read-only
    brand = BrandSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    ram_options = GlobalOptionSerializer(many=True, read_only=True)
    storage_options = GlobalOptionSerializer(many=True, read_only=True)
    colors = GlobalOptionSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'stock', 'discount',
            'is_active', 'is_featured', 'slug', 'final_price',
            'brand', 'brand_id', 'categories', 'category_ids',
            'ram_options', 'ram_option_ids', 'storage_options', 'storage_option_ids',
            'colors', 'color_option_ids', 'tag_names',
            'cover_image', 'gallery_images', 'keep_gallery', 'images',
            'variants', 'tags', 'condition_options', 'features'
        ]
        read_only_fields = ['id', 'slug', 'final_price']

    @transaction.atomic
    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        ram_ids = validated_data.pop('ram_option_ids', [])
        storage_ids = validated_data.pop('storage_option_ids', [])
        color_ids = validated_data.pop('color_option_ids', [])
        tag_names = validated_data.pop('tag_names', [])
        variants_data = validated_data.pop('variants', [])
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery_images', [])
        keep_urls = validated_data.pop('keep_gallery', [])

        product = Product.objects.create(**validated_data)

        # Relationships
        if category_ids:
            product.categories.set(Category.objects.filter(id__in=category_ids))
        if ram_ids:
            product.ram_options.set(GlobalOption.objects.filter(id__in=ram_ids))
        if storage_ids:
            product.storage_options.set(GlobalOption.objects.filter(id__in=storage_ids))
        if color_ids:
            product.colors.set(GlobalOption.objects.filter(id__in=color_ids))

        # Tags
        if tag_names:
            for name in tag_names:
                name = name.strip()
                if name:
                    tag, _ = Tag.objects.get_or_create(name=name, defaults={'slug': slugify(name)})
                    product.tags.add(tag)

        # Cover image
        if cover_file:
            product.cover_image = cover_file
            product.save(update_fields=['cover_image'])

        # Gallery: Add new images
        if gallery_files:
            for img in gallery_files:
                ProductImage.objects.create(product=product, image=img)

        # Gallery: Delete old images not in keep_gallery (Cloudinary-safe)
        if keep_urls:
            keep_public_ids = {
                match.group(1) for url in keep_urls
                if (match := re.search(r"/v\d+/(.+?)\.", url))
            }
            for img_obj in product.images.all():
                if img_obj.image and img_obj.image.public_id not in keep_public_ids:
                    img_obj.delete()

        # Variants
        if variants_data:
            for var in variants_data:
                if isinstance(var, dict):
                    ProductVariant.objects.create(
                        product=product,
                        sku=var.get('sku'),
                        color=var.get('color'),
                        ram=var.get('ram'),
                        storage=var.get('storage'),
                        processor=var.get('processor'),
                        size=var.get('size'),
                        price=var.get('price'),
                        compare_at_price=var.get('compare_at_price'),
                        stock=var.get('stock', 0),
                        is_active=var.get('is_active', True)
                    )

        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        category_ids = validated_data.pop('category_ids', None)
        ram_ids = validated_data.pop('ram_option_ids', None)
        storage_ids = validated_data.pop('storage_option_ids', None)
        color_ids = validated_data.pop('color_option_ids', None)
        tag_names = validated_data.pop('tag_names', None)
        variants_data = validated_data.pop('variants', None)
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery_images', None)
        keep_urls = validated_data.pop('keep_gallery', None)

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Relationships
        if category_ids is not None:
            instance.categories.set(category_ids and Category.objects.filter(id__in=category_ids) or [])
        if ram_ids is not None:
            instance.ram_options.set(ram_ids and GlobalOption.objects.filter(id__in=ram_ids) or [])
        if storage_ids is not None:
            instance.storage_options.set(storage_ids and GlobalOption.objects.filter(id__in=storage_ids) or [])
        if color_ids is not None:
            instance.colors.set(color_ids and GlobalOption.objects.filter(id__in=color_ids) or [])

        # Tags
        if tag_names is not None:
            instance.tags.clear()
            for name in tag_names:
                name = name.strip()
                if name:
                    tag, _ = Tag.objects.get_or_create(name=name, defaults={'slug': slugify(name)})
                    instance.tags.add(tag)

        # Cover image
        if cover_file is not None:
            instance.cover_image = cover_file

        # Gallery: Cloudinary-safe delete + add
        if gallery_files is not None or keep_urls is not None:
            keep_public_ids = {
                match.group(1) for url in (keep_urls or [])
                if (match := re.search(r"/v\d+/(.+?)\.", url))
            }
            # Delete images not in keep list (safe for CloudinaryField)
            for img_obj in instance.images.all():
                if img_obj.image and img_obj.image.public_id not in keep_public_ids:
                    img_obj.delete()

            # Add new images
            if gallery_files:
                for img in gallery_files:
                    ProductImage.objects.create(product=instance, image=img)

        # Variants
        if variants_data is not None:
            instance.variants.all().delete()
            for var in variants_data:
                if isinstance(var, dict):
                    ProductVariant.objects.create(product=instance, **{
                        'sku': var.get('sku'),
                        'color': var.get('color'),
                        'ram': var.get('ram'),
                        'storage': var.get('storage'),
                        'processor': var.get('processor'),
                        'size': var.get('size'),
                        'price': var.get('price'),
                        'compare_at_price': var.get('compare_at_price'),
                        'stock': var.get('stock', 0),
                        'is_active': var.get('is_active', True),
                    })

        instance.save()
        return instance