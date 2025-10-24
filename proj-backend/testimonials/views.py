from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from .models import Testimonial
from .serializers import TestimonialSerializer, TestimonialAdminSerializer

# Public route for users to submit/view testimonials
class TestimonialListCreateView(generics.ListCreateAPIView):
    queryset = Testimonial.objects.all().order_by('-created_at')
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.AllowAny]  # No login needed

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(is_approved=False)  # Default pending
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Admin route for approving/deleting testimonials
class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all().order_by('-created_at')
    serializer_class = TestimonialSerializer

    def get_permissions(self):
        # ✅ Anyone can view, but only admins can edit/delete
        if self.action in ['update', 'partial_update', 'destroy']:
            from rest_framework.permissions import IsAdminUser
            return [IsAdminUser()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        # ✅ Use admin serializer for approval actions
        if self.action in ['update', 'partial_update', 'destroy']:
            return TestimonialAdminSerializer
        return TestimonialSerializer
