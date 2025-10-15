# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import RegisterSerializer, LoginSerializer, OTPVerifySerializer
from .utils import create_and_send_otp
from .models import EmailOTP
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"detail": "User created"}, status=status.HTTP_201_CREATED)


class LoginSendOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        otp = create_and_send_otp(user)
        return Response({"detail": "OTP sent to email", "otp_id": str(otp.id)}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp_id = serializer.validated_data['otp_id']
        code = serializer.validated_data['code']
        try:
            otp = EmailOTP.objects.get(id=otp_id)
        except EmailOTP.DoesNotExist:
            return Response({"detail": "Invalid OTP reference"}, status=status.HTTP_400_BAD_REQUEST)

        if otp.used:
            return Response({"detail": "OTP already used"}, status=status.HTTP_400_BAD_REQUEST)
        if otp.is_expired():
            return Response({"detail": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)
        if otp.code != code:
            return Response({"detail": "Invalid OTP code"}, status=status.HTTP_400_BAD_REQUEST)

        # mark otp used
        otp.used = True
        otp.save()

        # create JWT tokens
        refresh = RefreshToken.for_user(otp.user)
        data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        return Response(data, status=status.HTTP_200_OK)

from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import User
from .serializers import UserSerializer

class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class UserUpdateView(RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = 'id'
