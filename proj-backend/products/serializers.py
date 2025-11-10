# products/serializers.py
from rest_framework import serializers
from django.utils.text import slugify
from django.db import transaction
import json
import re  # ← FOR public_id EXTRACTION
from decimal import Decimal, ROUND_HALF_UP
import logging

from .models import (
    Category, Brand, Tag, Product, ProductVariant, ProductImage, GlobalOption
)

# ===================================================================
# SETUP LOGGER — SHOWS IN DJANGO CONSOLE
# ===================================================================
logger = logging.getLogger('products.serializers')
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)


# ===================================================================
# GLOBAL OPTION
# ===================================================================
class GlobalOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalOption
        fields = ['id', 'type', 'value']
        extra_kwargs = {
            'type': {'required': False, 'allow_null': True},
            'value': {'required': False, 'allow_null': True},
        }


# ===================================================================
# BASIC SERIALIZERS — ALL OPTIONAL
# ===================================================================
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']
        extra_kwargs = {
            'name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'slug': {'required': False, 'allow_blank': True, 'allow_null': True},
        }


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug']
        extra_kwargs = {
            'name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'slug': {'required': False, 'allow_blank': True, 'allow_null': True},
        }


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']
        extra_kwargs = {
            'name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'slug': {'required': False, 'allow_blank': True, 'allow_null': True},
        }


# ===================================================================
# PRODUCT IMAGE
# ===================================================================
class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']
        extra_kwargs = {
            'alt_text': {'required': False, 'allow_blank': True, 'allow_null': True},
            'is_primary': {'required': False, 'allow_null': True},
        }

    def get_image(self, obj):
        return obj.image.url if obj.image else None


# ===================================================================
# PRODUCT VARIANT — FULLY OPTIONAL
# ===================================================================
class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'color', 'storage', 'ram',
            'processor', 'size', 'price', 'compare_at_price',
            'stock', 'is_active', 'created_at'
        ]
        extra_kwargs = {
            'sku': {'required': False, 'allow_blank': True, 'allow_null': True},
            'color': {'required': False, 'allow_blank': True, 'allow_null': True},
            'storage': {'required': False, 'allow_blank': True, 'allow_null': True},
            'ram': {'required': False, 'allow_blank': True, 'allow_null': True},
            'processor': {'required': False, 'allow_blank': True, 'allow_null': True},
            'size': {'required': False, 'allow_blank': True, 'allow_null': True},
            'price': {'required': False, 'allow_null': True},
            'compare_at_price': {'required': False, 'allow_null': True},
            'stock': {'required': False, 'allow_null': True},
            'is_active': {'required': False, 'allow_null': True},
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.required = False
            field.allow_null = True
            if isinstance(field, serializers.CharField):
                field.allow_blank = True


# ===================================================================
# PRODUCT LIST / DETAIL
# ===================================================================
class ProductListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()

    ram_options = GlobalOptionSerializer(many=True, read_only=True)
    storage_options = GlobalOptionSerializer(many=True, read_only=True)
    colors = GlobalOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description',
            'brand', 'categories', 'tags',
            'cover_image', 'images', 'variants',
            'price', 'stock', 'discount', 'final_price',
            'is_active', 'is_featured',
            'colors', 'ram_options', 'storage_options',
            'condition_options',
            'features', 'created_at'
        ]

    def get_cover_image(self, obj):
        return obj.cover_image.url if obj.cover_image else None


