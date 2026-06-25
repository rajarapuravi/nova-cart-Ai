from django.urls import path
from .views import sales_analytics, revenue_chart

urlpatterns = [
    path('sales/', sales_analytics, name='sales_analytics'),
    path('revenue/', revenue_chart, name='revenue_chart'),
]
