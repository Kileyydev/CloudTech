from rest_framework import serializers
from django.utils.text import slugify
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
# PRODUCT IMAGE — CLOUDINARY URL
# ===================================================================
class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']

    def get_image(self, obj):
        return obj.image.url if obj.image else None


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
        return obj.cover_image.url if obj.cover_image else None


# ===================================================================
# PRODUCT CREATE / UPDATE — FULL CRUD (SAFE + STABLE)
# ===================================================================
# ===================================================================
# PRODUCT CREATE / UPDATE — FIXED & STABLE
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
    variants = ProductVariantSerializer(many=True, required=False)

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

    # === CREATE ===
    def create(self, validated_data):
        # Pop M2M IDs
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

        # === SET M2M USING .set() + Queryset ===
        if category_ids:
            product.categories.set(Category.objects.filter(id__in=category_ids))
        if ram_ids:
            product.ram_options.set(GlobalOption.objects.filter(id__in=ram_ids, type='RAM'))
        if storage_ids:
            product.storage_options.set(GlobalOption.objects.filter(id__in=storage_ids, type='STORAGE'))
        if color_ids:
            product.colors.set(GlobalOption.objects.filter(id__in=color_ids, type='COLOR'))

        # === TAGS ===
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(
                name=name.strip().lower(),
                defaults={'slug': slugify(name)}
            )
            product.tags.add(tag)

        # === COVER & GALLERY ===
        if cover_file:
            product.cover_image = cover_file
            product.save(update_fields=['cover_image'])

        for img_file in gallery_files:
            ProductImage.objects.create(product=product, image=img_file)

        # === VARIANTS ===
        for var in variants_data:
            ProductVariant.objects.create(product=product, **var)

        # === FINAL PRICE ===
        product.final_price = self._calc_final_price(product)
        product.save()

        return product

    # === UPDATE ===
    def update(self, instance, validated_data):
        # Pop M2M
        category_ids = validated_data.pop('category_ids', None)
        ram_ids = validated_data.pop('ram_option_ids', None)
        storage_ids = validated_data.pop('storage_option_ids', None)
        color_ids = validated_data.pop('color_option_ids', None)
        tag_names = validated_data.pop('tag_names', None)
        variants_data = validated_data.pop('variants', None)
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', None)

        # Update scalar fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if 'title' in validated_data:
            instance.slug = slugify(validated_data['title'])

        # === M2M SET ===
        if category_ids is not None:
            instance.categories.set(Category.objects.filter(id__in=category_ids))
        if ram_ids is not None:
            instance.ram_options.set(GlobalOption.objects.filter(id__in=ram_ids))
        if storage_ids is not None:
            instance.storage_options.set(GlobalOption.objects.filter(id__in=storage_ids))
        if color_ids is not None:
            instance.colors.set(GlobalOption.objects.filter(id__in=color_ids))

        # === TAGS ===
        if tag_names is not None:
            instance.tags.clear()
            for name in tag_names:
                tag, _ = Tag.objects.get_or_create(
                    name=name.strip().lower(),
                    defaults={'slug': slugify(name)}
                )
                instance.tags.add(tag)

        # === COVER ===
        if cover_file is not None:
            instance.cover_image = cover_file

        # === GALLERY REPLACE ===
        if gallery_files is not None:
            instance.images.all().delete()
            for img_file in gallery_files:
                ProductImage.objects.create(product=instance, image=img_file)

        # === VARIANTS REPLACE ===
        if variants_data is not None:
            instance.variants.all().delete()
            for var in variants_data:
                ProductVariant.objects.create(product=instance, **var)

        # === FINAL PRICE ===
        instance.final_price = self._calc_final_price(instance)
        instance.save()

        return instance

    def _calc_final_price(self, obj):
        if obj.discount and obj.discount > 0:
            return round(obj.price * (1 - obj.discount / 100), 2)
        return obj.price