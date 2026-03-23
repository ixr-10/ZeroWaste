from django.urls import path
from .views import (
    CreateDonationView, MyDonationsView,
    DonationDetailView, CompleteDonationView
)

urlpatterns = [
    path('', CreateDonationView.as_view(), name='create_donation'),
    path('my-donations/', MyDonationsView.as_view(), name='my_donations'),
    path('<int:donation_id>/', DonationDetailView.as_view(), name='donation_detail'),
    path('<int:donation_id>/complete/', CompleteDonationView.as_view(), name='complete_donation'),
]