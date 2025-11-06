from django.db import models
from django.utils.text import slugify
import uuid
from cloudinary.models import CloudinaryField


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
        return f"{self.type}: {self.value}"


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

    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock = models.PositiveIntegerField(default=0)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    final_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

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

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:240]
            slug = base
            i = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug

        # Auto-calculate discounted price
        if self.discount and self.discount > 0:
            self.final_price = round(self.price * (1 - self.discount / 100), 2)
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

    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'sku')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.title} — {self.sku}"


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

    def __str__(self):
        return f"Image for {self.product.title}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Auto-sync cover image
        if self.is_primary and self.product.cover_image != self.image:
            self.product.cover_image = self.image
            self.product.save(update_fields=['cover_image'])
