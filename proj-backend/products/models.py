# products/models.py
from django.db import models
from django.utils.text import slugify
import uuid
from cloudinary.models import CloudinaryField
from decimal import Decimal  # ADD THIS

# ================== STORAGE & RAM CHOICES ==================
STORAGE_CHOICES = [
    (64, "64GB"), (128, "128GB"), (256, "256GB"), (512, "512GB"),
    (1024, "1TB"), (2048, "2TB")
]

RAM_CHOICES = [
    (2, "2GB"), (4, "4GB"), (6, "6GB"), (8, "8GB"),
    (12, "12GB"), (16, "16GB"), (24, "24GB"),
    (32, "32GB"), (64, "64GB"), (128, "128GB"), (256, "256GB")
]

CONDITION_CHOICES = [
    ('new', 'New'),
    ('ex_dubai', 'Ex-Dubai'),
]

# ================== COLOR MODEL ==================
class Color(models.Model):
    name = models.CharField(max_length=50, unique=True)
    hex_code = models.CharField(max_length=7, default="#000000")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Colors"

    def __str__(self):
        return self.name


# ================== CATEGORY ==================
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ================== BRAND ==================
class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ================== TAG ==================
class Tag(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=80, unique=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ================== PRODUCT ==================
class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    description = models.TextField(blank=True)

    categories = models.ManyToManyField('Category', related_name='products', blank=True)
    brand = models.ForeignKey('Brand', on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    tags = models.ManyToManyField('Tag', blank=True, related_name='products')

    cover_image = CloudinaryField('image', blank=True, null=True)

    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock = models.PositiveIntegerField(default=0)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    final_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    storage_gb = models.IntegerField(choices=STORAGE_CHOICES, null=True, blank=True)
    ram_gb = models.IntegerField(choices=RAM_CHOICES, null=True, blank=True)
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, null=True, blank=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, blank=True)

    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Generate slug
        if not self.slug:
            base = slugify(self.title)[:240]
            slug = base
            i = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug

        # FIXED: Use Decimal for final_price
        if self.discount and self.discount > Decimal('0'):
            self.final_price = (self.price * (Decimal('100') - self.discount)) / Decimal('100')
        else:
            self.final_price = self.price

        super().save(*args, **kwargs)


# ================== PRODUCT VARIANT ==================
class ProductVariant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=120, unique=True)
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, null=True, blank=True)
    storage = models.IntegerField(choices=STORAGE_CHOICES, null=True, blank=True)
    ram = models.IntegerField(choices=RAM_CHOICES, null=True, blank=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'sku')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.title} — {self.sku}"


# ================== PRODUCT IMAGE ==================
class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True, related_name='images')
    image = CloudinaryField('image')
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'uploaded_at']

    def __str__(self):
        return f"Image for {self.product.title}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.is_primary and self.product.cover_image != self.image:
            self.product.cover_image = self.image
            self.product.save(update_fields=['cover_image'])