from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (PromoteToFoodSaverView,AdminListUsersView, RegisterView, ProfileView, LogoutView, ChangePasswordView,LoginView,
                    VerifyUserView, ForgotPasswordView, ResetPasswordView, VerifyEmailView , AdminCreateUserView,SetPasswordView,AdminDeleteUserView,DemoteFromFoodSaverView)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('verify/<int:user_id>/', VerifyUserView.as_view(), name='verify_user'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('set-password/', SetPasswordView.as_view() , name='set_password'),
    path('admin/create-user/', AdminCreateUserView.as_view(), name='admin_create_user'),   
    path('admin/users/', AdminListUsersView.as_view(), name='admin-list-users'),
    path('promote/<int:user_id>/', PromoteToFoodSaverView.as_view(), name='promote-food-saver'),
    path('admin/users/<int:user_id>/delete/', AdminDeleteUserView.as_view(), name='admin-delete-user'),
    path('demote/<int:user_id>/', DemoteFromFoodSaverView.as_view(), name='demote-food-saver'),
]