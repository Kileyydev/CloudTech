from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Product, ProductVariant, ProductImage, Category, Brand, Tag
from faker import Faker
import random
import uuid

fake = Faker()


class Command(BaseCommand):
    help = "Seeds the database with demo products, variants, and images."

    def handle(self, *args, **options):
        self.stdout.write("🧹 Clearing old data...")
        ProductImage.objects.all().delete()
        ProductVariant.objects.all().delete()
        Product.objects.all().delete()

        categories = Category.objects.all()
        brands = Brand.objects.all()
        tags = Tag.objects.all()

        if not categories.exists() or not brands.exists():
            self.stdout.write(self.style.ERROR("❌ Please ensure categories and brands exist before seeding."))
            return

        self.stdout.write(f"📦 Found {categories.count()} categories and {brands.count()} brands.")
        self.stdout.write("🚀 Seeding 10 products per category...")

        sample_images = [
            "products/covers/sample_1.jpg",
            "products/covers/sample_2.jpg",
            "products/covers/sample_3.jpg",
            "products/covers/sample_4.jpg",
            "products/covers/sample_5.jpg",
        ]

        colors = ["Black", "White", "Blue", "Red", "Silver", "Gold", "Green"]
        storage_options = ["64GB", "128GB", "256GB", "512GB", "1TB"]
        conditions = ["New", "Refurbished"]
        features_pool = [
            "5G Ready", "Fast Charging", "OLED Display", "Face ID", "Dual SIM",
            "Water Resistant", "Wireless Charging", "Bluetooth 5.3", "USB-C Port"
        ]

        for category in categories:
            for _ in range(10):
                title = fake.catch_phrase()
                base_slug = slugify(title)[:240]
                slug = base_slug
                counter = 1

                while Product.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                brand = random.choice(brands)
                product = Product.objects.create(
                    title=title,
                    slug=slug,
                    description=fake.paragraph(nb_sentences=5),
                    price=random.randint(2000, 150000),
                    stock=random.randint(5, 50),
                    discount=random.choice([0, 5, 10, 15]),
                    brand=brand,
                    cover_image=random.choice(sample_images),
                    colors=random.sample(colors, k=random.randint(1, 3)),
                    storage_options=random.sample(storage_options, k=random.randint(1, 3)),
                    condition_options=conditions,
                    features=random.sample(features_pool, k=4),
                )

                # Add relationships
                product.categories.add(category)
                if tags.exists():
                    product.tags.add(*random.sample(list(tags), k=min(3, tags.count())))

                # ✅ Create variants
                for i in range(random.randint(2, 3)):
                    color = random.choice(product.colors or ["Black"])
                    storage = random.choice(product.storage_options or ["128GB"])
                    sku = f"{brand.name[:3].upper()}-{uuid.uuid4().hex[:6].upper()}"
                    price = product.price + random.randint(-2000, 3000)

                    ProductVariant.objects.create(
                        product=product,
                        sku=sku,
                        color=color,
                        storage=storage,
                        ram=random.choice(["4GB", "6GB", "8GB", "12GB"]),
                        processor=random.choice(["Snapdragon 8 Gen 2", "Apple A16", "Dimensity 9000"]),
                        size=random.choice(["6.1-inch", "6.7-inch"]),
                        price=price,
                        compare_at_price=price + random.randint(1000, 4000),
                        stock=random.randint(5, 30),
                    )

                # ✅ Create images
                primary_img = random.choice(sample_images)
                ProductImage.objects.create(
                    product=product,
                    image=primary_img,
                    alt_text=f"{product.title} - Primary",
                    is_primary=True,
                )

                for _ in range(random.randint(1, 3)):
                    ProductImage.objects.create(
                        product=product,
                        image=random.choice(sample_images),
                        alt_text=f"{product.title} extra image",
                    )

                self.stdout.write(f"✅ Created {product.title} under {category.name}")

        total = Product.objects.count()
        self.stdout.write(self.style.SUCCESS(f"\n🎯 Done! {total} products created successfully."))
