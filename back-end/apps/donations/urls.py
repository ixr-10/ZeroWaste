from django.urls import path
from .views import (
    CreateDonationView,
    MyDonationsView,
    ReserveDonationView,
    ConfirmReservationView,
    RejectReservationView,
    MyReceivedReservationsView,
    CompleteDonationView,
    AvailableDonationsView,
    PublicDonationDetailView,     
    DonationReservationsView,
    CancelReservationView,
    MyReservationsView,
    DeleteDonationView,
)

urlpatterns = [
    # Create donation
    path('', CreateDonationView.as_view(), name='create_donation'),

    # My donations (donor profile)
    path('my-donations/', MyDonationsView.as_view(), name='my_donations'),

    # Public donation detail + reserve
    path('available/', AvailableDonationsView.as_view(), name='available_donations'),
    path('available/<int:donation_id>/', PublicDonationDetailView.as_view(), name='public_donation_detail'),
    path('available/<int:donation_id>/reserve/', ReserveDonationView.as_view(), name='reserve_donation'),

    # Reservation actions (for donor)
    path('reservations/<int:reservation_id>/confirm/', ConfirmReservationView.as_view(), name='confirm_reservation'),
    path('reservations/<int:reservation_id>/reject/', RejectReservationView.as_view(), name='reject_reservation'),
    path('reservations/received/', MyReceivedReservationsView.as_view(), name='received_reservations'),

    # Complete donation
    path('<int:donation_id>/complete/', CompleteDonationView.as_view(), name='complete_donation'),

    # Specific donation's reservations (for donor)
    path('<int:donation_id>/reservations/', DonationReservationsView.as_view(), name='donation_reservations'),

    # My reservations (for beneficiary)
    path('reservations/my-reservations/', MyReservationsView.as_view(), name='my_reservations'),

    # Cancel reservation (by beneficiary)
    path('reservations/<int:reservation_id>/cancel/', CancelReservationView.as_view(), name='cancel_reservation'),
    # Delete donation (by donor, only if no active reservations)
    path('<int:donation_id>/delete/', DeleteDonationView.as_view(), name='delete_donation'),
]  
   