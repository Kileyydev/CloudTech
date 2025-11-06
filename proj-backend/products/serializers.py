from rest_framework import serializers
from django.utils.text import slugify
from django.db import transaction
from decimal import Decimal, InvalidOperation
import logging

from .models import (
    Category, Brand, Tag, Product, ProductVariant, ProductImage, GlobalOption
)

logger = logging.getLogger(__name__)


# ===================================================================
# GLOBAL OPTION
# ===================================================================
class GlobalOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalOption
        fields = ['id', 'type', 'value']


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
# PRODUCT IMAGE — CLOUDINARY SECURE URL
# ===================================================================
class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']

    def get_image(self, obj):
        if not obj.image:
            return None
        # Force HTTPS for Cloudinary
        url = obj.image.url
        return url.replace('http://', 'https://') if url else None


# ===================================================================
# PRODUCT VARIANT
# ===================================================================
class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'color', 'storage', 'ram',
            'processor', 'size', 'price', 'compare_at_price',
            'stock', 'is_active', 'created_at'
        ]


# ===================================================================
# PRODUCT LIST / DETAIL (READ)
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
            'condition_options', 'features', 'created_at'
        ]

    def get_cover_image(self, obj):
        if not obj.cover_image:
            return None
        url = obj.cover_image.url
        return url.replace('http://', 'https://') if url else None


# ===================================================================
# PRODUCT CREATE / UPDATE — FULL CRUD (SAFE + STABLE)
# ===================================================================
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    # === WRITE-ONLY: Accept IDs as lists ===
    category_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    ram_option_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    storage_option_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    color_option_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=60), write_only=True, required=False
    )

    # === FILES ===
    cover_image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    gallery = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    # === NESTED WRITE ===
    variants = ProductVariantSerializer(many=True, required=False, write_only=True)

    # === READ-ONLY ===
    brand = BrandSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    ram_options = GlobalOptionSerializer(many=True, read_only=True)
    storage_options = GlobalOptionSerializer(many=True, read_only=True)
    colors = GlobalOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'stock', 'discount',
            'final_price', 'is_active', 'is_featured',
            'brand', 'brand_id',
            'categories', 'category_ids',
            'ram_options', 'ram_option_ids',
            'storage_options', 'storage_option_ids',
            'colors', 'color_option_ids',
            'tag_names', 'cover_image', 'gallery', 'images', 'variants'
        ]
        read_only_fields = ['final_price', 'id', 'slug']

    # === VALIDATION: Ensure discount & price are Decimal-safe ===
    def validate(self, data):
        price = data.get('price')
        discount = data.get('discount')

        if price is not None:
            try:
                data['price'] = Decimal(str(price))
            except (InvalidOperation, TypeError, ValueError):
                raise serializers.ValidationError({"price": "Must be a valid decimal number."})

        if discount is not None:
            try:
                data['discount'] = Decimal(str(discount))
            except (InvalidOperation, TypeError, ValueError):
                raise serializers.ValidationError({"discount": "Must be a valid decimal number."})

        return data

    # === CREATE ===
    @transaction.atomic
    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        ram_ids = validated_data.pop('ram_option_ids', [])
        storage_ids = validated_data.pop('storage_option_ids', [])
        color_ids = validated_data.pop('color_option_ids', [])
        tag_names = validated_data.pop('tag_names', [])
        variants_data = validated_data.pop('variants', [])
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', [])

        # Create product
        product = Product.objects.create(**validated_data)

        self._update_m2m_relations(product, category_ids, ram_ids, storage_ids, color_ids, tag_names)
        self._update_images(product, cover_file, gallery_files)
        self._update_variants(product, variants_data)

        product.final_price = self._calc_final_price(product)
        product.save(update_fields=['final_price'])

        return product

    # === UPDATE ===
    @transaction.atomic
    def update(self, instance, validated_data):
        category_ids = validated_data.pop('category_ids', None)
        ram_ids = validated_data.pop('ram_option_ids', None)
        storage_ids = validated_data.pop('storage_option_ids', None)
        color_ids = validated_data.pop('color_option_ids', None)
        tag_names = validated_data.pop('tag_names', None)
        variants_data = validated_data.pop('variants', None)
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', None)

        # Update scalar fields
        title_changed = 'title' in validated_data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if title_changed:
            instance.slug = slugify(validated_data['title'])

        # Conditional updates
        if category_ids is not None:
            self._update_categories(instance, category_ids)
        if ram_ids is not None:
            self._update_ram_options(instance, ram_ids)
        if storage_ids is not None:
            self._update_storage_options(instance, storage_ids)
        if color_ids is not None:
            self._update_colors(instance, color_ids)
        if tag_names is not None:
            self._update_tags(instance, tag_names)
        if cover_file is not None or gallery_files is not None:
            self._update_images(instance, cover_file, gallery_files)
        if variants_data is not None:
            self._update_variants(instance, variants_data)

        instance.final_price = self._calc_final_price(instance)
        instance.save()

        return instance

    # === HELPER: M2M Relations ===
    def _update_m2m_relations(self, product, category_ids, ram_ids, storage_ids, color_ids, tag_names):
        if category_ids:
            product.categories.set(Category.objects.filter(id__in=category_ids))
        if ram_ids:
            product.ram_options.set(GlobalOption.objects.filter(id__in=ram_ids, type='RAM'))
        if storage_ids:
            product.storage_options.set(GlobalOption.objects.filter(id__in=storage_ids, type='STORAGE'))
        if color_ids:
            product.colors.set(GlobalOption.objects.filter(id__in=color_ids, type='COLOR'))
        if tag_names:
            product.tags.clear()
            for name in tag_names:
                tag, _ = Tag.objects.get_or_create(
                    name=name.strip().lower(),
                    defaults={'slug': slugify(name)}
                )
                product.tags.add(tag)

    # === HELPER: Images ===
    def _update_images(self, product, cover_file, gallery_files):
        if cover_file is not None:
            product.cover_image = cover_file
            product.save(update_fields=['cover_image'])

        if gallery_files is not None:
            product.images.all().delete()
            for img_file in gallery_files:
                ProductImage.objects.create(product=product, image=img_file)

    # === HELPER: Variants ===
    def _update_variants(self, product, variants_data):
        product.variants.all().delete()
        for var in variants_data:
            ProductVariant.objects.create(product=product, **var)

    # === HELPER: Final Price (SAFE DECIMAL MATH) ===
    def _calc_final_price(self, obj):
        if not obj.price:
            return Decimal('0.00')

        if obj.discount and obj.discount > 0:
            try:
                discount_factor = obj.discount / Decimal('100')
                discounted = obj.price * (Decimal('1') - discount_factor)
                return discounted.quantize(Decimal('0.01'))  # Round to 2 decimals
            except (InvalidOperation, TypeError) as e:
                logger.error(f"Discount calculation failed: {e}")
                return obj.price

        return obj.price.quantize(Decimal('0.01'))