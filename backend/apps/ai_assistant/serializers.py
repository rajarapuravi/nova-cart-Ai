from rest_framework import serializers
from .models import AIConversation, AIMessage


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = ['id', 'sender', 'content', 'timestamp']


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = AIConversation
        fields = ['id', 'session_id', 'provider', 'role', 'created_at', 'messages']
