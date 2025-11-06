# products/serializers.py
from rest_framework import serializers
from .models import Category, Brand, Tag, Product, ProductVariant, ProductImage, Color
from cloudinary.uploader import upload
from cloudinary import CloudinaryImage
import logging

logger = logging.getLogger(__name__)

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_code']


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


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']

    def get_image(self, obj):
        return obj.image.url if obj.image else None


class ProductVariantSerializer(serializers.ModelSerializer):
    color = ColorSerializer(read_only=True)
    color_id = serializers.PrimaryKeyRelatedField(queryset=Color.objects.all(), source='color', write_only=True, required=False)

    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'color', 'color_id', 'storage', 'ram', 'condition', 'price', 'stock', 'is_active']


class ProductListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    color = ColorSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True, source='images')
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'brand', 'categories',
            'cover_image', 'images', 'price', 'stock', 'discount', 'final_price',
            'storage_gb', 'ram_gb', 'color', 'condition', 'is_active', 'is_featured'
        ]

    def get_cover_image(self, obj):
        return obj.cover_image.url if obj.cover_image else None


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    brand_id = serializers.PrimaryKeyRelatedField(queryset=Brand.objects.all(), source='brand', write_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), many=True, write_only=True)
    color_id = serializers.PrimaryKeyRelatedField(queryset=Color.objects.all(), source='color', write_only=True, required=False, allow_null=True)
    
    cover_image = serializers.FileField(write_only=True, required=False, allow_null=True)
    gallery = serializers.ListField(
        child=serializers.FileField(), write_only=True, required=False, allow_empty=True
    )

    # ADD THIS
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)

    brand = BrandSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    color = ColorSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True, source='images')

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'stock', 'discount',
            'storage_gb', 'ram_gb', 'color', 'color_id', 'condition',
            'is_active', 'is_featured', 'brand', 'brand_id',
            'categories', 'category_ids', 'cover_image', 'gallery', 'images',
            'final_price'
        ]

    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', [])

        # CALCULATE final_price
        price = validated_data.get('price', 0)
        discount = validated_data.get('discount', 0)
        final_price = price - (price * discount / 100) if discount > 0 else price
        validated_data['final_price'] = round(final_price, 2)

        logger.info(f"Creating product with data: {validated_data}")
        product = Product.objects.create(**validated_data)
        product.categories.set(category_ids)

        if cover_file:
            try:
                upload_result = upload(cover_file, folder="products/cover")
                product.cover_image = upload_result['public_id']
            except Exception as e:
                logger.error(f"Cover upload failed: {e}")
                raise serializers.ValidationError({"cover_image": "Upload failed"})

        for img_file in gallery_files:
            try:
                upload_result = upload(img_file, folder="products/gallery")
                ProductImage.objects.create(
                    product=product,
                    image=upload_result['public_id'],
                    is_primary=False
                )
            except Exception as e:
                logger.error(f"Gallery upload failed: {e}")
                continue

        product.save()
        return product

    def update(self, instance, validated_data):
        category_ids = validated_data.pop('category_ids', None)
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', None)

        # RECALCULATE final_price
        price = validated_data.get('price', instance.price)
        discount = validated_data.get('discount', instance.discount or 0)
        final_price = price - (price * discount / 100) if discount > 0 else price
        validated_data['final_price'] = round(final_price, 2)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if category_ids is not None:
            instance.categories.set(category_ids)

        if cover_file is not None:
            try:
                upload_result = upload(cover_file, folder="products/cover")
                instance.cover_image = upload_result['public_id']
            except Exception as e:
                logger.error(f"Cover update failed: {e}")
                raise serializers.ValidationError({"cover_image": "Upload failed"})

        if gallery_files is not None:
            instance.images.all().delete()
            for img_file in gallery_files:
                try:
                    upload_result = upload(img_file, folder="products/gallery")
                    ProductImage.objects.create(
                        product=instance,
                        image=upload_result['public_id'],
                        is_primary=False
                    )
                except Exception as e:
                    logger.error(f"Gallery update failed: {e}")
                    continue

        instance.save()
        return instance