from django.contrib import admin
from .models import Order

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'name', 'phone', 'status', 'total', 'date')
    list_filter = ('status', 'payment', 'date')
    search_fields = ('order_id', 'name', 'phone', 'city')
