# purchases/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer


# 1. LIST + CREATE ORDERS (SECURE FILTERING)
class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]  # Allow guest CREATE only

    def get_queryset(self):
        """
        GUEST: Filter by device_id
        LOGGED IN: Filter by user
        ADMIN: SHOW ALL ORDERS
        """
        user = self.request.user
        queryset = Order.objects.all().order_by('-date')

        # ADMIN → SEE ALL
        if user.is_authenticated and (user.is_staff or user.is_superuser):
            return queryset

        # LOGGED IN USER → THEIR ORDERS
        if user.is_authenticated:
            return queryset.filter(user=user)

        # GUEST → device_id only
        device_id = self.request.query_params.get('device_id')
        if device_id:
            return queryset.filter(device_id=device_id)

        # DEFAULT: NO ACCESS
        return queryset.none()

    def create(self, request, *args, **kwargs):
        """
        Create order — serializer handles ID, device_id, user
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 2. ADMIN: RETRIEVE, UPDATE, DELETE BY ID
class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    lookup_field = 'id'
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        ADMIN: See all
        USER: See only own
        """
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


# 3. PUBLIC: FETCH SINGLE ORDER (NO LOGIN)
class OrderPublicDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )