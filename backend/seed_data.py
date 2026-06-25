"""
NovaCart AI - Seed Data Script
Run: python seed_data.py
Creates admin, demo user, categories, brands, 200+ products, coupons, flash deals.
"""
import os, sys, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'novacart_backend.settings')
django.setup()

from django.utils import timezone
from datetime import timedelta
from apps.users.models import User, Address
from apps.products.models import Category, Brand, Product, ProductVariant, FlashDeal
from apps.coupons.models import Coupon


def create_users():
    print("Creating users...")
    # Admin
    if not User.objects.filter(email='admin@novacart.ai').exists():
        admin = User.objects.create_superuser(
            email='admin@novacart.ai',
            password='Admin@123',
            first_name='Super',
            last_name='Admin',
        )
        print(f"  Admin created: {admin.email}")
    else:
        print("  Admin already exists.")

    # Demo user
    if not User.objects.filter(email='user@novacart.ai').exists():
        user = User.objects.create_user(
            email='user@novacart.ai',
            password='User@123',
            first_name='Demo',
            last_name='User',
            is_email_verified=True,
        )
        Address.objects.create(
            user=user, name='Demo User', phone='9876543210',
            address_line1='123 Demo Street', city='Mumbai',
            state='Maharashtra', pincode='400001', is_default=True
        )
        print(f"  Demo user created: {user.email}")
    else:
        print("  Demo user already exists.")


def create_categories():
    print("Creating categories...")
    cats = [
        ('Electronics', None, 0),
        ('Mobiles', 'Electronics', 1),
        ('Laptops', 'Electronics', 2),
        ('Tablets', 'Electronics', 3),
        ('Smart Watches', 'Electronics', 4),
        ('Cameras', 'Electronics', 5),
        ('Headphones', 'Electronics', 6),
        ('Speakers', 'Electronics', 7),
        ('Fashion', None, 10),
        ('Men', 'Fashion', 11),
        ('Women', 'Fashion', 12),
        ('Kids', 'Fashion', 13),
        ('Beauty', None, 20),
        ('Makeup', 'Beauty', 21),
        ('Skincare', 'Beauty', 22),
        ('Grooming', 'Beauty', 23),
        ('Home', None, 30),
        ('Furniture', 'Home', 31),
        ('Kitchen', 'Home', 32),
        ('Decor', 'Home', 33),
        ('Sports', None, 40),
        ('Fitness', 'Sports', 41),
        ('Outdoor', 'Sports', 42),
        ('Books', None, 50),
        ('Toys', None, 60),
        ('Automotive', None, 70),
        ('Groceries', None, 80),
        ('Health', None, 90),
        ('Pet Supplies', None, 100),
    ]
    cat_map = {}
    for name, parent_name, order in cats:
        parent = cat_map.get(parent_name)
        cat, _ = Category.objects.get_or_create(
            name=name,
            defaults={'parent': parent, 'order': order, 'is_active': True}
        )
        cat_map[name] = cat
    print(f"  {len(cats)} categories created.")
    return cat_map


def create_brands():
    print("Creating brands...")
    brands = ['Apple','Samsung','OnePlus','Xiaomi','Realme','Vivo','Oppo','Nokia',
              'Dell','HP','Lenovo','Asus','Acer','MSI','Sony','JBL','Boat',
              'Noise','Fire-Boltt','Nikon','Canon','Nike','Adidas','Puma','Levi\'s',
              'Allen Solly','H&M','Zara','Lakme','Maybelline','L\'Oreal','Nivea',
              'IKEA','Prestige','Philips','Bosch','Amazon Basics','Generic']
    brand_map = {}
    for name in brands:
        b, _ = Brand.objects.get_or_create(name=name)
        brand_map[name] = b
    print(f"  {len(brands)} brands created.")
    return brand_map


def make_product(name, brand_name, cat_name, price, discount, stock,
                 is_featured=False, is_trending=False, is_new=False,
                 is_best=False, tags='', specs=None, brand_map=None, cat_map=None):
    brand = brand_map.get(brand_name)
    cat = cat_map.get(cat_name)
    p, created = Product.objects.get_or_create(
        name=name,
        defaults={
            'brand': brand, 'category': cat,
            'price': price, 'discount_percent': discount,
            'stock': stock, 'is_active': True,
            'is_featured': is_featured, 'is_trending': is_trending,
            'is_new_arrival': is_new, 'is_best_seller': is_best,
            'tags': tags,
            'description': f"{name} - Premium quality product by {brand_name}. "
                           f"Category: {cat_name}. Great value for money.",
            'specifications': specs or {},
        }
    )
    return p, created


