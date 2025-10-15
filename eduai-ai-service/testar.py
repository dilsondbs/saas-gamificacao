"""Script de teste simples para verificar se o microserviço está funcionando"""
import requests
import json
from pathlib import Path

print("="*60)
print("  TESTANDO MICROSERVIÇO EDUAI")
print("="*60)
print()

BASE_URL = "http://localhost:8001"

# Teste 1: Verificar se está rodando
print("1️⃣  Testando conexão básica...")
try:
    response = requests.get(f"{BASE_URL}/")
    if response.status_code == 200:
        print("   ✅ Servidor está rodando!")
        print(f"   Resposta: {response.json()}")
    else:
        print(f"   ❌ Erro: {response.status_code}")
except Exception as e:
    print(f"   ❌ Erro de conexão: {e}")
    print("   ⚠️  Certifique-se de que o microserviço está rodando!")
    exit(1)

print()

# Teste 2: Health check
print("2️⃣  Testando health check...")
try:
    response = requests.get(f"{BASE_URL}/health")
    if response.status_code == 200:
        data = response.json()
        print("   ✅ Health check OK!")
        print(f"   Status: {data['status']}")
        print(f"   Providers:")
        for provider, status in data['providers'].items():
            emoji = "✅" if status == "available" else "❌"
            print(f"      {emoji} {provider}: {status}")
    else:
        print(f"   ❌ Erro: {response.status_code}")
except Exception as e:
    print(f"   ❌ Erro: {e}")

print()

# Teste 3: Endpoint de teste
print("3️⃣  Testando endpoint de teste...")
try:
    response = requests.get(f"{BASE_URL}/api/v1/test")
    if response.status_code == 200:
        print("   ✅ Endpoint de teste OK!")
        print(f"   Resposta: {response.json()}")
    else:
        print(f"   ❌ Erro: {response.status_code}")
except Exception as e:
    print(f"   ❌ Erro: {e}")

print()

# Teste 4: Verificar se consegue acessar docs
print("4️⃣  Verificando documentação...")
try:
    response = requests.get(f"{BASE_URL}/docs")
    if response.status_code == 200:
        print("   ✅ Documentação disponível!")
        print(f"   Acesse: {BASE_URL}/docs")
    else:
        print(f"   ⚠️  Documentação não disponível (erro {response.status_code})")
except Exception as e:
    print(f"   ❌ Erro: {e}")

print()
print("="*60)
print("  RESUMO")
print("="*60)
print()
print("✅ Se todos os testes acima passaram, o microserviço está")
print("   funcionando corretamente!")
print()
print("📝 Próximos passos:")
print("   1. Abra http://localhost:8001/docs no navegador")
print("   2. Teste gerar um curso com um PDF")
print("   3. Me avise se funcionou!")
print()
print("="*60)
