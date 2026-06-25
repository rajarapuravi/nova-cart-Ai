from django.urls import path
from .views import get_wishlist, toggle_wishlist, move_to_cart

urlpatterns = [
    path('', get_wishlist, name='wishlist'),
    path('toggle/', toggle_wishlist, name='wishlist_toggle'),
    path('move-to-cart/<int:item_id>/', move_to_cart, name='wishlist_move_to_cart'),
]
