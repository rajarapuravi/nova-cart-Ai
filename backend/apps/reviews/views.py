from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer
from apps.orders.models import Order, OrderItem


class ProductReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Review.objects.filter(product__slug=self.kwargs['slug'])


class CreateReviewView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        product_id = serializer.validated_data['product'].id
        # Check if verified purchase
        is_verified = OrderItem.objects.filter(
            order__user=self.request.user,
            order__status='delivered',
            product_id=product_id
        ).exists()
        serializer.save(user=self.request.user, is_verified_purchase=is_verified)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)
