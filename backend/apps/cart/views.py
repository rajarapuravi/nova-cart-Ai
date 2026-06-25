from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from apps.products.models import Product, ProductVariant


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart = get_or_create_cart(request.user)
    return Response(CartSerializer(cart, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    cart = get_or_create_cart(request.user)
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))
    variant_id = request.data.get('variant_id')

    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found.'}, status=404)

    variant = None
    if variant_id:
        try:
            variant = ProductVariant.objects.get(id=variant_id, product=product)
        except ProductVariant.DoesNotExist:
            pass

    item, created = CartItem.objects.get_or_create(
        cart=cart, product=product, variant=variant,
        defaults={'quantity': quantity, 'saved_for_later': False}
    )
    if not created:
        item.quantity += quantity
        item.saved_for_later = False
        item.save()

    return Response(CartSerializer(cart, context={'request': request}).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    cart = get_or_create_cart(request.user)
    try:
        item = CartItem.objects.get(id=item_id, cart=cart)
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found.'}, status=404)

    quantity = request.data.get('quantity')
    if quantity is not None:
        if int(quantity) <= 0:
            item.delete()
            return Response(CartSerializer(cart, context={'request': request}).data)
        item.quantity = int(quantity)
        item.save()

    return Response(CartSerializer(cart, context={'request': request}).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_cart_item(request, item_id):
    cart = get_or_create_cart(request.user)
    try:
        item = CartItem.objects.get(id=item_id, cart=cart)
        item.delete()
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found.'}, status=404)
    return Response(CartSerializer(cart, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_for_later(request, item_id):
    cart = get_or_create_cart(request.user)
    try:
        item = CartItem.objects.get(id=item_id, cart=cart)
        item.saved_for_later = not item.saved_for_later
        item.save()
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found.'}, status=404)
    return Response(CartSerializer(cart, context={'request': request}).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    cart = get_or_create_cart(request.user)
    cart.items.all().delete()
    return Response({'message': 'Cart cleared.'})
