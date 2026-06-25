from django.db import models
from django.conf import settings


class AdminUser(models.Model):
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('product_manager', 'Product Manager'),
        ('order_manager', 'Order Manager'),
        ('customer_manager', 'Customer Manager'),
    ]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='admin_profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='product_manager')
    is_admin = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        pass

    def __str__(self):
        return f"{self.user.email} - {self.role}"
