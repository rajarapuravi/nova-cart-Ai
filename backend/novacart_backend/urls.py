from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def health(request):
    return JsonResponse({
        'status': 'ok',
        'service': 'NovaCart AI Backend',
        'version': '1.0.0',
        'docs': '/api/products/home/'
    })


urlpatterns = [
    path('', health, name='health'),
    path('health/', health, name='health2'),
    path('django-admin/', admin.site.urls),

    # Customer APIs
    path('api/auth/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/wishlist/', include('apps.wishlist.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/coupons/', include('apps.coupons.urls')),
    path('api/ai/', include('apps.ai_assistant.urls')),

    # Admin APIs
    path('api/admin-panel/', include('apps.admin_panel.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
