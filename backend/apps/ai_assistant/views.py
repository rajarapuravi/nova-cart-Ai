import uuid
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import AIConversation, AIMessage
from .providers import get_ai_provider, CUSTOMER_SYSTEM_PROMPT, ADMIN_SYSTEM_PROMPT
from apps.products.models import Product


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def customer_chat(request):
    """Customer AI shopping assistant."""
    message    = (request.data.get('message') or '').strip()
    session_id = request.data.get('session_id') or str(uuid.uuid4())

    if not message:
        return Response({'error': 'Message is required.'}, status=400)

    provider_name = request.user.ai_provider or 'gemini'
    provider      = get_ai_provider(provider_name)

    # Get/create conversation
    conversation, _ = AIConversation.objects.get_or_create(
        user=request.user,
        session_id=session_id,
        defaults={'provider': provider_name, 'role': 'customer'}
    )

    # Build history (last 10 msgs to keep context manageable)
    prev = AIMessage.objects.filter(conversation=conversation).order_by('timestamp')[:20]
    history = [
        {'role': m.sender if m.sender == 'user' else 'assistant', 'content': m.content}
        for m in prev
    ]
    history.append({'role': 'user', 'content': message})

    # Get AI response
    response_text = provider.chat(history, system_prompt=CUSTOMER_SYSTEM_PROMPT)

    # Product search for shopping-intent messages
    products_data = []
    search_kws = ['find','show','search','recommend','suggest','need','want','buy',
                  'looking','phone','laptop','tablet','headphone','watch','camera']
    if any(kw in message.lower() for kw in search_kws):
        from django.db.models import Q
        words = [w for w in message.split()
                 if len(w) > 3 and w.lower() not in
                 ('find','show','need','want','good','best','under','above','with','from','that','this','please','some')]
        if words:
            q = Q()
            for w in words[:4]:
                q |= Q(name__icontains=w) | Q(tags__icontains=w) | Q(category__name__icontains=w) | Q(brand__name__icontains=w)
            prods = Product.objects.filter(q, is_active=True)[:5]
            if prods.exists():
                from apps.products.serializers import ProductListSerializer
                products_data = ProductListSerializer(prods, many=True, context={'request': request}).data

    # Save exchange
    AIMessage.objects.create(conversation=conversation, sender='user',      content=message)
    AIMessage.objects.create(conversation=conversation, sender='assistant',  content=response_text)

    return Response({
        'message':    response_text,
        'session_id': session_id,
        'provider':   provider_name,
        'products':   list(products_data),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_chat(request):
    """Admin-only AI assistant."""
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'Admin access required.'}, status=403)

    message    = (request.data.get('message') or '').strip()
    session_id = request.data.get('session_id') or str(uuid.uuid4())
    provider_name = request.data.get('provider') or 'gemini'

    if not message:
        return Response({'error': 'Message is required.'}, status=400)

    provider = get_ai_provider(provider_name)

    conversation, _ = AIConversation.objects.get_or_create(
        user=request.user,
        session_id=session_id,
        defaults={'provider': provider_name, 'role': 'admin'}
    )

    prev = AIMessage.objects.filter(conversation=conversation).order_by('timestamp')[:20]
    history = [
        {'role': m.sender if m.sender == 'user' else 'assistant', 'content': m.content}
        for m in prev
    ]
    history.append({'role': 'user', 'content': message})

    response_text = provider.chat(history, system_prompt=ADMIN_SYSTEM_PROMPT)

    AIMessage.objects.create(conversation=conversation, sender='user',     content=message)
    AIMessage.objects.create(conversation=conversation, sender='assistant', content=response_text)

    return Response({
        'message':    response_text,
        'session_id': session_id,
        'provider':   provider_name,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_history(request):
    convs = AIConversation.objects.filter(user=request.user, role='customer').order_by('-created_at')[:20]
    data = []
    for conv in convs:
        msgs = AIMessage.objects.filter(conversation=conv).order_by('timestamp')
        data.append({
            'session_id': conv.session_id,
            'provider':   conv.provider,
            'created_at': conv.created_at,
            'messages': [
                {'sender': m.sender, 'content': m.content, 'timestamp': m.timestamp}
                for m in msgs
            ]
        })
    return Response(data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_chat_history(request):
    AIConversation.objects.filter(user=request.user).delete()
    return Response({'message': 'Chat history deleted.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_providers(request):
    from django.conf import settings
    gemini_configured = bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith('your-'))
    openai_configured = bool(settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith('your-'))

    return Response({
        'providers': [
            {'id': 'gemini',   'name': 'Gemini (Google)',   'available': True,  'configured': gemini_configured},
            {'id': 'openai',   'name': 'ChatGPT (OpenAI)',  'available': True,  'configured': openai_configured},
            {'id': 'claude',   'name': 'Claude (Anthropic)','available': False, 'coming_soon': True},
            {'id': 'deepseek', 'name': 'DeepSeek',          'available': False, 'coming_soon': True},
        ],
        'current': request.user.ai_provider,
        'note': 'AI works with demo responses when API keys are not configured.'
    })
