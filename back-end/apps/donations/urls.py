from django.urls import path
from .export import AdminExportView
from .views import (
    CreateDonationView,
    EditDonationView,
    DeleteDonationView,
    MyDonationsView,
    ReservationByConversationView,
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
    NotInterestedView,
    AdminAllDonationsView,
    AdminStatisticsView,
    RateReservationView
)

urlpatterns = [
    # ── Donations ──────────────────────────────────────
    path('create_donation/', CreateDonationView.as_view(), name='create_donation'),
    path('my-donations/', MyDonationsView.as_view(), name='my_donations'),

    # ── Reservations (specific routes FIRST) ───────────
    path('reservations/by-conversation/<int:conversation_id>/',
         ReservationByConversationView.as_view(),
         name='reservation-by-conversation'),
    path('reservations/my-reservations/', MyReservationsView.as_view(), name='my_reservations'),
    path('reservations/received/', MyReceivedReservationsView.as_view(), name='received_reservations'),
    path('reservations/<int:reservation_id>/confirm/', ConfirmReservationView.as_view(), name='confirm_reservation'),
    path('reservations/<int:reservation_id>/reject/', RejectReservationView.as_view(), name='reject_reservation'),
    path('reservations/<int:reservation_id>/cancel/', CancelReservationView.as_view(), name='cancel_reservation'),
    path('reservations/<int:reservation_id>/rate/', RateReservationView.as_view(), name='rate-reservation'),

    # ── Donation detail routes (dynamic int AFTER static) ──
    path('<int:donation_id>/edit/', EditDonationView.as_view(), name='edit_donation'),
    path('<int:donation_id>/delete/', DeleteDonationView.as_view(), name='delete_donation'),
    path('<int:donation_id>/complete/', CompleteDonationView.as_view(), name='complete_donation'),
    path('<int:donation_id>/reservations/', DonationReservationsView.as_view(), name='donation_reservations'),

    # ── Home feed ──────────────────────────────────────
    path('available/', AvailableDonationsView.as_view(), name='available_donations'),
    path('available/<int:donation_id>/', PublicDonationDetailView.as_view(), name='public_donation_detail'),
    path('available/<int:donation_id>/reserve/', ReserveDonationView.as_view(), name='reserve_donation'),
    path('available/<int:donation_id>/not-interested/', NotInterestedView.as_view(), name='not_interested'),

    # ── Admin ──────────────────────────────────────────
    path('admin/all/', AdminAllDonationsView.as_view(), name='admin_all_donations'),
    path('admin/statistics/', AdminStatisticsView.as_view(), name='admin_statistics'),
    path('admin/export/', AdminExportView.as_view(), name='admin-export'),
]