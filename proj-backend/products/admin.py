from django.contrib import admin
from .models import Category, Brand, Tag, Product, ProductVariant, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    list_display = ("name",)


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    list_display = ("name",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name",)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "brand",
        "get_categories",
        "price",
        "stock",
        "discount",
        "is_active",
        "is_featured",
        "created_at",
    )
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ProductVariantInline, ProductImageInline]
    search_fields = ("title", "brand__name", "categories__name")
    list_filter = ("brand", "categories", "is_active", "is_featured")

    # Show the new fields in the admin form
    fieldsets = (
        (None, {
            "fields": (
                "title",
                "slug",
                "description",
                "brand",
                "categories",
                "tags",
                "price",
                "stock",
                "discount",
                "is_active",
                "is_featured",
                "cover_image",
            ),
        }),
        ("Options", {
            "fields": (
                "colors",
                "storage_options",
                "condition_options",
                "features",
            ),
        }),
    )

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
    search_fields = ("sku", "product__title")


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "variant", "is_primary", "alt_text", "uploaded_at")
