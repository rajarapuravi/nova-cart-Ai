from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer
from apps.products.models import Product
from apps.cart.models import Cart, CartItem


def get_or_create_wishlist(user):
    wishlist, _ = Wishlist.objects.get_or_create(user=user)
    return wishlist


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    wishlist = get_or_create_wishlist(request.user)
    return Response(WishlistSerializer(wishlist, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request):
    product_id = request.data.get('product_id')
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found.'}, status=404)

    wishlist = get_or_create_wishlist(request.user)
    item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)
    if not created:
        item.delete()
        return Response({'message': 'Removed from wishlist.', 'in_wishlist': False})
    return Response({'message': 'Added to wishlist.', 'in_wishlist': True})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def move_to_cart(request, item_id):
    wishlist = get_or_create_wishlist(request.user)
    try:
        item = WishlistItem.objects.get(id=item_id, wishlist=wishlist)
    except WishlistItem.DoesNotExist:
        return Response({'error': 'Item not found.'}, status=404)

    cart, _ = Cart.objects.get_or_create(user=request.user)
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart, product=item.product,
        defaults={'quantity': 1}
    )
    if not created:
        cart_item.quantity += 1
        cart_item.save()
    item.delete()
    return Response({'message': 'Moved to cart.'})
