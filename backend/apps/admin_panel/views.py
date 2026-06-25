from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
from .permissions import IsAdminUser, IsSuperAdmin
from .serializers import (
    AdminProductSerializer, AdminCategorySerializer,
    AdminOrderSerializer, AdminUserSerializer, AdminCouponSerializer
)
from apps.products.models import Product, Category, Brand
from apps.orders.models import Order, OrderTracking
from apps.users.models import User
from apps.coupons.models import Coupon


# ── Dashboard ────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    total_orders = Order.objects.count()
    total_revenue = Order.objects.filter(payment_status='paid').aggregate(
        total=Sum('total_amount'))['total'] or 0
    today_orders = Order.objects.filter(created_at__date=today).count()
    today_revenue = Order.objects.filter(
        created_at__date=today, payment_status='paid'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    total_users = User.objects.filter(is_staff=False).count()
    total_products = Product.objects.filter(is_active=True).count()
    low_stock = Product.objects.filter(stock__lte=10, is_active=True).count()
    pending_orders = Order.objects.filter(status='pending').count()

    # Weekly revenue
    weekly_data = []
    for i in range(7):
        day = today - timedelta(days=i)
        rev = Order.objects.filter(
            created_at__date=day, payment_status='paid'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        weekly_data.append({'date': str(day), 'revenue': float(rev)})

    return Response({
        'total_orders': total_orders,
        'total_revenue': float(total_revenue),
        'today_orders': today_orders,
        'today_revenue': float(today_revenue),
        'total_users': total_users,
        'total_products': total_products,
        'low_stock_count': low_stock,
        'pending_orders': pending_orders,
        'weekly_revenue': weekly_data,
    })


# ── Products ─────────────────────────────────────────────────────
class AdminProductListCreate(generics.ListCreateAPIView):
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all().order_by('-created_at')


class AdminProductDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all()


# ── Categories ───────────────────────────────────────────────────
class AdminCategoryListCreate(generics.ListCreateAPIView):
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUser]
    queryset = Category.objects.all()


class AdminCategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUser]
    queryset = Category.objects.all()


# ── Orders ───────────────────────────────────────────────────────
class AdminOrderListView(generics.ListAPIView):
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all().order_by('-created_at')


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all()
    lookup_field = 'order_id'


@api_view(['POST'])
@permission_classes([IsAdminUser])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(order_id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=404)

    new_status = request.data.get('status')
    message = request.data.get('message', '')
    location = request.data.get('location', '')

    valid_statuses = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']
    if new_status not in valid_statuses:
        return Response({'error': 'Invalid status.'}, status=400)

    order.status = new_status
    if new_status == 'delivered':
        order.payment_status = 'paid'
        order.delivered_at = timezone.now()
    order.save()

    status_labels = {
        'confirmed': 'Order Confirmed',
        'packed': 'Order Packed',
        'shipped': 'Order Shipped',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
    }
    OrderTracking.objects.create(
        order=order,
        status=status_labels.get(new_status, new_status),
        message=message or f"Order status updated to {new_status}.",
        location=location
    )
    return Response(AdminOrderSerializer(order).data)


# ── Users ────────────────────────────────────────────────────────
class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.filter(is_staff=False).order_by('-date_joined')


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()


# ── Coupons ──────────────────────────────────────────────────────
class AdminCouponListCreate(generics.ListCreateAPIView):
    serializer_class = AdminCouponSerializer
    permission_classes = [IsAdminUser]
    queryset = Coupon.objects.all()


class AdminCouponDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminCouponSerializer
    permission_classes = [IsAdminUser]
    queryset = Coupon.objects.all()


# ── Inventory ────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def inventory_report(request):
    products = Product.objects.filter(is_active=True).values(
        'id', 'name', 'stock', 'category__name', 'brand__name'
    ).order_by('stock')
    low_stock = [p for p in products if p['stock'] <= 10]
    out_of_stock = [p for p in products if p['stock'] == 0]
    return Response({
        'total_products': len(products),
        'low_stock': low_stock,
        'out_of_stock': out_of_stock,
        'all_products': list(products),
    })
