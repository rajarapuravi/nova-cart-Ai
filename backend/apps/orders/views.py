from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings as django_settings
from .models import Order, OrderItem, OrderTracking
from .serializers import OrderSerializer, PlaceOrderSerializer
from apps.users.models import Address
from apps.cart.models import Cart, CartItem
from apps.coupons.models import Coupon
import decimal


def generate_invoice_pdf(order):
    """Generate PDF invoice using reportlab."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import cm
        import io

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        w, h = A4

        # Header
        p.setFont("Helvetica-Bold", 24)
        p.drawString(2*cm, h - 2*cm, "NovaCart AI")
        p.setFont("Helvetica", 10)
        p.drawString(2*cm, h - 2.7*cm, "Invoice")
        p.drawString(14*cm, h - 2*cm, f"Order: {order.order_id}")
        p.drawString(14*cm, h - 2.5*cm, f"Date: {order.created_at.strftime('%d %b %Y')}")

        # Shipping
        p.setFont("Helvetica-Bold", 11)
        p.drawString(2*cm, h - 4*cm, "Shipping To:")
        p.setFont("Helvetica", 10)
        p.drawString(2*cm, h - 4.5*cm, order.shipping_name)
        p.drawString(2*cm, h - 5*cm, order.shipping_address)
        p.drawString(2*cm, h - 5.5*cm, f"{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}")

        # Table header
        y = h - 7*cm
        p.setFont("Helvetica-Bold", 10)
        p.drawString(2*cm, y, "Item")
        p.drawString(10*cm, y, "Qty")
        p.drawString(12*cm, y, "Unit Price")
        p.drawString(16*cm, y, "Total")
        p.line(2*cm, y - 0.2*cm, 19*cm, y - 0.2*cm)

        y -= 0.8*cm
        p.setFont("Helvetica", 10)
        for item in order.items.all():
            p.drawString(2*cm, y, item.product_name[:40])
            p.drawString(10*cm, y, str(item.quantity))
            p.drawString(12*cm, y, f"Rs.{item.unit_price}")
            p.drawString(16*cm, y, f"Rs.{item.total_price}")
            y -= 0.6*cm

        # Totals
        y -= 0.5*cm
        p.line(2*cm, y, 19*cm, y)
        y -= 0.5*cm
        p.drawString(12*cm, y, "Subtotal:")
        p.drawString(16*cm, y, f"Rs.{order.subtotal}")
        y -= 0.5*cm
        if order.discount_amount:
            p.drawString(12*cm, y, "Discount:")
            p.drawString(16*cm, y, f"-Rs.{order.discount_amount}")
            y -= 0.5*cm
        if order.coupon_discount:
            p.drawString(12*cm, y, "Coupon:")
            p.drawString(16*cm, y, f"-Rs.{order.coupon_discount}")
            y -= 0.5*cm
        p.drawString(12*cm, y, "Tax (18%):")
        p.drawString(16*cm, y, f"Rs.{order.tax_amount}")
        y -= 0.5*cm
        p.setFont("Helvetica-Bold", 11)
        p.drawString(12*cm, y, "TOTAL:")
        p.drawString(16*cm, y, f"Rs.{order.total_amount}")

        p.showPage()
        p.save()
        buffer.seek(0)
        return buffer.read()
    except Exception as e:
        return None


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order_id'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    serializer = PlaceOrderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    # Get cart
    try:
        cart = Cart.objects.get(user=request.user)
        cart_items = cart.items.filter(saved_for_later=False)
        if not cart_items.exists():
            return Response({'error': 'Cart is empty.'}, status=400)
    except Cart.DoesNotExist:
        return Response({'error': 'Cart not found.'}, status=400)

    # Get address
    try:
        address = Address.objects.get(id=data['address_id'], user=request.user)
    except Address.DoesNotExist:
        return Response({'error': 'Address not found.'}, status=400)

    # Calculate totals
    subtotal = sum(item.subtotal for item in cart_items)
    discount = decimal.Decimal('0')
    coupon_discount = decimal.Decimal('0')
    coupon_code = data.get('coupon_code', '')

    if coupon_code:
        try:
            coupon = Coupon.objects.get(code=coupon_code, is_active=True)
            if coupon.is_valid(subtotal):
                coupon_discount = coupon.get_discount(subtotal)
        except Exception:
            pass

    tax = (subtotal - discount - coupon_discount) * decimal.Decimal('0.18')
    shipping = decimal.Decimal('0') if subtotal >= 499 else decimal.Decimal('49')
    total = subtotal - discount - coupon_discount + tax + shipping

    # Create order
    order = Order.objects.create(
        user=request.user,
        shipping_name=address.name,
        shipping_phone=address.phone,
        shipping_address=f"{address.address_line1}, {address.address_line2}".strip(', '),
        shipping_city=address.city,
        shipping_state=address.state,
        shipping_pincode=address.pincode,
        shipping_country=address.country,
        subtotal=subtotal,
        discount_amount=discount,
        coupon_discount=coupon_discount,
        tax_amount=tax.quantize(decimal.Decimal('0.01')),
        shipping_charge=shipping,
        total_amount=total.quantize(decimal.Decimal('0.01')),
        coupon_code=coupon_code,
        payment_method=data['payment_method'],
        payment_id=data.get('payment_id', ''),
        payment_status='paid' if data['payment_method'] != 'cod' else 'pending',
        notes=data.get('notes', ''),
    )

    # Create order items
    for item in cart_items:
        img = item.product.images.filter(is_primary=True).first() or item.product.images.first()
        OrderItem.objects.create(
            order=order,
            product=item.product,
            product_name=item.product.name,
            product_image=img.image.url if img else '',
            quantity=item.quantity,
            unit_price=item.product.discounted_price,
            total_price=item.subtotal,
            variant_info=f"{item.variant.name}: {item.variant.value}" if item.variant else '',
        )

    # Add initial tracking
    OrderTracking.objects.create(
        order=order, status='Order Placed',
        message='Your order has been placed successfully!'
    )

    # Clear cart
    cart_items.delete()

    # Send confirmation email
    try:
        send_mail(
            f'NovaCart AI - Order Confirmed #{order.order_id}',
            f'Hi {request.user.first_name},\n\nYour order #{order.order_id} has been placed.\nTotal: Rs.{order.total_amount}\n\nThank you for shopping with NovaCart AI!',
            django_settings.DEFAULT_FROM_EMAIL,
            [request.user.email],
            fail_silently=True,
        )
    except Exception:
        pass

    return Response(OrderSerializer(order).data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    try:
        order = Order.objects.get(order_id=order_id, user=request.user)
        if order.status not in ['pending', 'confirmed']:
            return Response({'error': 'Order cannot be cancelled at this stage.'}, status=400)
        order.status = 'cancelled'
        order.save()
        OrderTracking.objects.create(
            order=order, status='Cancelled',
            message='Order cancelled by customer.'
        )
        return Response({'message': 'Order cancelled successfully.'})
    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice(request, order_id):
    from django.http import HttpResponse
    try:
        order = Order.objects.get(order_id=order_id, user=request.user)
        pdf_data = generate_invoice_pdf(order)
        if pdf_data:
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="invoice_{order_id}.pdf"'
            return response
        return Response({'error': 'PDF generation failed.'}, status=500)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=404)
