# purchases/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem
import time
import random
import string

# Utility to generate unique Order ID
def generate_unique_order_id():
    now = int(time.time() * 1000)
    rand = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"CT{now}-{rand}"

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_id', 'title', 'price', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'device_id', 'name', 'phone', 'address', 'city',
            'payment', 'mpesa_code', 'cash_amount', 'change',
            'subtotal', 'shipping', 'total', 'status', 'date', 'items'
        ]
        read_only_fields = ['id', 'user', 'date']  # device_id is writable via header

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        request = self.context.get('request')

        # === 1. GENERATE UNIQUE ORDER ID ===
        validated_data['id'] = generate_unique_order_id()

        # === 2. SAVE device_id FROM HEADER (X-Device-ID) ===
        if request:
            device_id = request.META.get('HTTP_X_DEVICE_ID', '').strip()
            if device_id:
                validated_data['device_id'] = device_id

        # === 3. SET USER IF LOGGED IN ===
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user

        # === 4. DEFAULT VALUES ===
        validated_data.setdefault('status', 'confirmed')
        validated_data.setdefault('shipping', 200)

        # === 5. CREATE ORDER ===
        order = Order.objects.create(**validated_data)

        # === 6. CREATE ORDER ITEMS ===
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order