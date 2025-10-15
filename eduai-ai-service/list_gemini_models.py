"""Lista modelos Gemini disponiveis"""

import google.generativeai as genai
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings

# Configurar API
genai.configure(api_key=settings.GEMINI_API_KEY)

print("\nModelos Gemini Disponiveis:\n")
print("=" * 60)

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"\nNome: {model.name}")
        print(f"Display Name: {model.display_name}")
        print(f"Metodos: {', '.join(model.supported_generation_methods)}")

print("\n" + "=" * 60 + "\n")
