from django.urls import path
from .views import customer_chat, admin_chat, get_chat_history, delete_chat_history, get_providers

urlpatterns = [
    path('chat/', customer_chat, name='customer_chat'),
    path('admin-chat/', admin_chat, name='admin_chat'),
    path('history/', get_chat_history, name='chat_history'),
    path('history/delete/', delete_chat_history, name='delete_history'),
    path('providers/', get_providers, name='ai_providers'),
]
