from django.urls import path
from .views import (
    CreateDonationView, MyDonationsView,
    DonationDetailView, CompleteDonationView,AvailableDonationsView, PublicDonationDetailView,
    ReserveDonationView, CancelReservationView, MyReservationsView
)

urlpatterns = [
    path('', CreateDonationView.as_view(), name='create_donation'),
    path('my-donations/', MyDonationsView.as_view(), name='my_donations'),
    path('<int:donation_id>/', DonationDetailView.as_view(), name='donation_detail'),
    path('<int:donation_id>/complete/', CompleteDonationView.as_view(), name='complete_donation'),
    path('available/', AvailableDonationsView.as_view(), name='available_donations'),
    path('available/<int:donation_id>/', PublicDonationDetailView.as_view(), name='public_donation_detail'),
    path('available/<int:donation_id>/reserve/', ReserveDonationView.as_view(), name='reserve_donation'),
    path('reservations/my-reservations/', MyReservationsView.as_view(), name='my_reservations'),
    path('reservations/<int:reservation_id>/cancel/', CancelReservationView.as_view(), name='cancel_reservation'),
]