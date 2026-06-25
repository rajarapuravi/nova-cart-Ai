from django.db import models
from django.conf import settings


class Payment(models.Model):
    STATUS = [('pending','Pending'),('success','Success'),('failed','Failed'),('refunded','Refunded')]
    METHOD = [
        ('upi','UPI'),('card','Card'),('netbanking','Net Banking'),
        ('cod','Cash on Delivery'),('wallet','Wallet'),
        ('google_pay','Google Pay'),('phonepe','PhonePe'),
        ('paytm','Paytm'),('amazon_pay','Amazon Pay'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='payment_detail', null=True, blank=True)
    payment_id = models.CharField(max_length=100, unique=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD)
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    qr_code = models.TextField(blank=True)  # base64 QR
    gateway_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.payment_id} - {self.status}"
