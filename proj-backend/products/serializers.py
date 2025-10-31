# products/serializers.py
from rest_framework import serializers
from django.conf import settings
from .models import Category, Brand, Tag, Product, ProductVariant, ProductImage


# ---------- BASIC ----------
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug']


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"{getattr(settings, 'SITE_URL', '')}{obj.image.url}"
        return None


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'color', 'storage', 'ram', 'processor',
            'size', 'price', 'compare_at_price', 'stock', 'is_active'
        ]


# ---------- LIST / DETAIL ----------
class ProductListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)  # ← REMOVED source='images'
    cover_image = serializers.SerializerMethodField()
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'brand', 'categories', 'tags',
            'cover_image', 'images', 'price', 'stock', 'discount', 'final_price',
            'is_active', 'is_featured', 'colors', 'storage_options',
            'condition_options', 'features', 'created_at'
        ]

    def get_cover_image(self, obj):
        request = self.context.get('request')
        if obj.cover_image:
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return f"{getattr(settings, 'SITE_URL', '')}{obj.cover_image.url}"
        return None


# ---------- CREATE / UPDATE ----------
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    # Write-only
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source='brand', write_only=True
    )
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True, write_only=True
    )
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=60), write_only=True, required=False
    )
    cover_image = serializers.ImageField(write_only=True, required=False)
    gallery = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    # Read-only
    brand = BrandSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)  # ← REMOVED source='images'

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'stock', 'discount',
            'final_price', 'is_active', 'is_featured', 'colors',
            'storage_options', 'condition_options', 'features',
            'brand', 'brand_id', 'categories', 'category_ids',
            'tag_names', 'cover_image', 'gallery', 'images'
        ]
        read_only_fields = ['final_price', 'id']

    # CREATE
    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        tag_names = validated_data.pop('tag_names', [])
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', [])

        product = Product.objects.create(**validated_data)
        product.categories.set(category_ids)

        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name)
            product.tags.add(tag)

        if cover_file:
            product.cover_image = cover_file

        for img in gallery_files:
            ProductImage.objects.create(product=product, image=img)

        product.final_price = self._calc_final_price(product)
        product.save()
        return product

    # UPDATE
    def update(self, instance, validated_data):
        category_ids = validated_data.pop('category_ids', None)
        tag_names = validated_data.pop('tag_names', None)
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if category_ids is not None:
            instance.categories.set(category_ids)
        if tag_names is not None:
            instance.tags.clear()
            for name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=name)
                instance.tags.add(tag)
        if cover_file:
            instance.cover_image = cover_file
        if gallery_files is not None:
            instance.images.all().delete()
            for img in gallery_files:
                ProductImage.objects.create(product=instance, image=img)

        instance.final_price = self._calc_final_price(instance)
        instance.save()
        return instance

    def _calc_final_price(self, obj):
        if obj.discount and obj.discount > 0:
            return obj.price - (obj.price * obj.discount) / 100
        return obj.price