# 🤖 EduAI AI Generator Service

Microserviço Python para geração inteligente de cursos educacionais usando múltiplos provedores de IA.

## 🎯 Propósito

Este microserviço resolve o problema de geração inconsistente de cursos implementando um **roteador inteligente de IA** que escolhe automaticamente o melhor provedor baseado no conteúdo.

## 🏗️ Arquitetura

```
FastAPI (Python 3.11+)
    ↓
[AI Router] - Escolhe provedor automaticamente
    ├─ OpenAI GPT-4o     → PDFs complexos, vídeos
    ├─ Claude 3.5 Sonnet → Qualidade premium
    └─ Gemini 1.5 Pro    → Conteúdo simples, fallback
    ↓
Celery (processamento assíncrono)
    ↓
Redis (cache + queue)
```

## 📊 Taxa de Sucesso Esperada

- **OpenAI GPT-4o:** 98%+ (conteúdo complexo)
- **Claude 3.5:** 97%+ (qualidade máxima)
- **Gemini 1.5 Pro:** 90%+ (conteúdo simples)
- **Média Ponderada:** 95%+ ✅

## 🚀 Quick Start

### 1. Instalação

```bash
# Com Poetry (recomendado)
poetry install

# Ou com pip
pip install -r requirements.txt
```

### 2. Configuração

```bash
cp .env.example .env
# Edite .env com suas API keys
```

### 3. Executar

```bash
# Desenvolvimento
uvicorn app.main:app --reload --port 8001

# Produção
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 4
```

### 4. Worker Celery (processamento assíncrono)

```bash
celery -A app.tasks.celery_app worker --loglevel=info
```

## 📡 API Endpoints

### Gerar Curso (Síncrono)
```http
POST /api/v1/generate/course
Content-Type: multipart/form-data

{
  "file": <PDF_FILE>,
  "title": "Nome do Curso",
  "difficulty": "intermediate",
  "target_audience": "Estudantes universitários"
}

Response 200 OK:
{
  "success": true,
  "course_data": {
    "title": "...",
    "modules": [...],
    "generation_method": "openai",
    "confidence_score": 0.95
  },
  "metadata": {
    "provider": "openai",
    "tokens_used": 2500,
    "cost_usd": 0.015,
    "generation_time_ms": 4500
  }
}
```

### Gerar Curso (Assíncrono)
```http
POST /api/v1/generate/course/async
Content-Type: multipart/form-data

{...}

Response 202 Accepted:
{
  "task_id": "abc-123-def",
  "status_url": "/api/v1/tasks/abc-123-def"
}
```

### Verificar Status de Task
```http
GET /api/v1/tasks/{task_id}

Response 200 OK:
{
  "task_id": "abc-123-def",
  "status": "completed",
  "result": {...}
}
```

### Health Check
```http
GET /health

Response 200 OK:
{
  "status": "healthy",
  "providers": {
    "openai": "available",
    "claude": "available",
    "gemini": "available"
  }
}
```

## 🧪 Testes

```bash
# Todos os testes
pytest

# Com cobertura
pytest --cov=app --cov-report=html

# Apenas testes de integração
pytest -m integration
```

## 🐳 Docker

```bash
# Build
docker build -t eduai-ai-service .

# Run
docker-compose up -d

# Logs
docker-compose logs -f
```

## 📈 Monitoramento

Métricas Prometheus disponíveis em: `http://localhost:9090/metrics`

KPIs principais:
- `ai_generation_success_rate`: Taxa de sucesso por provedor
- `ai_generation_duration_seconds`: Tempo de geração
- `ai_generation_cost_usd`: Custo por geração
- `ai_tokens_used_total`: Tokens consumidos

## 🔧 Configuração Avançada

### Regras de Roteamento

Edite `app/config.py`:

```python
ROUTING_RULES = {
    "pdf_heavy": {
        "threshold": 2000,  # chars
        "provider": "openai"
    },
    "pdf_simple": {
        "threshold": 1000,
        "provider": "gemini"
    },
    "video": {
        "provider": "openai"
    }
}
```

## 📝 Logs

Logs estruturados em JSON:

```bash
tail -f logs/app.log | jq
```

## 🤝 Integração com Laravel

O Laravel comunica via HTTP:

```php
// app/Services/PythonAIService.php
$response = Http::timeout(120)
    ->attach('file', $pdfContent, 'document.pdf')
    ->post('http://python-ai-service:8001/api/v1/generate/course', [
        'title' => $title,
        'difficulty' => $difficulty
    ]);
```

## 📄 Licença

Proprietário - EduAI Platform

## 👥 Suporte

Equipe Técnica EduAI
