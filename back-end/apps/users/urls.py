from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, ProfileView, LogoutView,
    ChangePasswordView, VerifyUserView, ForgotPasswordView,
    ResetPasswordView, VerifyEmailView, AdminCreateUserView,
    SetPasswordView, AdminListUsersView, AdminDeleteUserView,
    PromoteToFoodSaverView, DemoteFromFoodSaverView,
    ChangeEmailRequestView, ChangeEmailConfirmView,
    DeactivateAccountView, DeleteAccountView,
    ResendOTPView, PublicProfileView,
    BlockUserView, UnblockUserView, BlockedUsersListView,
    AdminUserStatsView, FoodSaverThresholdView,
)

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('users/<int:user_id>/', PublicProfileView.as_view(), name='public_profile'),

    # Password
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('set-password/', SetPasswordView.as_view(), name='set_password'),

    # Email
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend_otp'),
    path('change-email/request/', ChangeEmailRequestView.as_view(), name='change_email_request'),
    path('change-email/confirm/', ChangeEmailConfirmView.as_view(), name='change_email_confirm'),

    # Account management
    path('deactivate/', DeactivateAccountView.as_view(), name='deactivate_account'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete_account'),

    # Block / Report
    path('block/<int:user_id>/', BlockUserView.as_view(), name='block_user'),
    path('unblock/<int:user_id>/', UnblockUserView.as_view(), name='unblock_user'),
    path('blocked/', BlockedUsersListView.as_view(), name='blocked_users'),

    # Admin
    path('admin/create-user/', AdminCreateUserView.as_view(), name='admin_create_user'),
    path('admin/users/', AdminListUsersView.as_view(), name='admin-list-users'),
    path('admin/users/stats/', AdminUserStatsView.as_view(), name='admin_user_stats'),
    path('admin/users/<int:user_id>/delete/', AdminDeleteUserView.as_view(), name='admin-delete-user'),
    path('admin/food-saver-threshold/', FoodSaverThresholdView.as_view(), name='food_saver_threshold'),

    # Food Saver
    path('verify/<int:user_id>/', VerifyUserView.as_view(), name='verify_user'),
    path('promote/<int:user_id>/', PromoteToFoodSaverView.as_view(), name='promote-food-saver'),
    path('demote/<int:user_id>/', DemoteFromFoodSaverView.as_view(), name='demote-food-saver'),
]