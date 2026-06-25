from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, Brand, Product, FlashDeal
from .serializers import (
    CategorySerializer, BrandSerializer,
    ProductListSerializer, ProductDetailSerializer, FlashDealSerializer
)


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Category.objects.filter(is_active=True, parent=None)


class BrandListView(generics.ListAPIView):
    serializer_class = BrandSerializer
    permission_classes = [AllowAny]
    queryset = Brand.objects.filter(is_active=True)


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'brand__slug', 'is_featured', 'is_trending',
                        'is_new_arrival', 'is_best_seller']
    search_fields = ['name', 'description', 'tags', 'brand__name', 'category__name']
    ordering_fields = ['price', 'average_rating', 'created_at', 'views_count']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True)
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        category_slug = self.request.query_params.get('category')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        if category_slug:
            qs = qs.filter(
                Q(category__slug=category_slug) |
                Q(category__parent__slug=category_slug)
            )
        return qs


class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Product.objects.filter(is_active=True)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class FlashDealListView(generics.ListAPIView):
    serializer_class = FlashDealSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        from django.utils import timezone
        now = timezone.now()
        return FlashDeal.objects.filter(is_active=True, start_time__lte=now, end_time__gte=now)


@api_view(['GET'])
@permission_classes([AllowAny])
def home_data(request):
    """Returns all home page data in one call."""
    from django.utils import timezone
    now = timezone.now()
    ctx = {'request': request}
    trending = Product.objects.filter(is_active=True, is_trending=True)[:8]
    new_arrivals = Product.objects.filter(is_active=True, is_new_arrival=True)[:8]
    best_sellers = Product.objects.filter(is_active=True, is_best_seller=True)[:8]
    featured = Product.objects.filter(is_active=True, is_featured=True)[:8]
    flash_deals = FlashDeal.objects.filter(is_active=True, start_time__lte=now, end_time__gte=now)[:4]
    categories = Category.objects.filter(is_active=True, parent=None)[:10]
    return Response({
        'trending': ProductListSerializer(trending, many=True, context=ctx).data,
        'new_arrivals': ProductListSerializer(new_arrivals, many=True, context=ctx).data,
        'best_sellers': ProductListSerializer(best_sellers, many=True, context=ctx).data,
        'featured': ProductListSerializer(featured, many=True, context=ctx).data,
        'flash_deals': FlashDealSerializer(flash_deals, many=True, context=ctx).data,
        'categories': CategorySerializer(categories, many=True, context=ctx).data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def related_products(request, slug):
    try:
        product = Product.objects.get(slug=slug, is_active=True)
        related = Product.objects.filter(
            category=product.category, is_active=True
        ).exclude(id=product.id)[:8]
        return Response(ProductListSerializer(related, many=True, context={'request': request}).data)
    except Product.DoesNotExist:
        return Response([], status=200)
