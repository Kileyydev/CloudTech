from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Product, Category, Brand
from faker import Faker
import random

fake = Faker()

class Command(BaseCommand):
    help = "Seed existing brands and categories with 10 random products each."

    def handle(self, *args, **options):
        self.stdout.write("🧹 Clearing old products...")
        Product.objects.all().delete()

        categories = Category.objects.all()
        brands = Brand.objects.all()

        if not categories.exists():
            self.stdout.write(self.style.ERROR("❌ No categories found! Please create some first."))
            return

        if not brands.exists():
            self.stdout.write(self.style.ERROR("❌ No brands found! Please create some first."))
            return

        self.stdout.write(f"📦 Found {categories.count()} categories and {brands.count()} brands.")
        self.stdout.write("🚀 Seeding 10 products per category...")

        for category in categories:
            for _ in range(10):
                name = fake.catch_phrase()
                base_slug = slugify(name)
                slug = base_slug
                counter = 1

                # Make sure slug is unique
                while Product.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                product = Product.objects.create(
                    name=name,
                    slug=slug,
                    description=fake.text(),
                    price=random.randint(5000, 150000),
                    stock=random.randint(5, 50),
                    category=category,
                    brand=random.choice(brands),
                    image=f"/media/sample_{random.randint(1,5)}.jpg",
                )

                self.stdout.write(f"✅ Created: {product.name} under {category.name}")

        total_products = Product.objects.count()
        self.stdout.write("\n🎯 SEEDING COMPLETE")
        self.stdout.write(f"📦 Total Products: {total_products}")
        self.stdout.write(self.style.SUCCESS("🎉 Database successfully seeded!"))
