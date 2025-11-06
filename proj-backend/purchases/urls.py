# purchases/urls.py
from django.urls import path
from .views import OrderListCreateView, OrderDetailView, OrderPublicDetailView

urlpatterns = [
    # 1. LIST & CREATE ORDERS (for admin/auth)
    path('', OrderListCreateView.as_view(), name='order-list-create'),

    # 2. PUBLIC DETAIL (accessible without auth)
    path('order/<str:id>/', OrderPublicDetailView.as_view(), name='order-public-detail'),

    # 3. ADMIN CRUD BY ID
    path('<str:id>/', OrderDetailView.as_view(), name='order-detail-crud'),
]
