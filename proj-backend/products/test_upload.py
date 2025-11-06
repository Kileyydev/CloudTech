# products/test_upload_full.py
from django.core.files.uploadedfile import SimpleUploadedFile
from products.models import Product, Category, Brand, GlobalOption, Tag, ProductImage, ProductVariant
from products.serializers import ProductCreateUpdateSerializer
import uuid

def create_full_product():
    print("\nPOOKIE: UPLOADING FULL PRODUCT WITH ALL FIELDS + MULTIPLE OPTIONS + UNIQUE SKUs")

    # === 1. FULL DATA WITH UNIQUE SKUs ===
    data = {
        "title": "Samsung Galaxy S25 Ultra",
        "description": "Flagship phone with AI, 200MP camera, S-Pen, and titanium frame.",
        "price": 1299.99,
        "stock": 150,
        "discount": 15,
        "is_active": True,
        "is_featured": True,
        "brand_id": 5,
        "category_ids": [9, 1, 8],
        "ram_option_ids": [2, 7, 10],
        "storage_option_ids": [15, 13, 16],
    "color_option_ids": [25, 27, 22],
        "tag_names": ["samsung", "flagship", "ai", "s-pen", "premium", "5g"],
        "variants": [
            {
                "sku": f"S27U-BLACK-{uuid.uuid4().hex[:8].upper()}",
                "color": "Titanium Black",
                "ram": "12GB",
                "storage": "512GB",
                "processor": "Snapdragon 8 Gen 4",
                "size": "6.8\"",
                "price": 1399,
                "compare_at_price": 1599,
                "stock": 50,
                "is_active": True
            },
            {
                "sku": f"S28U-BLUE-{uuid.uuid4().hex[:8].upper()}",
                "color": "Titanium Blue",
                "ram": "16GB",
                "storage": "1TB",
                "processor": "Snapdragon 8 Gen 4",
                "size": "6.8\"",
                "price": 1699,
                "compare_at_price": 1899,
                "stock": 30,
                "is_active": True
            }
        ]
    }

    # === 2. FAKE FILES ===
    cover_file = SimpleUploadedFile(
        "s25_ultra_cover.jpg",
        b"fake cover image content",
        content_type="image/jpeg"
    )

    gallery_files = [
        SimpleUploadedFile("s25_camera.jpg", b"cam", content_type="image/jpeg"),
        SimpleUploadedFile("s25_spen.webp", b"spen", content_type="image/webp"),
        SimpleUploadedFile("s25_display.png", b"display", content_type="image/png"),
    ]

    # === 3. FILES DICT ===
    files = {
        "cover_image": cover_file,
        "gallery": gallery_files
    }

    # === 4. SERIALIZER ===
    serializer = ProductCreateUpdateSerializer(data=data, context={'files': files})

    print("Validating...")
    if serializer.is_valid():
        print("VALID")
        try:
            product = serializer.save()
            print(f"SUCCESS: Product ID = {product.id}")
            print(f"Title: {product.title}")
            print(f"Final Price: ${product.final_price}")
            print(f"Categories: {[c.name for c in product.categories.all()]}")
            print(f"RAM Options: {[r.value for r in product.ram_options.all()]}")
            print(f"Storage: {[s.value for s in product.storage_options.all()]}")
            print(f"Colors: {[c.value for c in product.colors.all()]}")
            print(f"Tags: {[t.name for t in product.tags.all()]}")
            print(f"Variants: {product.variants.count()} (SKUs: {[v.sku for v in product.variants.all()]})")
            print(f"Gallery Images: {product.images.count()}")
            return product
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("VALIDATION ERRORS:")
        print(serializer.errors)

# === RUN ===
if __name__ == "__main__":
    create_full_product()