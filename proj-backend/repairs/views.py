from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import RepairRequest
from .serializers import RepairRequestSerializer
from rest_framework.permissions import IsAdminUser

class RepairRequestViewSet(viewsets.ModelViewSet):
    queryset = RepairRequest.objects.all().order_by('-created_at')
    serializer_class = RepairRequestSerializer

    def get_permissions(self):
        # Only admin users can update or delete repair requests
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        # Everyone can view list or create
        return []

    def create(self, request, *args, **kwargs):
        # anyone can submit a repair request
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(is_resolved=False)  # default to unresolved
        return Response(serializer.data, status=status.HTTP_201_CREATED)
