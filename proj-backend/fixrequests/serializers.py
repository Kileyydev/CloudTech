# fixrequests/serializers.py
from rest_framework import serializers
from .models import RepairRequest, RepairImage

class RepairImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'uploaded_at']

class RepairRequestSerializer(serializers.ModelSerializer):
    images = RepairImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = RepairRequest
        fields = [
            'id', 'client_name', 'client_email', 'client_phone', 
            'device_type', 'issue_description', 'status', 'cover_image',
            'images', 'created_at', 'updated_at'
        ]
