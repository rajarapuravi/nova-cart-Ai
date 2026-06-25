from rest_framework import serializers
from apps.products.models import Product, Category, Brand, ProductImage
from apps.orders.models import Order
from apps.coupons.models import Coupon
from apps.users.models import User


class AdminProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class AdminOrderSerializer(serializers.ModelSerializer):
    from apps.orders.serializers import OrderItemSerializer
    items = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def get_items(self, obj):
        from apps.orders.serializers import OrderItemSerializer
        return OrderItemSerializer(obj.items.all(), many=True).data


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'is_active',
                  'is_staff', 'date_joined', 'is_email_verified']


class AdminCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'
