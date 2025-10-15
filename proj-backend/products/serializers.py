from rest_framework import serializers
from .models import Category, Brand, Tag, Product, ProductVariant, ProductImage


# ---------- BASIC SERIALIZERS ----------
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'variant', 'uploaded_at']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'color', 'storage', 'ram', 'processor',
            'size', 'price', 'compare_at_price', 'stock',
            'is_active', 'created_at'
        ]


# ---------- LIST / VIEW SERIALIZER ----------
class ProductListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)  # ✅ Updated
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    tags = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='name'
    )

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'brand', 'categories',
            'tags', 'is_active', 'is_featured', 'cover_image',
            'variants', 'images', 'created_at', 'price', 'stock', 'discount'
        ]


# ---------- CREATE / UPDATE SERIALIZER ----------
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    brand = serializers.CharField()
    categories = serializers.ListField(
        child=serializers.CharField(),
        required=True
    )  # ✅ Replaces single category
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'brand', 'categories',
            'tags', 'is_active', 'is_featured', 'cover_image',
            'price', 'stock', 'discount'
        ]
        read_only_fields = ['slug']

    def create(self, validated_data):
        brand_val = validated_data.pop('brand')
        categories_val = validated_data.pop('categories', [])
        tag_names = validated_data.pop('tags', [])

        # ✅ Handle brand
        try:
            brand_obj = Brand.objects.get(id=int(brand_val))
        except (ValueError, Brand.DoesNotExist):
            brand_obj, _ = Brand.objects.get_or_create(name=brand_val)

        product = Product.objects.create(
            brand=brand_obj,
            **validated_data
        )

        # ✅ Handle categories (multiple)
        for val in categories_val:
            try:
                cat_obj = Category.objects.get(id=int(val))
            except (ValueError, Category.DoesNotExist):
                cat_obj, _ = Category.objects.get_or_create(name=val)
            product.categories.add(cat_obj)

        # ✅ Handle tags
        for t in tag_names:
            tag_obj, _ = Tag.objects.get_or_create(name=t)
            product.tags.add(tag_obj)

        return product

    def update(self, instance, validated_data):
        brand_val = validated_data.pop('brand', None)
        categories_val = validated_data.pop('categories', None)
        tag_names = validated_data.pop('tags', None)

        if brand_val:
            try:
                brand_obj = Brand.objects.get(id=int(brand_val))
            except (ValueError, Brand.DoesNotExist):
                brand_obj, _ = Brand.objects.get_or_create(name=brand_val)
            instance.brand = brand_obj

        if categories_val is not None:
            instance.categories.clear()
            for val in categories_val:
                try:
                    cat_obj = Category.objects.get(id=int(val))
                except (ValueError, Category.DoesNotExist):
                    cat_obj, _ = Category.objects.get_or_create(name=val)
                instance.categories.add(cat_obj)

        if tag_names is not None:
            instance.tags.clear()
            for tag_name in tag_names:
                tag_obj, _ = Tag.objects.get_or_create(name=tag_name)
                instance.tags.add(tag_obj)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "title": instance.title,
            "slug": instance.slug,
            "description": instance.description,
            "brand": {"name": instance.brand.name} if instance.brand else None,
            "categories": [{"name": c.name} for c in instance.categories.all()],
            "tags": [tag.name for tag in instance.tags.all()],
            "is_active": instance.is_active,
            "is_featured": instance.is_featured,
            "cover_image": instance.cover_image.url if instance.cover_image else None,
            "price": instance.price,
            "stock": instance.stock,
            "discount": instance.discount,
        }
