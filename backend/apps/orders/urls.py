from django.urls import path
from .views import OrderListView, OrderDetailView, place_order, cancel_order, download_invoice

urlpatterns = [
    path('', OrderListView.as_view(), name='orders'),
    path('place/', place_order, name='place_order'),
    path('<str:order_id>/', OrderDetailView.as_view(), name='order_detail'),
    path('<str:order_id>/cancel/', cancel_order, name='cancel_order'),
    path('<str:order_id>/invoice/', download_invoice, name='download_invoice'),
]
