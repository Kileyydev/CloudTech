# products/models.py
from django.db import models
from django.utils.text import slugify
import uuid
from cloudinary.models import CloudinaryField
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from django.db import transaction


# ===================================================================
# CATEGORY
# ===================================================================
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ===================================================================
# BRAND
# ===================================================================
class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ===================================================================
# TAG
# ===================================================================
class Tag(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=80, unique=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
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
    type = models.CharField(max_length=20, choices=OPTION_TYPES)
    value = models.CharField(max_length=50)

    class Meta:
        unique_together = ('type', 'value')
        ordering = ['type', 'value']

    def __str__(self):
        return f"{self.get_type_display()}: {self.value}"


# ===================================================================
# PRODUCT
# ===================================================================
class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    description = models.TextField(blank=True)

    categories = models.ManyToManyField('Category', related_name='products', blank=True)
    brand = models.ForeignKey('Brand', on_delete=models.SET_NULL, null=True, related_name='products')
    tags = models.ManyToManyField('Tag', blank=True, related_name='products')

    cover_image = CloudinaryField('image', blank=True, null=True)

    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    stock = models.PositiveIntegerField(default=0)
    discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    final_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    ram_options = models.ManyToManyField(
        'GlobalOption', blank=True, related_name='ram_products',
        limit_choices_to={'type': 'RAM'}
    )
    storage_options = models.ManyToManyField(
        'GlobalOption', blank=True, related_name='storage_products',
        limit_choices_to={'type': 'STORAGE'}
    )
    colors = models.ManyToManyField(
        'GlobalOption', blank=True, related_name='color_products',
        limit_choices_to={'type': 'COLOR'}
    )

    condition_options = models.JSONField(blank=True, null=True)
    features = models.JSONField(blank=True, null=True)

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
        return self.title

    def save(self, *args, **kwargs):
        # Generate unique slug
        if not self.slug:
            base = slugify(self.title)[:240]
            slug = base
            i = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug

        # SAFE Decimal math — NO float conversion
        if self.discount > 0:
            discount_factor = self.discount / Decimal('100')
            self.final_price = (self.price * (Decimal('1') - discount_factor)).quantize(Decimal('0.01'))
        else:
            self.final_price = self.price

        super().save(*args, **kwargs)


# ===================================================================
# PRODUCT VARIANT
# ===================================================================
class ProductVariant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=120, unique=True)

    color = models.CharField(max_length=80, blank=True, null=True)
    ram = models.CharField(max_length=80, blank=True, null=True)
    storage = models.CharField(max_length=80, blank=True, null=True)
    processor = models.CharField(max_length=200, blank=True, null=True)
    size = models.CharField(max_length=80, blank=True, null=True)

    price = models.DecimalField(max_digits=12, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'color', 'ram', 'storage')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['product', 'is_active']),
        ]

    def __str__(self):
        parts = [self.product.title]
        if self.color: parts.append(self.color)
        if self.ram: parts.append(self.ram)
        if self.storage: parts.append(self.storage)
        return " — ".join(parts)


# ===================================================================
# PRODUCT IMAGE
# ===================================================================
class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='images'
    )
    variant = models.ForeignKey(
        ProductVariant, on_delete=models.CASCADE, related_name='images',
        null=True, blank=True
    )

    image = CloudinaryField('image')
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'uploaded_at']
        indexes = [
            models.Index(fields=['product', 'is_primary']),
        ]

    def __str__(self):
        return f"Image for {self.product.title}"

    @transaction.atomic
    def save(self, *args, **kwargs):
        # Only run primary logic on save (not delete)
        if self.pk is None or self.is_primary:
            # Demote other primary images
            ProductImage.objects.filter(product=self.product, is_primary=True) \
                              .exclude(pk=self.pk) \
                              .update(is_primary=False)

            # Update cover_image ONLY if this is primary and different
            if self.is_primary:
                if not self.product.cover_image or self.product.cover_image != self.image:
                    # Avoid triggering Product.save() → use update()
                    Product.objects.filter(pk=self.product.pk).update(cover_image=self.image)

        super().save(*args, **kwargs)