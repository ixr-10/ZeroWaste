from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import OTPCode
from .permissions import IsFoodSaver, IsAdmin, IsCollectivite, IsAdminOrFoodSaver
from .serializers import RegisterSerializer, UserSerializer, AdminCreateUserSerializer
from django.contrib.auth import authenticate

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            otp = OTPCode.objects.create(user=user)
            otp.send_to_email(
                subject="ZeroWaste - Verify Your Email",
                message_prefix="Welcome to ZeroWaste!"
            )
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Account created! Please verify your email.',
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=400)

        # Try email or username
        try:
            if '@' in username:
                user_obj = User.objects.get(email=username)
                username = user_obj.username  # get actual username for authenticate()
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials.'}, status=401)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials.'}, status=401)

        if not user.is_verified:
            return Response({'error': 'Please verify your email first.'}, status=403)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully."})
        except Exception:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not check_password(old_password, user.password):
            return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully.'})


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        try:
            user = User.objects.get(email=email)
            otp = OTPCode.objects.filter(user=user, code=code, is_used=False).last()

            if not otp or not otp.is_valid():
                return Response({'error': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

            user.is_verified = True
            user.save()
            otp.is_used = True
            otp.save()
            return Response({'message': 'Email verified successfully!'})

        except User.DoesNotExist:
            return Response({'error': 'Invalid email.'}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            OTPCode.objects.filter(user=user, is_used=False).update(is_used=True)
            otp = OTPCode.objects.create(user=user)
            otp.send_to_email(
                subject="ZeroWaste - Password Reset Code",
                message_prefix="You requested a password reset."
            )
            return Response({'message': 'Reset code sent to your email.'})
        except User.DoesNotExist:
            return Response({'message': 'If this email exists, a code was sent.'})

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        try:
            user = User.objects.get(email=email)
            otp = OTPCode.objects.filter(user=user, code=code, is_used=False).last()

            if not otp or not otp.is_valid():
                return Response({'error': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

            if len(new_password) < 8:
                return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            otp.is_used = True
            otp.save()
            return Response({'message': 'Password reset successfully. You can now login.'})

        except User.DoesNotExist:
            return Response({'error': 'Invalid email.'}, status=status.HTTP_400_BAD_REQUEST)


class VerifyUserView(APIView):
    permission_classes = [IsAuthenticated, IsFoodSaver]

    def post(self, request, user_id):
        try:
            user_to_verify = User.objects.get(id=user_id)
            if user_to_verify.is_verified:
                return Response({'message': 'User is already verified.'})
            user_to_verify.is_verified = True
            user_to_verify.save()
            request.user.reputation_score += 10
            request.user.save()
            return Response({'message': f'{user_to_verify.username} has been verified successfully.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class AdminCreateUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            otp = OTPCode.objects.create(user=user)
            
            frontend_url = settings.FRONTEND_URL  # e.g. "http://localhost:3000"
            set_password_link = f"{frontend_url}/set-password"
            
            otp.send_to_email(
                subject="ZeroWaste - Set Your Password",
                message_prefix=(
                    f"Your account has been created by the admin.\n\n"
                    f"Click the link below to set your password:\n"
                    f"{set_password_link}\n\n"
                    f"Then use this code when prompted:"
                )
            )
            return Response({
                'user': UserSerializer(user).data,
                'message': f'Account created for {user.username}. An email was sent to set their password.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminListUsersView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        role = request.query_params.get('role')
        users = User.objects.exclude(role='admin').order_by('-created_at')
        if role:
            users = users.filter(role=role)
        serializer = UserSerializer(users, many=True)
        return Response({
            'count': users.count(),
            'users': serializer.data
        })

class PromoteToFoodSaverView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrFoodSaver]

    def post(self, request, user_id):
        try:
            user_to_promote = User.objects.get(id=user_id)

            if user_to_promote.role == 'food_saver':
                return Response({'message': f'{user_to_promote.username} is already a Food Saver.'})

            if user_to_promote.role == 'collectivite':
                return Response({'error': 'Cannot change role of a Collectivite account.'}, status=status.HTTP_400_BAD_REQUEST)

            user_to_promote.role = 'food_saver'
            user_to_promote.save()

            request.user.reputation_score += 10
            request.user.save()

            return Response({'message': f'{user_to_promote.username} is now a Food Saver.'})

        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


# ─── Add these two classes to your existing views.py ─────────────────────────
# Make sure OTPCode is already imported (it is in your current views.py)
# Also make sure this import is at the top of views.py:
# from django.core.validators import validate_email
# from django.core.exceptions import ValidationError


class ChangeEmailRequestView(APIView):
    """
    Step 1 — User submits their desired new email.
    We validate it, then send an OTP to that new email address.
    POST /change-email/request/
    Body: { "new_email": "new@example.com" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_email = request.data.get('new_email', '').strip()

        if not new_email:
            return Response({'error': 'New email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Basic format check
        if '@' not in new_email:
            return Response({'error': 'Enter a valid email address.'}, status=status.HTTP_400_BAD_REQUEST)

        # Must be different from current
        if new_email == request.user.email:
            return Response({'error': 'New email must be different from your current email.'}, status=status.HTTP_400_BAD_REQUEST)

        # Must not already be taken by another user
        if User.objects.filter(email=new_email).exclude(id=request.user.id).exists():
            return Response({'error': 'This email is already in use.'}, status=status.HTTP_400_BAD_REQUEST)

        # Invalidate any previous unused OTPs for this user
        OTPCode.objects.filter(user=request.user, is_used=False).update(is_used=True)

        # Create and send OTP to the NEW email (not the current one)
        otp = OTPCode.objects.create(user=request.user)
        otp.send_to_email_address(
            email=new_email,
            subject="ZeroWaste - Confirm Your New Email",
            message_prefix="You requested an email change. Use this code to confirm your new email address."
        )

        return Response({'message': 'Confirmation code sent to your new email address.'})


class ChangeEmailConfirmView(APIView):
    """
    Step 2 — User submits the OTP they received on their new email.
    We verify the OTP, then update their email.
    POST /change-email/confirm/
    Body: { "new_email": "new@example.com", "code": "123456" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_email = request.data.get('new_email', '').strip()
        code = request.data.get('code', '').strip()

        if not new_email or not code:
            return Response({'error': 'Email and code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify OTP
        otp = OTPCode.objects.filter(user=request.user, code=code, is_used=False).last()
        if not otp or not otp.is_valid():
            return Response({'error': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

        # Double-check email not taken
        if User.objects.filter(email=new_email).exclude(id=request.user.id).exists():
            return Response({'error': 'This email is already in use.'}, status=status.HTTP_400_BAD_REQUEST)

        # Update email
        request.user.email = new_email
        request.user.save()
        otp.is_used = True
        otp.save()

        return Response({'message': 'Email updated successfully.'})













class SetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        code = request.data.get('code')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not all([username, code, new_password, confirm_password]):
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)

            if user.has_usable_password():
                return Response({'error': 'Password already set. Use forgot password instead.'}, status=status.HTTP_400_BAD_REQUEST)

            otp = OTPCode.objects.filter(user=user, code=code, is_used=False).last()
            if not otp or not otp.is_valid():
                return Response({'error': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.is_verified = True
            user.save()
            otp.is_used = True
            otp.save()
            return Response({'message': 'Password set successfully. You can now login.'})

        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)

class DeactivateAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass

        user.is_active = False
        user.save()

        return Response({'message': 'Account deactivated successfully. You can reactivate by logging back in.'})


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user

        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass

        user.delete()

        return Response({'message': 'Account permanently deleted.'}, status=status.HTTP_200_OK)

class AdminDeleteUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return Response({'message': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND) 

class DemoteFromFoodSaverView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        try:
            user_to_demote = User.objects.get(id=user_id)

            if user_to_demote.role != 'food_saver':
                return Response({'error': 'User is not a Food Saver.'}, status=status.HTTP_400_BAD_REQUEST)

            if user_to_demote.role == 'collectivite':
                return Response({'error': 'Cannot change role of a Collectivite account.'}, status=status.HTTP_400_BAD_REQUEST)

            user_to_demote.role = 'user'
            user_to_demote.save()

            return Response({'message': f'{user_to_demote.username} is no longer a Food Saver.'})

        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
