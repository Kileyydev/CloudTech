# purchases/urls.py
from django.urls import path
from .views import OrderListCreateView, OrderDetailView, OrderPublicDetailView

urlpatterns = [
    # 1. LIST & CREATE ORDERS (for admin/auth)
    path('', OrderListCreateView.as_view(), name='order-list-create'),

    # 2. CRUD BY ID (for admin/auth) — e.g. /api/purchases/CT123/
    path('<str:id>/', OrderDetailView.as_view(), name='order-detail-crud'),
    path('order/<str:id>/', OrderPublicDetailView.as_view(), name='order-public-detail'),
]