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
# PRODUCT CREATE / UPDATE — FULL CRUD (FIXED)
# ===================================================================
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source='brand', write_only=True
    )
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True, write_only=True
    )
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=60),
        write_only=True,
        required=False
    )

    cover_image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    gallery = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    ram_option_ids = serializers.PrimaryKeyRelatedField(
        queryset=GlobalOption.objects.filter(type='RAM'),
        many=True, required=False, write_only=True
    )
    storage_option_ids = serializers.PrimaryKeyRelatedField(
        queryset=GlobalOption.objects.filter(type='STORAGE'),
        many=True, required=False, write_only=True
    )
    color_option_ids = serializers.PrimaryKeyRelatedField(
        queryset=GlobalOption.objects.filter(type='COLOR'),
        many=True, required=False, write_only=True
    )

    variants = ProductVariantSerializer(many=True, required=False)

    # Read-only
    brand = BrandSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'stock', 'discount',
            'final_price', 'is_active', 'is_featured',
            'colors', 'ram_options', 'storage_options',
            'condition_options', 'features',
            'brand', 'brand_id', 'categories', 'category_ids',
            'tag_names', 'cover_image', 'gallery', 'images', 'variants',
            'ram_option_ids', 'storage_option_ids', 'color_option_ids'
        ]
        read_only_fields = ['final_price', 'id', 'slug']

    # ===================================================================
    # CREATE — FIXED
    # ===================================================================
    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        tag_names = validated_data.pop('tag_names', [])
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', [])
        ram_ids = validated_data.pop('ram_option_ids', [])
        storage_ids = validated_data.pop('storage_option_ids', [])
        color_ids = validated_data.pop('color_option_ids', [])
        variants_data = validated_data.pop('variants', [])

        # Create product
        product = Product.objects.create(**validated_data)

        # M2M: Use .set()
        product.categories.set(category_ids)
        product.ram_options.set(ram_ids)
        product.storage_options.set(storage_ids)
        product.colors.set(color_ids)  # FIXED
        

        # Tags
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(
                name=name.strip().lower(),
                defaults={'slug': slugify(name)}
            )
            product.tags.add(tag)

        # Images
        if cover_file:
            product.cover_image = cover_file
        for img_file in gallery_files:
            ProductImage.objects.create(product=product, image=img_file)

        # Variants
        for var in variants_data:
            ProductVariant.objects.create(product=product, **var)

        # Final price
        product.final_price = self._calc_final_price(product)
        product.save()

        return product

    # ===================================================================
    # UPDATE — FIXED
    # ===================================================================
    def update(self, instance, validated_data):
        category_ids = validated_data.pop('category_ids', None)
        tag_names = validated_data.pop('tag_names', None)
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', None)
        ram_ids = validated_data.pop('ram_option_ids', None)
        storage_ids = validated_data.pop('storage_option_ids', None)
        color_ids = validated_data.pop('color_option_ids', None)
        variants_data = validated_data.pop('variants', None)

        # Update scalar fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if 'title' in validated_data:
            instance.slug = slugify(validated_data['title'])

        # M2M: Use .set() if provided
        if category_ids is not None:
            instance.categories.set(category_ids)
        if ram_ids is not None:
            instance.ram_options.set(ram_ids)
        if storage_ids is not None:
            instance.storage_options.set(storage_ids)
        if color_ids is not None:
            instance.colors.set(color_ids)  # FIXED

        # Tags
        if tag_names is not None:
            instance.tags.clear()
            for name in tag_names:
                tag, _ = Tag.objects.get_or_create(
                    name=name.strip().lower(),
                    defaults={'slug': slugify(name)}
                )
                instance.tags.add(tag)

        # Cover image
        if cover_file is not None:
            instance.cover_image = cover_file

        # Gallery — replace all
        if gallery_files is not None:
            instance.images.all().delete()
            for img_file in gallery_files:
                ProductImage.objects.create(product=instance, image=img_file)

        # Variants — full replace
        if variants_data is not None:
            instance.variants.all().delete()
            for var in variants_data:
                ProductVariant.objects.create(product=instance, **var)

        # Final price
        instance.final_price = self._calc_final_price(instance)
        instance.save()

        return instance

    # ===================================================================
    # PRICE CALC
    # ===================================================================
    def _calc_final_price(self, obj):
        if obj.discount and obj.discount > 0:
            return round(obj.price * (1 - obj.discount / 100), 2)
        return obj.price