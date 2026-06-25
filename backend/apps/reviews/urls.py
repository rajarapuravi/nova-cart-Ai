from django.urls import path
from .views import ProductReviewListView, CreateReviewView, ReviewDetailView

urlpatterns = [
    path('', CreateReviewView.as_view(), name='create_review'),
    path('<int:pk>/', ReviewDetailView.as_view(), name='review_detail'),
    path('product/<slug:slug>/', ProductReviewListView.as_view(), name='product_reviews'),
]
