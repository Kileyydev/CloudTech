from rest_framework import generics, permissions
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import ContactMessage
from .serializers import ContactMessageSerializer


class ContactMessageListCreateView(generics.ListCreateAPIView):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer

    # ✅ Anyone can send a message — no authentication required
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        message = serializer.save()

        # ✅ Automatically send email notification to admin
        send_mail(
            subject=f"📩 New Contact Message from {message.name}",
            message=f"""
You have received a new message from {message.name} ({message.email}).

Subject: {message.subject}
Message:
{message.message}

--------------------
Reply directly to this email to contact the sender.
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['jiranijourneys@gmail.com'],  # Change to your admin email
            fail_silently=False,
        )
        return Response(serializer.data)
