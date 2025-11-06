# products/serializers.py
from rest_framework import serializers
from .models import Category, Brand, Tag, Product, ProductVariant, ProductImage, Color
from cloudinary.uploader import upload
import logging
from decimal import Decimal

logger = logging.getLogger(__name__)

# === BASIC SERIALIZERS ===
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

# === PRODUCT CREATE / UPDATE SERIALIZER ===
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    brand_id = serializers.PrimaryKeyRelatedField(queryset=Brand.objects.all(), source='brand', write_only=True, required=False, allow_null=True)
    category_ids = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), many=True, write_only=True, required=False)
    color_id = serializers.PrimaryKeyRelatedField(queryset=Color.objects.all(), source='color', write_only=True, required=False, allow_null=True)
    tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, write_only=True, required=False)

    cover_image = serializers.FileField(write_only=True, required=False, allow_null=True)
    gallery = serializers.ListField(
        child=serializers.FileField(), write_only=True, required=False, allow_empty=True
    )

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
            'categories', 'category_ids', 'tags', 'cover_image', 'gallery', 'images'
        ]

    def validate(self, data):
        discount = data.get('discount')
        price = data.get('price')
        if discount and price and discount >= Decimal('100'):
            raise serializers.ValidationError({"discount": "Discount cannot be 100% or more"})
        return data

    def create(self, validated_data):
        logger.info("=== PRODUCT CREATE STARTED ===")
        category_ids = validated_data.pop('category_ids', [])
        tags = validated_data.pop('tags', [])
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', [])

        try:
            product = Product.objects.create(**validated_data)
            product.categories.set(category_ids)
            product.tags.set(tags)

            # === UPLOAD COVER ===
            if cover_file:
                upload_result = upload(cover_file, folder="products/cover")
                product.cover_image = upload_result['public_id']
                logger.info(f"Cover uploaded: {upload_result['public_id']}")

            # === UPLOAD GALLERY ===
            for i, img_file in enumerate(gallery_files):
                upload_result = upload(img_file, folder="products/gallery")
                is_primary = (not product.cover_image and i == 0)
                ProductImage.objects.create(
                    product=product,
                    image=upload_result['public_id'],
                    is_primary=is_primary
                )
                logger.info(f"Gallery image {i+1} uploaded: {upload_result['public_id']}")

            product.save()
            logger.info(f"PRODUCT CREATED: {product.id}")
            return product

        except Exception as e:
            logger.error(f"PRODUCT CREATE FAILED: {e}", exc_info=True)
            raise serializers.ValidationError({"error": "Failed to create product", "details": str(e)})

    def update(self, instance, validated_data):
        logger.info(f"=== PRODUCT UPDATE STARTED: {instance.id} ===")
        category_ids = validated_data.pop('category_ids', None)
        tags = validated_data.pop('tags', None)
        cover_file = validated_data.pop('cover_image', None)
        gallery_files = validated_data.pop('gallery', None)

        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            if category_ids is not None:
                instance.categories.set(category_ids)
            if tags is not None:
                instance.tags.set(tags)

            if cover_file is not None:
                upload_result = upload(cover_file, folder="products/cover")
                instance.cover_image = upload_result['public_id']
                logger.info(f"Cover updated: {upload_result['public_id']}")

            if gallery_files is not None:
                instance.images.all().delete()
                for i, img_file in enumerate(gallery_files):
                    upload_result = upload(img_file, folder="products/gallery")
                    is_primary = (not instance.cover_image and i == 0)
                    ProductImage.objects.create(
                        product=instance,
                        image=upload_result['public_id'],
                        is_primary=is_primary
                    )
                    logger.info(f"Gallery image {i+1} updated: {upload_result['public_id']}")

            instance.save()
            logger.info(f"PRODUCT UPDATED: {instance.id}")
            return instance

        except Exception as e:
            logger.error(f"PRODUCT UPDATE FAILED: {e}", exc_info=True)
            raise serializers.ValidationError({"error": "Failed to update product", "details": str(e)})