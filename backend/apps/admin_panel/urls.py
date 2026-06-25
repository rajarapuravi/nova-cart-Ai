from django.urls import path
from .views import (
    dashboard_stats,
    AdminProductListCreate, AdminProductDetail,
    AdminCategoryListCreate, AdminCategoryDetail,
    AdminOrderListView, AdminOrderDetailView, update_order_status,
    AdminUserListView, AdminUserDetailView,
    AdminCouponListCreate, AdminCouponDetail,
    inventory_report,
)

urlpatterns = [
    path('dashboard/', dashboard_stats, name='admin_dashboard'),

    path('products/', AdminProductListCreate.as_view(), name='admin_products'),
    path('products/<int:pk>/', AdminProductDetail.as_view(), name='admin_product_detail'),

    path('categories/', AdminCategoryListCreate.as_view(), name='admin_categories'),
    path('categories/<int:pk>/', AdminCategoryDetail.as_view(), name='admin_category_detail'),

    path('orders/', AdminOrderListView.as_view(), name='admin_orders'),
    path('orders/<str:order_id>/', AdminOrderDetailView.as_view(), name='admin_order_detail'),
    path('orders/<str:order_id>/status/', update_order_status, name='admin_update_order_status'),

    path('users/', AdminUserListView.as_view(), name='admin_users'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),

    path('coupons/', AdminCouponListCreate.as_view(), name='admin_coupons'),
    path('coupons/<int:pk>/', AdminCouponDetail.as_view(), name='admin_coupon_detail'),

    path('inventory/', inventory_report, name='admin_inventory'),
]
