from django.urls import path
from .views import ContactMessageListCreateView

urlpatterns = [
    path('contact-messages/', ContactMessageListCreateView.as_view(), name='contact-messages'),
]
