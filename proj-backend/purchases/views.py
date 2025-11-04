from rest_framework.response import Response
from rest_framework import status, generics
from .models import Order
from .serializers import OrderSerializer


class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.all().order_by('-date')
    serializer_class = OrderSerializer

    def get_queryset(self):
        """
        Filters orders by device_id for anonymous tracking.
        """
        queryset = super().get_queryset()
        device_id = self.request.query_params.get('device_id')
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # ✅ anonymous orders only
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("🔥 Serializer Errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
