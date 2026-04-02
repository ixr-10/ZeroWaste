import random
from django.core.mail import send_mail
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.is_active = False
        user.save()

        code = str(random.randint(100000, 999999))
        cache.set(f'verify_{user.username}', code, timeout=600)

        send_mail(
            subject='ZeroWaste - Email Verification',
            message=f'Your verification code is: {code}',
            from_email=None,
            recipient_list=[user.email],
        )

        return Response({
            'message': 'Registration successful. Check your email for the verification code.',
            'username': user.username,
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def verify_email(request):
    username = request.data.get('username')
    code = request.data.get('code')

    cached_code = cache.get(f'verify_{username}')

    if not cached_code:
        return Response({'error': 'Code expired. Please register again.'}, status=400)
    if code != cached_code:
        return Response({'error': 'Invalid code.'}, status=400)

    user = User.objects.get(username=username)
    user.is_active = True
    user.save()
    cache.delete(f'verify_{username}')

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    })


@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        if not user.is_active:
            return Response({'error': 'Please verify your email first.'}, status=status.HTTP_403_FORBIDDEN)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })
    return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required.'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Return success anyway to avoid email enumeration
        return Response({'message': 'If this email exists, a reset code was sent.'})

    code = str(random.randint(100000, 999999))
    cache.set(f'reset_{email}', code, timeout=600)  # 10 min

    send_mail(
        subject='ZeroWaste - Password Reset Code',
        message=f'Your password reset code is: {code}',
        from_email=None,
        recipient_list=[email],
    )

    return Response({'message': 'Reset code sent to your email.'})


@api_view(['POST'])
def verify_reset_code(request):
    email = request.data.get('email')
    code = request.data.get('code')

    if not email or not code:
        return Response({'error': 'Email and code are required.'}, status=400)

    cached_code = cache.get(f'reset_{email}')

    if not cached_code:
        return Response({'error': 'Code expired. Please request a new one.'}, status=400)
    if code != cached_code:
        return Response({'error': 'Invalid code.'}, status=400)

    # Mark code as verified so reset-password can trust it
    cache.set(f'reset_verified_{email}', code, timeout=300)  # 5 min to complete reset

    return Response({'message': 'Code verified. You may now reset your password.'})


@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    code = request.data.get('code')
    password = request.data.get('password')

    if not all([email, code, password]):
        return Response({'error': 'Email, code, and password are required.'}, status=400)

    # Check the verified code is still valid
    verified_code = cache.get(f'reset_verified_{email}')
    if not verified_code or verified_code != code:
        return Response({'error': 'Invalid or expired reset session. Please start over.'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

    user.set_password(password)
    user.save()

    # Clean up cache
    cache.delete(f'reset_{email}')
    cache.delete(f'reset_verified_{email}')

    return Response({'message': 'Password reset successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)