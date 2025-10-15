# 🚀 QUICK START - EduAI Python AI Microservice

## ⚡ Setup Rápido (5 minutos)

### 1. Obter API Key da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie conta
3. Clique em "Create new secret key"
4. Copie a chave (começa com `sk-proj-...`)
5. **IMPORTANTE:** Você ganha $5 USD de crédito grátis!

### 2. Configurar .env

```bash
cd eduai-ai-service
cp .env.example .env
```

Edite `.env` e adicione sua chave OpenAI:
```env
OPENAI_API_KEY=sk-proj-sua-chave-aqui
GEMINI_API_KEY=AIzaSyDlTq6sUQAAOn472LR34tSUNrg265aU9mY
```

### 3. Instalar Dependências

```bash
# Opção 1: Com pip
pip install -r requirements.txt

# Opção 2: Com Poetry (recomendado)
poetry install
```

### 4. Executar o Microserviço

```bash
# Desenvolvimento
uvicorn app.main:app --reload --port 8001

# Ou com Python diretamente
python -m app.main
```

Você verá:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
🚀 EduAI AI Service starting up...
   OpenAI: ✅ Configured
   Gemini: ✅ Configured
```

### 5. Testar

Abra o navegador: http://localhost:8001/docs

Você verá a documentação interativa Swagger!

**Testar endpoint:**
```bash
curl http://localhost:8001/api/v1/test
```

Resposta esperada:
```json
{"status": "OK", "message": "EduAI AI Service is running"}
```

---

## 🧪 Teste Completo com PDF

### Usando Swagger UI (Recomendado)

1. Acesse: http://localhost:8001/docs
2. Expanda `/api/v1/generate/course`
3. Clique em "Try it out"
4. Preencha:
   - **file**: Selecione um PDF de teste
   - **title**: "Introdução à Programação"
   - **difficulty**: "beginner"
   - **provider**: "auto"
5. Clique em "Execute"

### Usando cURL

```bash
curl -X POST "http://localhost:8001/api/v1/generate/course" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@caminho/para/seu/arquivo.pdf" \
  -F "title=Curso de Teste" \
  -F "difficulty=intermediate" \
  -F "provider=auto"
```

### Resposta Esperada

```json
{
  "success": true,
  "course_data": {
    "title": "Curso de Teste",
    "description": "...",
    "modules": [
      {
        "title": "Módulo 1",
        "lessons": [...]
      }
    ]
  },
  "metadata": {
    "provider": "openai",
    "model": "gpt-4o",
    "tokens_used": {"input": 500, "output": 2000},
    "cost_usd": 0.015,
    "generation_time_ms": 4500,
    "confidence_score": 0.92
  }
}
```

---

## 🔗 Integrar com Laravel

### 1. Adicionar ao .env do Laravel

```env
PYTHON_AI_SERVICE_URL=http://localhost:8001
```

### 2. Testar Integração

O EduAIController já está configurado! Basta:

1. Iniciar o microserviço Python: `uvicorn app.main:app --port 8001`
2. Iniciar o Laravel: `php artisan serve`
3. Acessar a página de geração de curso
4. Fazer upload de um PDF
5. O Laravel vai automaticamente usar o Python AI Service!

---

## 📊 Monitoramento

### Logs em Tempo Real

```bash
tail -f logs/app.log
```

### Health Check

```bash
curl http://localhost:8001/health
```

Resposta:
```json
{
  "status": "healthy",
  "providers": {
    "openai": "available",
    "claude": "unavailable",
    "gemini": "available"
  }
}
```

---

## 🐳 Docker (Opcional)

Se preferir Docker:

```bash
# Build e start
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

## ❓ Troubleshooting

### Erro: "OPENAI_API_KEY not configured"
- **Solução:** Verifique se o .env tem a chave correta

### Erro: "ModuleNotFoundError: No module named 'app'"
- **Solução:** Execute de dentro do diretório `eduai-ai-service`

### Erro: "Connection refused" no Laravel
- **Solução:** Certifique-se de que o microserviço Python está rodando na porta 8001

### PDF não extrai texto
- **Solução:** Alguns PDFs são imagens escaneadas. Use PDFs com texto selecionável

---

## 💰 Custo Estimado

- **Geração simples:** $0.002 - $0.005 USD
- **Geração média:** $0.010 - $0.020 USD
- **Geração complexa:** $0.020 - $0.040 USD

**Com $5 USD grátis da OpenAI:** ~250-500 gerações de curso!

---

## 🎯 Próximos Passos

1. ✅ Microserviço funcionando
2. ⏭️ Testar com 10 PDFs reais
3. ⏭️ Implementar página de preview
4. ⏭️ Sistema de aprovação/edição

**Está funcionando? Vamos para o preview! 🚀**
