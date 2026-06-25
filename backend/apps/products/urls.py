from django.urls import path
from .views import (
    CategoryListView, BrandListView, ProductListView,
    ProductDetailView, FlashDealListView, home_data, related_products
)

urlpatterns = [
    path('', ProductListView.as_view(), name='product_list'),
    path('home/', home_data, name='home_data'),
    path('categories/', CategoryListView.as_view(), name='categories'),
    path('brands/', BrandListView.as_view(), name='brands'),
    path('flash-deals/', FlashDealListView.as_view(), name='flash_deals'),
    path('<slug:slug>/', ProductDetailView.as_view(), name='product_detail'),
    path('<slug:slug>/related/', related_products, name='related_products'),
]