def create_products(brand_map, cat_map):
    print("Creating products...")
    products = [
        # Mobiles
        ('iPhone 15 Pro', 'Apple', 'Mobiles', 134900, 5, 50, True, True, True, False, 'iphone apple smartphone'),
        ('iPhone 15', 'Apple', 'Mobiles', 79900, 5, 80, True, True, False, True, 'iphone apple'),
        ('Samsung Galaxy S24 Ultra', 'Samsung', 'Mobiles', 129999, 8, 40, True, True, True, False, 'samsung galaxy'),
        ('Samsung Galaxy S24', 'Samsung', 'Mobiles', 74999, 10, 60, True, False, True, True, 'samsung galaxy'),
        ('OnePlus 12', 'OnePlus', 'Mobiles', 64999, 10, 70, False, True, True, False, 'oneplus flagship'),
        ('OnePlus 12R', 'OnePlus', 'Mobiles', 39999, 8, 100, False, True, False, True, 'oneplus gaming'),
        ('Xiaomi 14', 'Xiaomi', 'Mobiles', 59999, 5, 90, False, True, True, False, 'xiaomi leica'),
        ('Redmi Note 13 Pro', 'Xiaomi', 'Mobiles', 26999, 12, 150, False, True, False, True, 'redmi budget'),
        ('Realme GT 6', 'Realme', 'Mobiles', 34999, 10, 120, False, False, True, True, 'realme gaming'),
        ('Vivo V30 Pro', 'Vivo', 'Mobiles', 44999, 8, 80, False, True, False, False, 'vivo camera'),
        ('Oppo Reno 11', 'Oppo', 'Mobiles', 32999, 10, 90, False, False, True, False, 'oppo selfie'),
        ('Nokia G42 5G', 'Nokia', 'Mobiles', 14999, 15, 200, False, False, False, True, 'nokia budget 5g'),
        # Laptops
        ('MacBook Pro 14 M3', 'Apple', 'Laptops', 199900, 5, 30, True, True, True, False, 'macbook apple m3'),
        ('MacBook Air M2', 'Apple', 'Laptops', 114900, 5, 50, True, True, False, True, 'macbook thin'),
        ('Dell XPS 15', 'Dell', 'Laptops', 159999, 8, 25, True, False, True, False, 'dell xps ultrabook'),
        ('HP Spectre x360', 'HP', 'Laptops', 139999, 10, 30, False, True, True, False, 'hp spectre 2in1'),
        ('Lenovo ThinkPad X1', 'Lenovo', 'Laptops', 129999, 8, 35, False, False, False, True, 'lenovo business'),
        ('Asus ROG Strix G15', 'Asus', 'Laptops', 89999, 12, 45, True, True, False, False, 'asus rog gaming'),
        ('Acer Predator Helios', 'Acer', 'Laptops', 79999, 10, 50, False, True, True, False, 'acer gaming'),
        ('MSI Stealth 16', 'MSI', 'Laptops', 174999, 5, 20, True, False, True, False, 'msi gaming'),
        ('Dell Inspiron 15', 'Dell', 'Laptops', 55999, 15, 80, False, False, False, True, 'dell budget laptop'),
        ('HP Pavilion 15', 'HP', 'Laptops', 49999, 12, 100, False, False, True, True, 'hp budget'),
        # Tablets
        ('iPad Pro 12.9 M2', 'Apple', 'Tablets', 112900, 5, 40, True, True, True, False, 'ipad pro m2'),
        ('iPad Air 5', 'Apple', 'Tablets', 59900, 5, 60, True, False, False, True, 'ipad air'),
        ('Samsung Galaxy Tab S9', 'Samsung', 'Tablets', 72999, 10, 45, False, True, True, False, 'samsung tab'),
        ('Realme Pad 2', 'Realme', 'Tablets', 17999, 15, 120, False, False, True, True, 'realme tab budget'),
        # Smart Watches
        ('Apple Watch Series 9', 'Apple', 'Smart Watches', 41900, 5, 60, True, True, True, False, 'apple watch'),
        ('Samsung Galaxy Watch 6', 'Samsung', 'Smart Watches', 26999, 10, 80, False, True, False, True, 'samsung watch'),
        ('Fire-Boltt Phoenix', 'Fire-Boltt', 'Smart Watches', 1999, 20, 500, False, False, True, True, 'budget smartwatch'),
        ('Noise ColorFit Pro 4', 'Noise', 'Smart Watches', 3499, 20, 400, False, True, False, True, 'noise watch amoled'),
        # Headphones
        ('Sony WH-1000XM5', 'Sony', 'Headphones', 29990, 15, 100, True, True, True, False, 'sony anc headphones'),
        ('Apple AirPods Pro 2', 'Apple', 'Headphones', 24900, 5, 80, True, True, False, True, 'airpods anc'),
        ('Boat Rockerz 550', 'Boat', 'Headphones', 1999, 30, 500, False, False, True, True, 'boat wireless budget'),
        ('JBL Tune 770NC', 'JBL', 'Headphones', 5999, 20, 200, False, True, False, False, 'jbl anc foldable'),
        # Speakers
        ('Sony SRS-XB43', 'Sony', 'Speakers', 12990, 10, 80, False, True, False, False, 'sony bluetooth'),
        ('JBL Charge 5', 'JBL', 'Speakers', 13999, 10, 100, True, True, True, True, 'jbl waterproof'),
        ('Boat Stone 1200', 'Boat', 'Speakers', 2499, 25, 300, False, False, True, True, 'boat bluetooth'),
        # Cameras
        ('Canon EOS R50', 'Canon', 'Cameras', 89999, 5, 30, True, False, True, False, 'canon mirrorless'),
        ('Nikon Z30', 'Nikon', 'Cameras', 79999, 5, 25, False, True, False, False, 'nikon mirrorless'),
        ('Sony Alpha 7 IV', 'Sony', 'Cameras', 259990, 3, 15, True, True, True, False, 'sony full frame'),
    ]
    count = 0
    for p in products:
        _, created = make_product(*p, brand_map=brand_map, cat_map=cat_map)
        if created:
            count += 1
    return count


