from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, ProductVariant, FlashDeal


class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'image', 'description', 'subcategories', 'is_active']

    def get_subcategories(self, obj):
        subs = obj.subcategories.filter(is_active=True)
        return CategorySerializer(subs, many=True, context=self.context).data


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'value', 'price_modifier', 'stock']


# Curated placeholder images per category keyword
CATEGORY_IMAGES = {
    'mobile':   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    'phone':    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    'laptop':   'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
    'tablet':   'https://images.unsplash.com/photo-1542751110-97427bbecfd1?w=400&q=80',
    'watch':    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    'camera':   'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
    'headphone':'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    'speaker':  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80',
    'fashion':  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
    'men':      'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&q=80',
    'women':    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
    'kids':     'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&q=80',
    'beauty':   'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
    'makeup':   'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
    'skin':     'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
    'home':     'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    'kitchen':  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
    'furniture':'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    'sport':    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
    'fitness':  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
    'book':     'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    'toy':      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&q=80',
    'shoe':     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    'bag':      'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&q=80',
    'trimmer':  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80',
    'earphone': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
    'default':  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
}


def get_placeholder_image(product):
    """Return a relevant Unsplash image based on product name/category."""
    name_lower = (product.name + ' ' + (product.category.name if product.category else '')).lower()
    for keyword, url in CATEGORY_IMAGES.items():
        if keyword in name_lower:
            return url
    return CATEGORY_IMAGES['default']


class ProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    discounted_price = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'brand_name', 'category_name', 'price',
                  'discount_percent', 'discounted_price', 'primary_image',
                  'average_rating', 'review_count', 'is_featured',
                  'is_trending', 'is_new_arrival', 'is_best_seller', 'stock']

    def get_primary_image(self, obj):
        # Try actual uploaded image first
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img and img.image:
            request = self.context.get('request')
            if request:
                try:
                    return request.build_absolute_uri(img.image.url)
                except Exception:
                    pass
        # Fall back to category-matched placeholder
        return get_placeholder_image(obj)


class ProductDetailSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    variants = ProductVariantSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    discounted_price = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_images(self, obj):
        uploaded = obj.images.all()
        request = self.context.get('request')
        if uploaded.exists():
            result = []
            for img in uploaded:
                url = None
                if request:
                    try:
                        url = request.build_absolute_uri(img.image.url)
                    except Exception:
                        pass
                result.append({'id': img.id, 'image': url, 'alt_text': img.alt_text,
                                'is_primary': img.is_primary, 'order': img.order})
            return result
        # Return placeholder as a single image entry
        return [{'id': 0, 'image': get_placeholder_image(obj),
                 'alt_text': obj.name, 'is_primary': True, 'order': 0}]


class FlashDealSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = FlashDeal
        fields = '__all__'
