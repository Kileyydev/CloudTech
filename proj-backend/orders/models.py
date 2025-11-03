from django.db import models
from django.utils import timezone

ORDER_STATUS_CHOICES = [
    ('received', 'Order Received'),
    ('processing', 'Processing'),
    ('packing', 'Packing'),
    ('dispatched', 'Dispatched'),
    ('delivered', 'Delivered'),
]

PAYMENT_METHOD_CHOICES = [
    ('cod', 'Cash on Delivery'),
    ('paybill', 'M-Pesa Paybill'),
    ('withdraw', 'Withdraw Option'),
]


class Order(models.Model):
    id = models.AutoField(primary_key=True)
    order_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=50)
    payment = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cod')
    cash_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    change = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    items = models.JSONField()  # store cart items
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='received')
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.order_id} - {self.name}"
