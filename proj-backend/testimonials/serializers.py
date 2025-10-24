from rest_framework import serializers
from .models import Testimonial

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        read_only_fields = ("id", "created_at", "updated_at", "is_approved")
        fields = "__all__"

# Admin serializer that allows toggling is_approved
class TestimonialAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
