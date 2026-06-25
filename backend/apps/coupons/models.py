from django.db import models
import decimal


class Coupon(models.Model):
    TYPE_CHOICES = [('percent', 'Percentage'), ('flat', 'Flat Amount')]

    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=200, blank=True)
    discount_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='percent')
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    minimum_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    maximum_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    usage_limit = models.IntegerField(default=100)
    used_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        pass

    def is_valid(self, order_amount):
        from django.utils import timezone
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_to and
            self.used_count < self.usage_limit and
            order_amount >= self.minimum_order
        )

    def get_discount(self, order_amount):
        if self.discount_type == 'percent':
            discount = order_amount * self.discount_value / 100
            if self.maximum_discount:
                discount = min(discount, self.maximum_discount)
            return discount
        return min(self.discount_value, order_amount)

    def __str__(self):
        return self.code
