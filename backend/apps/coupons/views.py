from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Coupon
from .serializers import ApplyCouponSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_coupon(request):
    serializer = ApplyCouponSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    code = serializer.validated_data['code']
    amount = serializer.validated_data['order_amount']
    try:
        coupon = Coupon.objects.get(code__iexact=code, is_active=True)
        if not coupon.is_valid(amount):
            return Response({'error': 'Coupon is invalid or expired.'}, status=400)
        discount = coupon.get_discount(amount)
        return Response({
            'valid': True,
            'code': coupon.code,
            'discount': float(discount),
            'description': coupon.description,
        })
    except Coupon.DoesNotExist:
        return Response({'error': 'Coupon not found.'}, status=404)
