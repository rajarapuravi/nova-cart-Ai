from django.db import models
from django.conf import settings


class AIConversation(models.Model):
    ROLE_CHOICES = [('customer', 'Customer'), ('admin', 'Admin')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_conversations')
    session_id = models.CharField(max_length=100, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')
    provider = models.CharField(max_length=20, default='gemini')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.provider} - {self.created_at}"


class AIMessage(models.Model):
    SENDER_CHOICES = [('user', 'User'), ('assistant', 'Assistant')]

    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender}: {self.content[:50]}"
