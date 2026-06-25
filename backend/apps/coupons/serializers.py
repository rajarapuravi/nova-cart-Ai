from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'description', 'discount_type', 'discount_value',
                  'minimum_order', 'maximum_discount', 'valid_from', 'valid_to']


class ApplyCouponSerializer(serializers.Serializer):
    code = serializers.CharField()
    order_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