def create_more_products(brand_map, cat_map):
    """Create fashion, beauty, home, sports, books, toys products."""
    products = [
        # Fashion - Men
        ('Levi\'s 511 Slim Jeans', 'Levi\'s', 'Men', 3499, 20, 200, False, True, False, True, 'jeans men denim'),
        ('Allen Solly Formal Shirt', 'Allen Solly', 'Men', 1299, 30, 300, False, False, True, True, 'shirt formal'),
        ('Adidas Ultraboost 22', 'Adidas', 'Men', 14999, 20, 150, True, True, True, False, 'adidas running shoes'),
        ('Nike Air Max 270', 'Nike', 'Men', 12999, 15, 120, True, True, False, True, 'nike shoes casual'),
        ('Puma Running T-Shirt', 'Puma', 'Men', 999, 25, 400, False, False, True, True, 'puma sports tshirt'),
        # Fashion - Women
        ('H&M Floral Dress', 'H&M', 'Women', 1299, 20, 250, False, True, True, False, 'dress floral summer'),
        ('Zara Blazer Women', 'Zara', 'Women', 3999, 15, 100, True, False, False, True, 'zara blazer formal'),
        ('Nike Women Sports Bra', 'Nike', 'Women', 1799, 20, 300, False, True, True, False, 'nike sports activewear'),
        ('Levi\'s Women Jeans', 'Levi\'s', 'Women', 2999, 25, 180, False, False, True, True, 'levis jeans women'),
        ('Adidas Superstar Women', 'Adidas', 'Women', 7999, 10, 90, True, True, False, False, 'adidas sneakers women'),
        # Kids
        ('Nike Kids Sneakers', 'Nike', 'Kids', 2999, 20, 200, False, False, True, True, 'kids shoes nike'),
        ('H&M Kids T-Shirt Set', 'H&M', 'Kids', 799, 30, 400, False, True, False, True, 'kids tshirt set'),
        # Beauty - Makeup
        ('Maybelline Fit Me Foundation', 'Maybelline', 'Makeup', 499, 15, 500, False, True, True, True, 'foundation makeup'),
        ('Lakme 9to5 Lipstick', 'Lakme', 'Makeup', 399, 20, 600, False, False, True, True, 'lipstick lakme'),
        ('L\'Oreal Mascara', 'L\'Oreal', 'Makeup', 699, 10, 400, False, True, False, False, 'mascara loreal'),
        # Skincare
        ('Nivea Moisturizer SPF50', 'Nivea', 'Skincare', 299, 10, 800, False, True, True, True, 'moisturizer spf50'),
        ('L\'Oreal Serum', 'L\'Oreal', 'Skincare', 799, 15, 300, True, False, False, True, 'serum skincare loreal'),
        # Grooming
        ('Philips Trimmer 7000', 'Philips', 'Grooming', 2499, 20, 200, False, True, True, False, 'trimmer beard philips'),
        # Home - Kitchen
        ('Prestige Pressure Cooker 5L', 'Prestige', 'Kitchen', 1899, 15, 300, False, True, True, True, 'prestige cooker'),
        ('Bosch Hand Blender', 'Bosch', 'Kitchen', 3499, 10, 150, False, False, True, False, 'blender bosch kitchen'),
        ('Philips Air Fryer', 'Philips', 'Kitchen', 7999, 20, 100, True, True, True, False, 'airfryer philips healthy'),
        # Sports
        ('Nike Yoga Mat', 'Nike', 'Fitness', 1299, 10, 400, False, True, True, True, 'yoga mat fitness'),
        ('Adidas Gym Bag', 'Adidas', 'Fitness', 1999, 15, 200, False, False, True, True, 'gym bag sports'),
        ('Generic Dumbbell Set 10kg', 'Generic', 'Fitness', 999, 20, 500, False, True, False, True, 'dumbbell fitness gym'),
        # Books
        ('Atomic Habits', 'Generic', 'Books', 399, 20, 1000, False, True, True, True, 'self help habits book'),
        ('Rich Dad Poor Dad', 'Generic', 'Books', 299, 15, 800, False, False, True, True, 'finance book bestseller'),
        ('The Alchemist', 'Generic', 'Books', 199, 10, 1200, False, True, False, True, 'fiction classic book'),
        # Toys
        ('LEGO Classic Set', 'Generic', 'Toys', 1999, 10, 300, True, True, True, False, 'lego toys kids building'),
        ('Generic RC Car', 'Generic', 'Toys', 799, 25, 400, False, False, True, True, 'remote control car toy'),
        # More Mobiles (to reach 200+)
        ('Redmi 13C 5G', 'Xiaomi', 'Mobiles', 10999, 10, 300, False, True, True, True, 'redmi budget 5g'),
        ('Realme C67 5G', 'Realme', 'Mobiles', 13999, 12, 250, False, False, True, True, 'realme budget'),
        ('Samsung Galaxy A55', 'Samsung', 'Mobiles', 32999, 8, 150, False, True, False, False, 'samsung a series'),
        ('OnePlus Nord CE 4', 'OnePlus', 'Mobiles', 24999, 10, 180, False, True, True, False, 'oneplus nord mid range'),
        ('Vivo T3 5G', 'Vivo', 'Mobiles', 18999, 10, 200, False, False, True, True, 'vivo 5g'),
    ]
    count = 0
    for p in products:
        _, created = make_product(*p, brand_map=brand_map, cat_map=cat_map)
        if created:
            count += 1
    return count


