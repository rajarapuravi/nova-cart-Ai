"""
NovaCart AI Provider Layer
Supports: Google Gemini (google-genai SDK), OpenAI ChatGPT
Future-ready: Claude, DeepSeek, Grok
Falls back to smart rule-based responses when no API key is configured.
"""
from django.conf import settings


# ─────────────────────────────────────────────
# Base
# ─────────────────────────────────────────────
class AIProvider:
    def chat(self, messages: list, system_prompt: str = "") -> str:
        raise NotImplementedError


# ─────────────────────────────────────────────
# Fallback (no API key needed)
# ─────────────────────────────────────────────
class FallbackProvider(AIProvider):
    """
    Rule-based assistant that works without any API key.
    Useful for demo / when keys are not configured.
    """
    RESPONSES = {
        'hello':      "Hi! I'm NovaCart AI. Ask me about products, deals, or your orders!",
        'hi':         "Hey there! How can I help you shop today?",
        'recommend':  "Based on trending items, I'd suggest checking out our Electronics and Fashion sections. Use code WELCOME10 for 10% off!",
        'phone':      "For phones, we have iPhone 15 (₹79,900), Samsung Galaxy S24 (₹74,999), OnePlus 12 (₹64,999), and budget options like Redmi Note 13 Pro (₹26,999).",
        'laptop':     "Top laptops: MacBook Air M2 (₹1,14,900), Dell XPS 15 (₹1,59,999), Asus ROG Strix for gaming (₹89,999), and HP Pavilion 15 budget pick (₹49,999).",
        'budget':     "For budget shopping, try Redmi, Realme, Noise, and Boat brands — great quality under ₹5,000!",
        'deal':       "Today's deals: Use SAVE20 for 20% off orders above ₹999, FLAT500 for ₹500 off orders above ₹2,999.",
        'coupon':     "Active coupons: WELCOME10 (10% off), SAVE20 (20% off ₹999+), FLAT100 (₹100 off ₹499+), TECH15 (15% off electronics).",
        'order':      "You can track your orders in the 'Orders' section of your profile. Need help with a specific order?",
        'return':     "Returns are accepted within 10 days of delivery. Go to Orders → Select Order → Request Return.",
        'shipping':   "Free delivery on orders above ₹499. Standard delivery takes 3-5 business days.",
        'compare':    "I can help compare products! Tell me which two products you want to compare.",
        'gaming':     "Best gaming options: Asus ROG Strix G15 laptop (₹89,999), OnePlus 12R phone (₹39,999), and Realme GT 6 (₹34,999).",
        'headphone':  "Top headphones: Sony WH-1000XM5 ANC (₹29,990), Apple AirPods Pro 2 (₹24,900), JBL Tune 770NC (₹5,999), Boat Rockerz 550 budget pick (₹1,999).",
        'watch':      "Smartwatches: Apple Watch Series 9 (₹41,900), Samsung Galaxy Watch 6 (₹26,999), Noise ColorFit Pro 4 (₹3,499).",
        'default':    "I'm NovaCart AI! I can help you find products, compare options, and suggest deals. What are you looking for today?"
    }

    def chat(self, messages: list, system_prompt: str = "") -> str:
        user_msg = ""
        for m in reversed(messages):
            if m.get('role') == 'user':
                user_msg = m.get('content', '').lower()
                break

        for keyword, response in self.RESPONSES.items():
            if keyword != 'default' and keyword in user_msg:
                return response
        return self.RESPONSES['default']


# ─────────────────────────────────────────────
# Google Gemini (new google-genai SDK)
# ─────────────────────────────────────────────
class GeminiProvider(AIProvider):
    def chat(self, messages: list, system_prompt: str = "") -> str:
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key.startswith('your-'):
            return FallbackProvider().chat(messages, system_prompt)
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)

            # Build conversation history
            contents = []
            for m in messages:
                role = 'user' if m['role'] == 'user' else 'model'
                contents.append(types.Content(
                    role=role,
                    parts=[types.Part(text=m['content'])]
                ))

            config = types.GenerateContentConfig(
                system_instruction=system_prompt if system_prompt else None,
                max_output_tokens=800,
                temperature=0.7,
            )

            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=contents,
                config=config,
            )
            return response.text

        except Exception as e:
            err = str(e)
            # If invalid key, use fallback gracefully
            if 'API_KEY_INVALID' in err or '401' in err or '403' in err:
                return FallbackProvider().chat(messages, system_prompt)
            return f"AI temporarily unavailable. Please try again. ({err[:80]})"


# ─────────────────────────────────────────────
# OpenAI ChatGPT
# ─────────────────────────────────────────────
class OpenAIProvider(AIProvider):
    def chat(self, messages: list, system_prompt: str = "") -> str:
        api_key = settings.OPENAI_API_KEY
        if not api_key or api_key.startswith('your-'):
            return FallbackProvider().chat(messages, system_prompt)
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            formatted = []
            if system_prompt:
                formatted.append({"role": "system", "content": system_prompt})
            for m in messages:
                formatted.append({"role": m['role'], "content": m['content']})

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=formatted,
                max_tokens=800,
            )
            return response.choices[0].message.content

        except Exception as e:
            err = str(e)
            if 'Incorrect API key' in err or '401' in err:
                return FallbackProvider().chat(messages, system_prompt)
            return f"AI temporarily unavailable. ({err[:80]})"


# ─────────────────────────────────────────────
# Future-ready stubs
# ─────────────────────────────────────────────
class ClaudeProvider(AIProvider):
    def chat(self, messages, system_prompt=""):
        return "Claude integration coming soon! Try Gemini or ChatGPT for now."


class DeepSeekProvider(AIProvider):
    def chat(self, messages, system_prompt=""):
        return "DeepSeek integration coming soon!"


# ─────────────────────────────────────────────
# Factory
# ─────────────────────────────────────────────
def get_ai_provider(provider_name: str) -> AIProvider:
    """Returns the correct provider. Never raises — always falls back."""
    mapping = {
        'gemini':   GeminiProvider,
        'openai':   OpenAIProvider,
        'claude':   ClaudeProvider,
        'deepseek': DeepSeekProvider,
    }
    cls = mapping.get(provider_name, GeminiProvider)
    return cls()


# ─────────────────────────────────────────────
# System prompts
# ─────────────────────────────────────────────
CUSTOMER_SYSTEM_PROMPT = """You are NovaCart AI, a friendly shopping assistant for NovaCart AI e-commerce platform.
Help customers find products, compare items, suggest based on budget, answer order/shipping questions.
Always be helpful, concise and friendly. Mention prices in INR (₹).
When recommending products, include price ranges and key specs.
Do NOT discuss admin operations or sensitive business data."""

ADMIN_SYSTEM_PROMPT = """You are NovaCart Admin AI, a business intelligence assistant for NovaCart AI admins.
Help with: sales analytics, revenue forecasting, inventory management, customer behavior analysis,
product demand prediction, marketing suggestions, and business growth insights.
Be professional, data-driven, and concise. Do NOT assist with customer shopping queries."""
