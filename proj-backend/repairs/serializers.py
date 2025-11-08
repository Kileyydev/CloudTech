from rest_framework import serializers
from .models import RepairRequest

class RepairRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairRequest
        fields = "__all__"
        read_only_fields = ("id", "created_at")  
