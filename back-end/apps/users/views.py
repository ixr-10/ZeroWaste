from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import render

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTPCode
from .permissions import IsFoodSaver,IsAdmin
from .serializers import RegisterSerializer, UserSerializer, AdminCreateUserSerializer

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

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Send verification code
            code = OTPCode.generate_code()
            OTPCode.objects.create(user=user, code=code)
            send_mail(
                subject='ZeroWaste - Verify Your Email',
                message=f'Welcome to ZeroWaste!\nYour verification code is: {code}\nThis code expires in 10 minutes.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Account created! Please verify your email.',
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            otp = OTPCode.objects.create(user=user)
            otp.send_to_email(
                subject="ZeroWaste - Password Reset Code",
                message_prefix="You requested a password reset."
            )
            return Response({'message': 'Reset code sent to your email.'})
        except User.DoesNotExist:
            return Response({'message': 'If this email exists, a code was sent.'})

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            code = OTPCode.generate_code()
            OTPCode.objects.create(user=user, code=code)
            send_mail(
                subject='ZeroWaste - Password Reset Code',
                message=f'Your password reset code is: {code}\nThis code expires in 10 minutes.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
            )
            return Response({'message': 'Reset code sent to your email.'})
        except User.DoesNotExist:
            # Don't reveal if email exists
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

class AdminCreateUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            otp = OTPCode.objects.create(user=user)
            otp.send_to_email(
                subject="ZeroWaste - Set Your Password",
                message_prefix=f"Your account has been created by the admin.\nUse this code to set your password."
            )

            return Response({
                'user': UserSerializer(user).data,
                'message': f'Account created for {user.username}. An email was sent to set their password.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)