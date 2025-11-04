from django.urls import path
from .views import OrderListCreateView, OrderDetailView

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order-list-create'),         # List & create
    path('<str:id>/', OrderDetailView.as_view(), name='order-detail-crud'),    # Retrieve, update, delete
]
