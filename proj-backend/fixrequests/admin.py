from django.contrib import admin

# Register your models here.
# fixrequests/admin.py
from django.contrib import admin
from .models import RepairRequest, RepairImage

class RepairImageInline(admin.TabularInline):
    model = RepairImage
    extra = 1

@admin.register(RepairRequest)
class RepairRequestAdmin(admin.ModelAdmin):
    list_display = ['client_name', 'device_type', 'status', 'cover_image', 'created_at']
    inlines = [RepairImageInline]
