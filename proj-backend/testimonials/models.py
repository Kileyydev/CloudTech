from django.db import models

class Testimonial(models.Model):
    CATEGORY_CHOICES = [
        ("smartphones", "Smartphones"),
        ("laptops", "Laptops & Computers"),
        ("tablets", "Tablets & iPads"),
        ("accessories", "Accessories"),
        ("repairs", "Repair Services"),
        ("other", "Other"),
    ]


    product = models.CharField(max_length=255)
    image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    experience = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)  # 1-5
    name = models.CharField(max_length=120)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=32, null=True, blank=True)
    is_approved = models.BooleanField(default=False)  # only show on frontend when True
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.product} ({self.rating})"
