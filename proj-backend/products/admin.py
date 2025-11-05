# products/admin.py
from django.contrib import admin
from .models import Category, Brand, Tag, Product, ProductVariant, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    list_display = ("name", "slug")
    search_fields = ("name",)


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    list_display = ("name", "slug")
    search_fields = ("name",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "alt_text", "is_primary")
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.image:
            return admin.utils.format_html(
                '<img src="{}" style="max-height: 80px; max-width: 80px; border-radius: 4px;" />',
                obj.image.url
            )
        return "(No image)"
    image_preview.short_description = "Preview"


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ("sku", "color", "storage", "ram", "processor", "size", "price", "stock", "is_active")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "brand",
        "get_categories",
        "price",
        "stock",
        "discount",
        "final_price",
        "is_active",
        "is_featured",
        "created_at",
    )
    list_filter = ("brand", "categories", "is_active", "is_featured", "created_at")
    search_fields = ("title", "brand__name", "categories__name", "tags__name")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ProductVariantInline, ProductImageInline]
    readonly_fields = ("final_price", "created_at", "updated_at")

    fieldsets = (
        ("Product Info", {
            "fields": (
                "title",
                "slug",
                "description",
                "brand",
                "categories",
                "tags",
                "cover_image",
                "cover_image_preview",
            )
        }),
        ("Pricing & Stock", {
            "fields": (
                "price",
                "stock",
                "discount",
                "final_price",
            )
        }),
        ("Status", {
            "fields": (
                "is_active",
                "is_featured",
            )
        }),
        ("Options", {
            "fields": (
                "colors",
                "storage_options",
                "condition_options",
                "features",
            ),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    def cover_image_preview(self, obj):
        if obj.cover_image:
            return admin.utils.format_html(
                '<img src="{}" style="max-height: 120px; max-width: 120px; border-radius: 6px;" />',
                obj.cover_image.url
            )
        return "(No cover)"
    cover_image_preview.short_description = "Cover Preview"

    def get_categories(self, obj):
        return ", ".join([c.name for c in obj.categories.all()])
    get_categories.short_description = "Categories"


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = (
        "sku",
        "product",
        "color",
        "storage",
        "ram",
        "price",
        "stock",
        "is_active",
    )
    list_filter = ("is_active", "color", "storage")
    search_fields = ("sku", "product__title")


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "is_primary", "alt_text", "image_preview", "uploaded_at")
    list_filter = ("is_primary", "product")
    search_fields = ("product__title", "alt_text")

    def image_preview(self, obj):
        if obj.image:
            return admin.utils.format_html(
                '<img src="{}" style="max-height: 60px; max-width: 60px; border-radius: 4px;" />',
                obj.image.url
            )
        return "(No image)"
    image_preview.short_description = "Preview"