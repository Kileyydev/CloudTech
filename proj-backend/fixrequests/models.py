# fixrequests/models.py
from django.db import models
import uuid
from cloudinary.models import CloudinaryField

# ===================================================================
# REPAIR REQUEST
# ===================================================================
class RepairRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('REJECTED', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client_name = models.CharField(max_length=255, blank=True, null=True)
    client_email = models.EmailField(blank=True, null=True)
    client_phone = models.CharField(max_length=50, blank=True, null=True)
    device_type = models.CharField(max_length=255, blank=True, null=True)
    issue_description = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    cover_image = CloudinaryField('image', blank=True, null=True)  # First uploaded image

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.client_name} — {self.device_type} ({self.status})"


# ===================================================================
# REPAIR IMAGES
# ===================================================================
class RepairImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    repair_request = models.ForeignKey(
        RepairRequest, on_delete=models.CASCADE, related_name='images', null=True, blank=True
    )
    image = CloudinaryField('image', blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'uploaded_at']

    def __str__(self):
        return f"Image for {self.repair_request.client_name if self.repair_request else 'No Request'}"

    def save(self, *args, **kwargs):
        # Only act if this image is primary
        if self.is_primary and self.repair_request and self.image:
            # Demote other primary images
            RepairImage.objects.filter(
                repair_request=self.repair_request, is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)

            # Update repair_request's cover_image
            if self.repair_request.cover_image != self.image:
                RepairRequest.objects.filter(pk=self.repair_request.pk).update(cover_image=self.image)

        super().save(*args, **kwargs)
