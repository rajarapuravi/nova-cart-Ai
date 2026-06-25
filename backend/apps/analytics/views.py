from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, F
from django.utils import timezone
from datetime import timedelta
from apps.admin_panel.permissions import IsAdminUser
from apps.orders.models import Order, OrderItem
from apps.users.models import User
from apps.products.models import Product, Category


@api_view(['GET'])
@permission_classes([IsAdminUser])
def sales_analytics(request):
    period = request.query_params.get('period', '30')
    days = int(period)
    start_date = timezone.now() - timedelta(days=days)

    orders = Order.objects.filter(created_at__gte=start_date)

    # Daily revenue
    daily = []
    for i in range(days):
        day = (timezone.now() - timedelta(days=i)).date()
        rev = orders.filter(created_at__date=day, payment_status='paid').aggregate(
            total=Sum('total_amount'))['total'] or 0
        cnt = orders.filter(created_at__date=day).count()
        daily.append({'date': str(day), 'revenue': float(rev), 'orders': cnt})

    # Top products
    top_products = OrderItem.objects.filter(
        order__created_at__gte=start_date
    ).values('product_name').annotate(
        total_sold=Sum('quantity'),
        revenue=Sum('total_price')
    ).order_by('-total_sold')[:10]

    # Top categories
    top_categories = OrderItem.objects.filter(
        order__created_at__gte=start_date,
        product__isnull=False
    ).values('product__category__name').annotate(
        total_sold=Sum('quantity'),
        revenue=Sum('total_price')
    ).order_by('-revenue')[:5]

    total_revenue = orders.filter(payment_status='paid').aggregate(
        total=Sum('total_amount'))['total'] or 0
    total_orders = orders.count()
    avg_order_value = orders.filter(payment_status='paid').aggregate(
        avg=Avg('total_amount'))['avg'] or 0
    new_customers = User.objects.filter(
        date_joined__gte=start_date, is_staff=False).count()

    return Response({
        'period_days': days,
        'total_revenue': float(total_revenue),
        'total_orders': total_orders,
        'avg_order_value': float(avg_order_value),
        'new_customers': new_customers,
        'daily_data': daily,
        'top_products': list(top_products),
        'top_categories': list(top_categories),
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def revenue_chart(request):
    """Monthly revenue for last 12 months."""
    data = []
    for i in range(12):
        month_start = (timezone.now() - timedelta(days=30*i)).replace(day=1).date()
        rev = Order.objects.filter(
            created_at__year=month_start.year,
            created_at__month=month_start.month,
            payment_status='paid'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        data.append({
            'month': month_start.strftime('%b %Y'),
            'revenue': float(rev)
        })
    return Response(data)
