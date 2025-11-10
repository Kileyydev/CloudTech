# fixrequests/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import RepairRequest, RepairImage
from .serializers import RepairRequestSerializer, RepairImageSerializer

class RepairRequestViewSet(viewsets.ModelViewSet):
    queryset = RepairRequest.objects.all()
    serializer_class = RepairRequestSerializer

    # Endpoint for uploading images
    @action(detail=True, methods=['POST'])
    def upload_images(self, request, pk=None):
        repair_request = self.get_object()
        files = request.FILES.getlist('images')
        primary = request.data.get('is_primary', 'false').lower() == 'true'
        images = []

        for file in files:
            img = RepairImage.objects.create(
                repair_request=repair_request,
                image=file,
                is_primary=primary
            )
            images.append(img)

        serializer = RepairImageSerializer(images, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
