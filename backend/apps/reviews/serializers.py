from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'user_email', 'product', 'rating', 'title',
                  'comment', 'is_verified_purchase', 'helpful_count', 'created_at']
        read_only_fields = ['user', 'is_verified_purchase', 'helpful_count', 'created_at']
