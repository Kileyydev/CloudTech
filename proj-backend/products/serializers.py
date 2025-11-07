# products/serializers.py
from rest_framework import serializers
from django.utils.text import slugify
from django.db import transaction
from .models import (
    Category, Brand, Tag, Product, ProductVariant, ProductImage, GlobalOption
)


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
# BASIC SERIALIZERS — ALL OPTIONAL, NO allow_blank
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
# PRODUCT VARIANT — NO allow_blank ON NON-CHAR FIELDS
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
            'condition_options', 'features', 'created_at'
        ]

    def get_cover_image(self, obj):
        return obj.cover_image.url if obj.cover_image else None


# ===================================================================
# PRODUCT CREATE / UPDATE — FULLY OPTIONAL
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
    gallery = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False, allow_empty=True
    )

    variants = ProductVariantSerializer(many=True, required=False, allow_empty=True)

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
            'tag_names', 'cover_image', 'gallery', 'images', 'variants', 'tags'
        ]
        read_only_fields = ['final_price', 'id', 'slug']
        extra_kwargs = {
            'title': {'required': False, 'allow_blank': True, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'price': {'required': False, 'allow_null': True},
            'stock': {'required': False, 'allow_null': True},
            'discount': {'required': False, 'allow_null': True},
            'is_active': {'required': False, 'allow_null': True},
            'is_featured': {'required': False, 'allow_null': True},
        }

    def validate(self, data):
        return data  # No validation

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
                ProductVariant.objects.create(product=product, **var)

        product.final_price = self._calc_final_price(product)
        product.save(update_fields=['final_price'])

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
        gallery_files = validated_data.pop('gallery', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if 'title' in validated_data and validated_data['title']:
            instance.slug = slugify(validated_data['title'])

        if category_ids is not None:
            instance.categories.set(Category.objects.filter(id__in=category_ids) if category_ids else [])
        if ram_ids is not None:
            instance.ram_options.set(GlobalOption.objects.filter(id__in=ram_ids) if ram_ids else [])
        if storage_ids is not None:
            instance.storage_options.set(GlobalOption.objects.filter(id__in=storage_ids) if storage_ids else [])
        if color_ids is not None:
            instance.colors.set(GlobalOption.objects.filter(id__in=color_ids) if color_ids else [])

        if tag_names is not None:
            instance.tags.clear()
            for name in tag_names:
                name = name.strip()
                if name:
                    tag, _ = Tag.objects.get_or_create(name=name, defaults={'slug': slugify(name)})
                    instance.tags.add(tag)

        if cover_file is not None:
            instance.cover_image = cover_file

        if gallery_files is not None:
            instance.images.all().delete()
            for img_file in gallery_files:
                ProductImage.objects.create(product=instance, image=img_file)

        if variants_data is not None:
            instance.variants.all().delete()
            for var in variants_data:
                ProductVariant.objects.create(product=instance, **var)

        instance.final_price = self._calc_final_price(instance)
        instance.save()

        return instance

    def _calc_final_price(self, obj):
        if obj.price is not None and obj.discount is not None and obj.discount > 0:
            return round(float(obj.price) * (1 - obj.discount / 100), 2)
        return obj.price