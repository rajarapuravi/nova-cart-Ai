from django.urls import path
from .views import get_cart, add_to_cart, update_cart_item, remove_cart_item, save_for_later, clear_cart

urlpatterns = [
    path('', get_cart, name='cart'),
    path('add/', add_to_cart, name='cart_add'),
    path('clear/', clear_cart, name='cart_clear'),
    path('item/<int:item_id>/update/', update_cart_item, name='cart_item_update'),
    path('item/<int:item_id>/remove/', remove_cart_item, name='cart_item_remove'),
    path('item/<int:item_id>/save-later/', save_for_later, name='cart_save_later'),
]
