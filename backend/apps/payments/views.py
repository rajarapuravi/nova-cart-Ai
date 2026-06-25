from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import uuid, base64


def generate_qr_code(upi_id, amount, name="NovaCart AI"):
    """Generate QR as base64 using a simple UPI deep link."""
    try:
        import qrcode
        import io
        upi_url = f"upi://pay?pa={upi_id}&pn={name}&am={amount}&cu=INR"
        qr = qrcode.make(upi_url)
        buf = io.BytesIO()
        qr.save(buf, format='PNG')
        return base64.b64encode(buf.getvalue()).decode()
    except ImportError:
        # Return a placeholder if qrcode not installed
        return ""


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    method = request.data.get('method', 'upi')
    amount = request.data.get('amount', 0)
    payment_id = 'PAY' + uuid.uuid4().hex[:10].upper()

    response_data = {
        'payment_id': payment_id,
        'method': method,
        'amount': amount,
        'status': 'pending',
    }

    # Generate QR for UPI methods
    if method in ['upi', 'google_pay', 'phonepe', 'paytm', 'amazon_pay']:
        qr = generate_qr_code('novacart@upi', amount)
        response_data['qr_code'] = qr
        response_data['upi_id'] = 'novacart@upi'

    return Response(response_data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    payment_id = request.data.get('payment_id')
    # In production, verify with payment gateway
    # For demo, auto-mark as success
    return Response({
        'payment_id': payment_id,
        'status': 'success',
        'message': 'Payment verified successfully.'
    })
