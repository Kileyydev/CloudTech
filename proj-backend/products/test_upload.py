# products/test_upload.py
from django.core.files.uploadedfile import SimpleUploadedFile
from products.models import Product, Category, Brand, GlobalOption, Tag, ProductImage, ProductVariant
from products.serializers import ProductCreateUpdateSerializer
import json

def create_test_product():
    print("POOKIE: STARTING TEST UPLOAD FROM DJANGO SHELL")

    # === 1. Prepare data (exactly like frontend) ===
    data = {
        "title": "u",
        "description": "m",
        "price": 90,
        "stock": 89,
        "discount": 0,
        "is_active": True,
        "is_featured": True,
        "brand_id": 5,
        "category_ids": [9],
        "ram_option_ids": [2, 7],
        "storage_option_ids": [15, 13],
        "color_option_ids": [25],
        "tag_names": ["apple", "smartphone", "premium"],
        "variants": [
            {
                "sku": "789898",
                "color": "black",
                "ram": "8GB",
                "storage": "8GB",
                "processor": "AMD",
                "size": "23",
                "price": 2000,
                "compare_at_price": 2300,
                "stock": 12
            }
        ]
    }

    # === 2. Fake files (use real paths or dummy) ===
    cover_file = SimpleUploadedFile(
        "cable2.jpg", b"fake image content", content_type="image/jpeg"
    )
    gallery_files = [
        SimpleUploadedFile("Camera.png", b"fake1", content_type="image/png"),
        SimpleUploadedFile("controller.webp", b"fake2", content_type="image/webp"),
    ]

    # === 3. Build FormData-like dict ===
    files = {
        "cover_image": cover_file,
        "gallery": gallery_files
    }

    # === 4. Use serializer ===
    serializer = ProductCreateUpdateSerializer(data=data, context={'files': files})
    
    print("\nValidating data...")
    if serializer.is_valid():
        print("Data is VALID")
        try:
            product = serializer.save()
            print(f"SUCCESS: Product created! ID = {product.id}")
            print(f"Colors: {[c.id for c in product.colors.all()]}")
            print(f"Tags: {[t.name for t in product.tags.all()]}")
            return product
        except Exception as e:
            print(f"ERROR IN SAVE: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("VALIDATION FAILED:")
        print(serializer.errors)
        return None

# === RUN THIS ===
if __name__ == "__main__":
    create_test_product()