from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from .models import Address, OTPVerification
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    AddressSerializer, ChangePasswordSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer
)

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Send welcome email
        try:
            send_mail(
                'Welcome to NovaCart AI!',
                f'Hi {user.first_name}, welcome to NovaCart AI. Your account is ready.',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,
            )
        except Exception:
            pass
        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Registration successful.',
            'user': UserSerializer(user).data,
            **tokens
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Login successful.',
            'user': UserSerializer(user).data,
            **tokens
        })


class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully.'})


class ForgotPasswordView(generics.GenericAPIView):
    serializer_class = ForgotPasswordSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            otp_obj = OTPVerification.objects.create(user=user, purpose='reset')
            otp = otp_obj.generate_otp()
            send_mail(
                'NovaCart AI - Password Reset OTP',
                f'Your OTP for password reset is: {otp}\nValid for 10 minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            pass
        return Response({'message': 'If the email exists, OTP has been sent.'})


class ResetPasswordView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            user = User.objects.get(email=data['email'])
            otp_obj = OTPVerification.objects.filter(
                user=user, otp=data['otp'], purpose='reset', is_used=False
            ).latest('created_at')
            otp_obj.is_used = True
            otp_obj.save()
            user.set_password(data['new_password'])
            user.save()
            return Response({'message': 'Password reset successfully.'})
        except (User.DoesNotExist, OTPVerification.DoesNotExist):
            return Response({'error': 'Invalid OTP or email.'}, status=status.HTTP_400_BAD_REQUEST)


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None   # always return plain array, no pagination

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user).order_by('-is_default', '-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user).order_by('-is_default', '-created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_ai_preference(request):
    provider = request.data.get('ai_provider')
    if provider not in ['openai', 'gemini']:
        return Response({'error': 'Invalid provider.'}, status=status.HTTP_400_BAD_REQUEST)
    request.user.ai_provider = provider
    request.user.save()
    return Response({'message': f'AI provider updated to {provider}.'})
