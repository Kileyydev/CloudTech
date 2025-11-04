from django.db import models
from django.conf import settings


class Order(models.Model):
    PAYMENT_CHOICES = [
        ('paybill', 'M-Pesa Paybill'),
        ('withdraw', 'Withdraw Agent'),
        ('cod', 'Cash on Delivery'),
    ]

    id = models.CharField(primary_key=True, max_length=30)

    # ✅ Optional user field (Zero Knowledge — no login required)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders',
        null=True,
        blank=True
    )

    # 🧍 Customer details
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)

    # 💳 Payment info
    payment = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    mpesa_code = models.CharField(max_length=50, blank=True, null=True)

    # 💰 Money fields with high precision and wide range
    cash_amount = models.DecimalField(max_digits=20, decimal_places=6, default=0)
    change = models.DecimalField(max_digits=20, decimal_places=6, default=0)
    subtotal = models.DecimalField(max_digits=20, decimal_places=6)
    shipping = models.DecimalField(max_digits=20, decimal_places=6)
    total = models.DecimalField(max_digits=20, decimal_places=6)

    # 🚚 Order meta
    status = models.CharField(max_length=30, default='confirmed')
    date = models.DateTimeField(auto_now_add=True)

    device_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    

    def __str__(self):
        return f"{self.id} - {self.name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_id = models.CharField(max_length=100)
    title = models.CharField(max_length=200)

    # 💰 Support large prices and high precision
    price = models.DecimalField(max_digits=20, decimal_places=6)
    quantity = models.IntegerField()

    def __str__(self):
        return f"{self.title} × {self.quantity}"
