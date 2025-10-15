# accounts/urls.py
from django.urls import path
from .views import RegisterView, LoginSendOTPView, VerifyOTPView
from .views import UserListView, UserUpdateView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginSendOTPView.as_view(), name='login_send_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<int:id>/", UserUpdateView.as_view(), name="user-update"),
]