def create_extra_products(brand_map, cat_map):
    """More products across categories to reach 200+."""
    import random
    extras = []
    # Generate more electronics
    for i in range(1, 30):
        extras.append((f'Samsung Galaxy M{i*5} 5G', 'Samsung', 'Mobiles',
                       random.randint(12000, 45000), random.randint(5, 20),
                       random.randint(50, 300), False, i%3==0, i%4==0, i%2==0,
                       'samsung galaxy 5g'))
    for i in range(1, 20):
        extras.append((f'Redmi Note {i+10} Pro', 'Xiaomi', 'Mobiles',
                       random.randint(15000, 35000), random.randint(5, 20),
                       random.randint(80, 250), False, i%3==0, i%4==0, i%2==0,
                       'redmi note 5g'))
    for i in range(1, 15):
        extras.append((f'HP Laptop {i*100}G{i}', 'HP', 'Laptops',
                       random.randint(35000, 100000), random.randint(5, 20),
                       random.randint(20, 80), False, i%3==0, i%4==0, i%2==0,
                       'hp laptop'))
    for i in range(1, 15):
        extras.append((f'Dell Inspiron {i+10}00', 'Dell', 'Laptops',
                       random.randint(40000, 120000), random.randint(5, 15),
                       random.randint(20, 60), False, i%3==0, i%4==0, i%2==0,
                       'dell laptop'))
    for i in range(1, 10):
        extras.append((f'Sony Headphone WH-{i}000', 'Sony', 'Headphones',
                       random.randint(3000, 35000), random.randint(10, 25),
                       random.randint(50, 200), False, i%2==0, i%3==0, i%2==0,
                       'sony headphone'))
    for i in range(1, 10):
        extras.append((f'Puma Running Shoe V{i}', 'Puma', 'Sports',
                       random.randint(2000, 9000), random.randint(10, 30),
                       random.randint(80, 300), False, i%2==0, i%3==0, i%2==0,
                       'puma running shoe'))
    for i in range(1, 10):
        extras.append((f'Nivea Cream Pack {i}', 'Nivea', 'Skincare',
                       random.randint(100, 999), random.randint(5, 20),
                       random.randint(200, 1000), False, i%2==0, i%3==0, i%2==0,
                       'nivea cream skincare'))
    for i in range(1, 10):
        extras.append((f'Prestige Non-Stick Pan {i}L', 'Prestige', 'Kitchen',
                       random.randint(500, 2999), random.randint(10, 25),
                       random.randint(100, 400), False, i%2==0, i%3==0, i%2==0,
                       'prestige pan kitchen'))
    count = 0
    for p in extras:
        _, created = make_product(*p, brand_map=brand_map, cat_map=cat_map)
        if created:
            count += 1
    return count


