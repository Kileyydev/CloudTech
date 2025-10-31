from django.db import models
from django.utils.text import slugify
import uuid


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


class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Tag(models.Model):
    name = models.CharField(max_length=60, unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Represents a general product (e.g., 'iPhone 14').
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    description = models.TextField(blank=True)

    categories = models.ManyToManyField('Category', related_name='products', blank=True)
    brand = models.ForeignKey('Brand', on_delete=models.SET_NULL, null=True, related_name='products')
    tags = models.ManyToManyField('Tag', blank=True, related_name='products')

    # ✅ Cloudinary automatically stores this
    cover_image = models.ImageField(upload_to='products/covers/', null=True, blank=True)

    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock = models.PositiveIntegerField(default=0)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    final_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    colors = models.JSONField(blank=True, null=True)
    storage_options = models.JSONField(blank=True, null=True)
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
        # Generate unique slug
        if not self.slug:
            base = slugify(self.title)[:240]
            slug = base
            i = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug

        # Auto calculate final price
        if self.discount and self.discount > 0:
            self.final_price = self.price - (self.price * self.discount / 100)
        else:
            self.final_price = self.price

        super().save(*args, **kwargs)


class ProductVariant(models.Model):
    """
    Represents specific configurations (e.g., color, storage).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=120, unique=True)
    color = models.CharField(max_length=80, blank=True, null=True)
    storage = models.CharField(max_length=80, blank=True, null=True)
    ram = models.CharField(max_length=80, blank=True, null=True)
    processor = models.CharField(max_length=200, blank=True, null=True)
    size = models.CharField(max_length=80, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'sku')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.title} — {self.sku}"


class ProductImage(models.Model):
    """
    Holds gallery images for each product (besides cover).
    Cloudinary will handle hosting automatically.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='images', null=True, blank=True)
    
    # ✅ This is now stored and served directly by Cloudinary
    image = models.ImageField(upload_to='products/images/')
    
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'uploaded_at']

    def __str__(self):
        return f"Image for {self.product.title}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Automatically sync cover image if primary
        if self.is_primary and self.product.cover_image != self.image:
            self.product.cover_image = self.image
            self.product.save()
