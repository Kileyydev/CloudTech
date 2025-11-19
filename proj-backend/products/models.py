# products/models.py
from django.db import models
from django.utils.text import slugify
import uuid
from cloudinary.models import CloudinaryField
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal, ROUND_HALF_UP


# ===================================================================
# CATEGORY
# ===================================================================
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, blank=True, null=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name or "Unnamed Category"

    def save(self, *args, **kwargs):
        if self.name and not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ===================================================================
# BRAND
# ===================================================================
class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True, blank=True, null=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True, null=True)

    def __str__(self):
        return self.name or "Unnamed Brand"

    def save(self, *args, **kwargs):
        if self.name and not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ===================================================================
# TAG
# ===================================================================
class Tag(models.Model):
    name = models.CharField(max_length=60, unique=True, blank=True, null=True)
    slug = models.SlugField(max_length=80, unique=True, blank=True, null=True)

    def __str__(self):
        return self.name or "Unnamed Tag"

    def save(self, *args, **kwargs):
        if self.name and not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ===================================================================
# GLOBAL OPTIONS (RAM, STORAGE, COLOR)
# ===================================================================
class GlobalOption(models.Model):
    OPTION_TYPES = [
        ('RAM', 'RAM'),
        ('STORAGE', 'Storage'),
        ('COLOR', 'Color'),
    ]
    type = models.CharField(max_length=20, choices=OPTION_TYPES, blank=True, null=True)
    value = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ['type', 'value']

    def __str__(self):
        return f"{self.get_type_display()}: {self.value}" if self.type and self.value else "Empty Option"


# ===================================================================
# PRODUCT
# ===================================================================
class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, blank=True, null=True)
    slug = models.SlugField(max_length=300, unique=True, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    categories = models.ManyToManyField('Category', related_name='products', blank=True)
    brand = models.ForeignKey('Brand', on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    tags = models.ManyToManyField('Tag', blank=True, related_name='products')

    cover_image = CloudinaryField('image', blank=True, null=True)

    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)
    stock = models.PositiveIntegerField(null=True, blank=True, default=0)
    discount = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    final_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)

    ram_options = models.ManyToManyField('GlobalOption', blank=True, related_name='ram_products', limit_choices_to={'type': 'RAM'})
    storage_options = models.ManyToManyField('GlobalOption', blank=True, related_name='storage_products', limit_choices_to={'type': 'STORAGE'})
    colors = models.ManyToManyField('GlobalOption', blank=True, related_name='color_products', limit_choices_to={'type': 'COLOR'})

    condition_options = models.JSONField(blank=True, null=True, default=dict)
    features = models.JSONField(blank=True, null=True, default=dict)

    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['brand']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_featured']),
        ]

    def __str__(self):
        return self.title or f"Product {self.id}"

    def save(self, *args, **kwargs):
        # Generate slug
        if self.title and not self.slug:
            base = slugify(self.title)[:240]
            slug = base
            i = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug

        # ←←←←← CRITICAL FIX: Convert int/float → Decimal
        if self.price is not None and not isinstance(self.price, Decimal):
            self.price = Decimal(str(self.price))
        if self.discount is not None and not isinstance(self.discount, Decimal):
            self.discount = Decimal(str(self.discount))

        # Default values
        if self.price is None:
            self.price = Decimal('0.00')
        if self.discount is None:
            self.discount = Decimal('0.00')

        # Calculate final price
        discount_multiplier = Decimal('1.00') - (self.discount / Decimal('100'))
        self.final_price = (self.price * discount_multiplier).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        super().save(*args, **kwargs)

    @property
    def has_variants(self):
        return self.variants.exists()

    @property
    def is_configurable(self):
        return self.has_variants

    @property
    def display_price(self):
        if self.has_variants:
            lowest = self.variants.filter(is_active=True).order_by('price').first()
            return lowest.final_price if lowest else self.final_price
        return self.final_price

    @property
    def total_stock(self):
        if self.has_variants:
            return sum(v.stock for v in self.variants.all())
        return self.stock


# ===================================================================
# PRODUCT VARIANT — FIXED DECIMAL CONVERSION
# ===================================================================
class ProductVariant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants', null=True, blank=True)
    sku = models.CharField(max_length=120, unique=True, blank=True, null=True)

    color = models.CharField(max_length=80, blank=True, null=True)
    ram = models.CharField(max_length=80, blank=True, null=True)
    storage = models.CharField(max_length=80, blank=True, null=True)
    processor = models.CharField(max_length=200, blank=True, null=True)
    size = models.CharField(max_length=80, blank=True, null=True)

    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)
    compare_at_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)
    stock = models.PositiveIntegerField(null=True, blank=True, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    final_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['product', 'is_active']),
        ]

    def __str__(self):
        parts = [self.product.title if self.product else "No Product"]
        if self.color: parts.append(self.color)
        if self.ram: parts.append(self.ram)
        if self.storage: parts.append(self.storage)
        return " — ".join(parts) if len(parts) > 1 else "Empty Variant"

    def save(self, *args, **kwargs):
        # ←←←←← CRITICAL FIX: Convert int/float → Decimal before quantize
        if self.price is not None and not isinstance(self.price, Decimal):
            self.price = Decimal(str(self.price))
        if self.compare_at_price is not None and not isinstance(self.compare_at_price, Decimal):
            self.compare_at_price = Decimal(str(self.compare_at_price))

        if self.price is None:
            self.price = Decimal('0.00')
        if self.compare_at_price is None:
            self.compare_at_price = Decimal('0.00')

        # Final price = price (no discount on variants)
        self.final_price = self.price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        super().save(*args, **kwargs)


# ===================================================================
# PRODUCT IMAGE
# ===================================================================
class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='images', null=True, blank=True)

    image = CloudinaryField('image', blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'uploaded_at']
        indexes = [models.Index(fields=['product', 'is_primary'])]

    def __str__(self):
        return f"Image for {self.product.title if self.product else 'No Product'}"

    def save(self, *args, **kwargs):
        if self.is_primary and self.product and self.image:
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
            if self.product.cover_image != self.image:
                self.product.cover_image = self.image
                Product.objects.filter(pk=self.product.pk).update(cover_image=self.image)
        super().save(*args, **kwargs)