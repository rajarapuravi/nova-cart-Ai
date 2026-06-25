from rest_framework import serializers
from .models import Cart, CartItem
from apps.products.serializers import ProductListSerializer, ProductVariantSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    variant = ProductVariantSerializer(read_only=True)
    variant_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'variant', 'variant_id',
                  'quantity', 'saved_for_later', 'subtotal', 'added_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    item_count = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count', 'updated_at']