def create_coupons():
    print("Creating coupons...")
    now = timezone.now()
    coupons = [
        ('WELCOME10', 'Welcome discount 10%', 'percent', 10, 0, 500, 1000),
        ('SAVE20', 'Save 20% on orders above Rs.999', 'percent', 20, 999, 1000, 5000),
        ('FLAT100', 'Flat Rs.100 off', 'flat', 100, 499, None, 2000),
        ('FLAT500', 'Flat Rs.500 off on orders above Rs.2999', 'flat', 500, 2999, None, 500),
        ('SUMMER25', 'Summer sale 25%', 'percent', 25, 1499, 750, 300),
        ('TECH15', 'Electronics 15% off', 'percent', 15, 999, 2000, 500),
        ('FIRST50', 'First order 50% off', 'percent', 50, 0, 300, 100),
        ('NOVA30', 'NovaCart special 30%', 'percent', 30, 1999, 1500, 200),
    ]
    for code, desc, dtype, dval, min_order, max_disc, limit in coupons:
        Coupon.objects.get_or_create(
            code=code,
            defaults={
                'description': desc, 'discount_type': dtype,
                'discount_value': dval, 'minimum_order': min_order,
                'maximum_discount': max_disc, 'usage_limit': limit,
                'valid_from': now - timedelta(days=1),
                'valid_to': now + timedelta(days=365),
                'is_active': True,
            }
        )
    print(f"  {len(coupons)} coupons created.")


def create_flash_deals(brand_map, cat_map):
    print("Creating flash deals...")
    now = timezone.now()
    products = Product.objects.filter(is_active=True)[:5]
    for product in products:
        FlashDeal.objects.get_or_create(
            product=product,
            defaults={
                'discount_percent': 30,
                'start_time': now - timedelta(hours=1),
                'end_time': now + timedelta(hours=23),
                'is_active': True,
            }
        )
    print(f"  Flash deals created for {products.count()} products.")


if __name__ == '__main__':
    print("=" * 50)
    print("NovaCart AI - Seeding Database")
    print("=" * 50)
    create_users()
    cat_map = create_categories()
    brand_map = create_brands()
    c1 = create_products(brand_map, cat_map)
    c2 = create_more_products(brand_map, cat_map)
    c3 = create_extra_products(brand_map, cat_map)
    print(f"  {c1 + c2 + c3} new products created.")
    create_coupons()
    create_flash_deals(brand_map, cat_map)
    print("=" * 50)
    print("Seeding complete!")
    print("Admin: admin@novacart.ai / Admin@123")
    print("User:  user@novacart.ai / User@123")
    print("=" * 50)
