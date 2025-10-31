# accounts/urls.py
from django.urls import path
from .views import RegisterView, LoginView
from .views import UserListView, UserUpdateView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),  # direct login without OTP
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:id>/', UserUpdateView.as_view(), name='user-update'),
]