# ===================================================================
# PRODUCT CREATE / UPDATE — FINAL FIX: PYTHON COMPARISON
# ===================================================================
# ===================================================================
# PRODUCT CREATE / UPDATE — FIXED DECIMALS
# ===================================================================
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    brand_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    category_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False, allow_empty=True
    )
    ram_option_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False, allow_empty=True
    )
    storage_option_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False, allow_empty=True
    )
    color_option_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False, allow_empty=True
    )
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=60), write_only=True, required=False, allow_empty=True
    )

    cover_image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    gallery_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False, allow_empty=True
    )
    keep_gallery = serializers.ListField(
        child=serializers.URLField(), write_only=True, required=False, allow_empty=True
    )
    variants = serializers.JSONField(write_only=True, required=False, allow_null=True)

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
            'final_price', 'is_active', 'is_featured', 'slug',
            'brand', 'brand_id',
            'categories', 'category_ids',
            'ram_options', 'ram_option_ids',
            'storage_options', 'storage_option_ids',
            'colors', 'color_option_ids',
            'tag_names', 'cover_image', 'gallery_images', 'keep_gallery', 'images', 'variants', 'tags'
        ]
        read_only_fields = ['final_price', 'id', 'slug']

    # ===========================
    # ROUND DECIMALS BEFORE VALIDATION
    # ===========================
    def validate_price(self, value):
        if value is None:
            return Decimal('0.00')
        return Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    def validate_discount(self, value):
        if value is None:
            return Decimal('0.00')
        return Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    def validate_final_price(self, value):
        if value is None:
            return Decimal('0.00')
        return Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    # ===========================
    # OVERRIDE to_internal_value TO HANDLE STRINGS / JSON
    # ===========================
    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            data = data.copy()
        elif not isinstance(data, dict):
            data = dict(data)

        for field in ['price', 'discount', 'final_price']:
            if field in data and data[field] is not None:
                try:
                    data[field] = str(
                        Decimal(data[field]).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                    )
                except:
                    pass

        variants_raw = data.get('variants')
        if isinstance(variants_raw, str):
            try:
                data['variants'] = json.loads(variants_raw)
            except json.JSONDecodeError:
                data['variants'] = []
        elif variants_raw is None:
            data['variants'] = []

        for field in ['condition_options', 'features']:
            field_raw = data.get(field)
            if isinstance(field_raw, str):
                try:
                    data[field] = json.loads(field_raw)
                except json.JSONDecodeError:
                    data[field] = {}
            elif field_raw is None:
                data[field] = {}

        return super().to_internal_value(data)

    # ===========================
    # CREATE / UPDATE METHODS
    # ===========================
    def _calc_final_price(self, obj):
        price = obj.price or Decimal('0.00')
        discount = obj.discount or Decimal('0.00')
        discount_multiplier = Decimal('1.00') - (discount / Decimal('100'))
        final_price = (price * discount_multiplier).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return final_price

    brand_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    category_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False, allow_empty=True
    )
    ram_option_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False, allow_empty=True
    )
    storage_option_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False, allow_empty=True
    )
    color_option_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False, allow_empty=True
    )
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=60), write_only=True, required=False, allow_empty=True
    )

    cover_image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    gallery_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False, allow_empty=True
    )

    keep_gallery = serializers.ListField(
        child=serializers.URLField(), write_only=True, required=False, allow_empty=True
    )

    variants = serializers.JSONField(write_only=True, required=False, allow_null=True)

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
            'final_price', 'is_active', 'is_featured', 'slug',
            'brand', 'brand_id',
            'categories', 'category_ids',
            'ram_options', 'ram_option_ids',
            'storage_options', 'storage_option_ids',
            'colors', 'color_option_ids',
            'tag_names', 'cover_image', 'gallery_images', 'keep_gallery', 'images', 'variants', 'tags'
        ]
        read_only_fields = ['final_price', 'id', 'slug']

    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            data = data.copy()
        elif not isinstance(data, dict):
            data = dict(data)

        discount_raw = data.get('discount')
        if discount_raw is not None:
            try:
                data['discount'] = str(
                    Decimal(discount_raw).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                )
            except:
                pass

        variants_raw = data.get('variants')
        if isinstance(variants_raw, str):
            try:
                data['variants'] = json.loads(variants_raw)
            except json.JSONDecodeError:
                data['variants'] = []
        elif variants_raw is None:
            data['variants'] = []

        for field in ['condition_options', 'features']:
            field_raw = data.get(field)
            if isinstance(field_raw, str):
                try:
                    data[field] = json.loads(field_raw)
                except json.JSONDecodeError:
                    data[field] = {}
            elif field_raw is None:
                data[field] = {}

        return super().to_internal_value(data)

    def validate_discount(self, value):
        if value is not None:
            return Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return value

    def _generate_unique_slug(self, instance, title):
        base_slug = slugify(title)
        slug = base_slug
        i = 1
        while Product.objects.exclude(pk=instance.pk).filter(slug=slug).exists():
            slug = f"{base_slug}-{i}"
            i += 1
        return slug

    @transaction.atomic
    def create(self, validated_data):
        logger.debug("=== PRODUCT CREATE START ===")
        logger.debug(f"Validated data keys: {list(validated_data.keys())}")

        category_ids = validated_data.pop('category_ids', [])
        ram_ids = validated_data.pop('ram_option_ids', [])
        storage_ids = validated_data.pop('storage_option_ids', [])
        color_ids = validated_data.pop('color_option_ids', [])
        tag_names = validated_data.pop('tag_names', [])
        variants_data = validated_data.pop('variants', [])
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery_images', [])
        keep_urls = validated_data.pop('keep_gallery', None)

        logger.debug(f"cover_image: {cover_file}")
        logger.debug(f"gallery_images: {len(gallery_files)} files")
        logger.debug(f"keep_gallery: {keep_urls}")

        product = Product.objects.create(**validated_data)

        if category_ids:
            product.categories.set(Category.objects.filter(id__in=category_ids))
        if ram_ids:
            product.ram_options.set(GlobalOption.objects.filter(id__in=ram_ids))
        if storage_ids:
            product.storage_options.set(GlobalOption.objects.filter(id__in=storage_ids))
        if color_ids:
            product.colors.set(GlobalOption.objects.filter(id__in=color_ids))

        if tag_names:
            for name in tag_names:
                name = name.strip()
                if name:
                    tag, _ = Tag.objects.get_or_create(name=name, defaults={'slug': slugify(name)})
                    product.tags.add(tag)

        if cover_file:
            product.cover_image = cover_file
            product.save(update_fields=['cover_image'])

        if gallery_files:
            for img_file in gallery_files:
                ProductImage.objects.create(product=product, image=img_file)

        if variants_data:
            for var in variants_data:
                ProductVariant.objects.create(
                    product=product,
                    sku=var.get('sku', ''),
                    color=var.get('color', ''),
                    ram=var.get('ram', ''),
                    storage=var.get('storage', ''),
                    processor=var.get('processor', ''),
                    size=var.get('size', ''),
                    price=var.get('price') or 0,
                    compare_at_price=var.get('compare_at_price'),
                    stock=var.get('stock') or 0,
                    is_active=var.get('is_active', True)
                )

        product.final_price = self._calc_final_price(product)
        product.save(update_fields=['final_price'])
        logger.debug("=== PRODUCT CREATE END ===\n")
        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        logger.debug("=== PRODUCT UPDATE START ===")
        logger.debug(f"Product ID: {instance.id}")
        logger.debug(f"Validated data keys: {list(validated_data.keys())}")

        request = self.context["request"]
        category_ids = validated_data.pop('category_ids', None)
        ram_ids = validated_data.pop('ram_option_ids', None)
        storage_ids = validated_data.pop('storage_option_ids', None)
        color_ids = validated_data.pop('color_option_ids', None)
        tag_names = validated_data.pop('tag_names', None)
        variants_data = validated_data.pop('variants', None)
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery_images', None)
        keep_urls = validated_data.pop('keep_gallery', None)

        logger.debug(f"cover_file: {cover_file}")
        logger.debug(f"gallery_files: {len(gallery_files) if gallery_files else 0} files")
        logger.debug(f"keep_gallery URLs: {keep_urls}")

        # === BASIC FIELDS ===
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if 'title' in validated_data and validated_data['title']:
            instance.slug = self._generate_unique_slug(instance, validated_data['title'])

        # === RELATIONSHIPS ===
        if category_ids is not None:
            instance.categories.set(Category.objects.filter(id__in=category_ids) if category_ids else [])
        if ram_ids is not None:
            instance.ram_options.set(GlobalOption.objects.filter(id__in=ram_ids) if ram_ids else [])
        if storage_ids is not None:
            instance.storage_options.set(GlobalOption.objects.filter(id__in=storage_ids) if storage_ids else [])
        if color_ids is not None:
            instance.colors.set(GlobalOption.objects.filter(id__in=color_ids) if color_ids else [])

        # === TAGS ===
        if tag_names is not None:
            instance.tags.clear()
            for name in tag_names:
                name = name.strip()
                if name:
                    tag, _ = Tag.objects.get_or_create(name=name, defaults={'slug': slugify(name)})
                    instance.tags.add(tag)

        # === COVER IMAGE ===
        if cover_file is not None:
            logger.debug(f"Updating cover_image → {cover_file.name}")
            instance.cover_image = cover_file

        # === GALLERY: SMART UPDATE USING PYTHON COMPARISON (NO DB LOOKUP) ===
        if gallery_files is not None or keep_urls is not None:
            # Extract public_ids from keep_gallery URLs
            keep_public_ids = set()
            if keep_urls:
                for url in keep_urls:
                    match = re.search(r"/v\d+/(.+?)\.(jpg|jpeg|png|webp|gif)", url)
                    if match:
                        keep_public_ids.add(match.group(1))
            logger.debug(f"Keep public_ids: {keep_public_ids}")

            # Fetch current images
            current_images = list(ProductImage.objects.filter(product=instance))

            # Find images to delete (not in keep list)
            to_delete = []
            for img in current_images:
                if img.image and img.image.public_id not in keep_public_ids:
                    to_delete.append(img)

            if to_delete:
                delete_ids = [img.id for img in to_delete]
                logger.debug(f"Deleting {len(to_delete)} images: {delete_ids}")
                ProductImage.objects.filter(id__in=delete_ids).delete()
            else:
                logger.debug("No images to delete")

            # Add new images
            if gallery_files:
                logger.debug(f"Adding {len(gallery_files)} new images")
                for img_file in gallery_files:
                    logger.debug(f"→ Creating: {img_file.name} ({img_file.size} bytes)")
                    ProductImage.objects.create(product=instance, image=img_file)

        # === VARIANTS ===
        if variants_data is not None:
            logger.debug(f"Replacing {instance.variants.count()} variants")
            instance.variants.all().delete()
            for var in variants_data:
                ProductVariant.objects.create(
                    product=instance,
                    sku=var.get('sku', ''),
                    color=var.get('color', ''),
                    ram=var.get('ram', ''),
                    storage=var.get('storage', ''),
                    processor=var.get('processor', ''),
                    size=var.get('size', ''),
                    price=var.get('price') or 0,
                    compare_at_price=var.get('compare_at_price'),
                    stock=var.get('stock') or 0,
                    is_active=var.get('is_active', True)
                )

        # === FINAL PRICE & SAVE ===
        instance.final_price = self._calc_final_price(instance)
        instance.save()

        # === FINAL LOG ===
        final_image_urls = [img.image.url for img in instance.images.all() if img.image]
        logger.debug(f"Final images after save: {final_image_urls}")
        logger.debug("=== PRODUCT UPDATE END ===\n")
        return instance

    def _calc_final_price(self, obj):
        price = obj.price or Decimal('0.00')
        discount = obj.discount or Decimal('0.00')
        discount_multiplier = Decimal('1.00') - (discount / Decimal('100'))
        final_price = (price * discount_multiplier).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return final_price