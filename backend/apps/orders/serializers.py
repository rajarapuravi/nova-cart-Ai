from rest_framework import serializers
from .models import Order, OrderItem, OrderTracking


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTracking
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    tracking = OrderTrackingSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['user', 'order_id', 'created_at', 'updated_at']


class PlaceOrderSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=[
        'upi', 'card', 'netbanking', 'cod', 'wallet',
        'google_pay', 'phonepe', 'paytm', 'amazon_pay'
    ])
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    payment_id = serializers.CharField(required=False, allow_blank=True)
