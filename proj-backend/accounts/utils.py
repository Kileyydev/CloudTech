# accounts/utils.py
import secrets
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings

OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 10

def generate_otp_code(length=OTP_LENGTH):
    # Secure random numeric OTP
    digits = ''.join(str(secrets.randbelow(10)) for _ in range(length))
    return digits

def send_otp_email(user, otp_code):
    subject = "Your login OTP"
    message = f"Hi,\n\nYour OTP is: {otp_code}\nIt will expire in {OTP_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this, ignore this email."
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

def create_and_send_otp(user):
    from .models import EmailOTP
    code = generate_otp_code()
    expires_at = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)
    otp = EmailOTP.objects.create(user=user, code=code, expires_at=expires_at)
    send_otp_email(user, code)
    return otp
