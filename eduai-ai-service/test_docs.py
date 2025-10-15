#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Teste se /docs está funcionando"""
import requests
import sys

print("Testando /docs endpoint...")
print("-" * 50)

try:
    response = requests.get("http://localhost:8001/docs", timeout=5)

    if response.status_code == 200:
        print("[OK] SUCCESS: /docs respondeu com status 200")
        print(f"Content-Type: {response.headers.get('content-type')}")
        print(f"Response size: {len(response.content)} bytes")

        if 'swagger' in response.text.lower() or 'openapi' in response.text.lower():
            print("[OK] Conteudo Swagger/OpenAPI detectado")

        print("\n[SUCCESS] DOCUMENTACAO FUNCIONANDO!")
        print("Acesse: http://localhost:8001/docs")
        sys.exit(0)
    else:
        print(f"[ERRO] Status {response.status_code}")
        print(f"Resposta: {response.text[:200]}")
        sys.exit(1)

except requests.exceptions.ConnectionError:
    print("[ERRO] Nao foi possivel conectar ao servidor")
    print("Certifique-se que o servidor esta rodando:")
    print("   uvicorn app.main:app --reload --port 8001")
    sys.exit(1)

except Exception as e:
    print(f"[ERRO] {e}")
    sys.exit(1)
