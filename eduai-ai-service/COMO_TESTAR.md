# 🧪 COMO TESTAR O PYTHON AI SERVICE

## 🚀 TESTE RÁPIDO (3 minutos)

### Passo 1: Iniciar o Microserviço

Dê **2 cliques** em:
```
iniciar.bat
```

Deve aparecer:
```
🚀 EduAI AI Service starting up...
   OpenAI: ✅ Configured
   Gemini: ✅ Configured
INFO:     Application startup complete.
```

**Deixe esta janela ABERTA!**

---

### Passo 2: Executar Testes Automatizados

Dê **2 cliques** em:
```
executar_testes.bat
```

Você vai ver:

```
🧪 TESTE AUTOMATIZADO - EduAI AI Service

TESTE 1: Health Check do Microserviço Python
✅ Microserviço está rodando!
   Status: healthy
   Versão: 1.0.0
   Providers:
      ✅ openai: available
      ✅ gemini: available

TESTE 2: Endpoint de Teste Básico
✅ Endpoint de teste respondeu!

TESTE 3: Criando PDF de Teste
✅ PDF de teste criado: test_document.pdf

TESTE 4: Geração de Curso com Python AI
📤 Enviando requisição para gerar curso...
   (Isso pode demorar 30-60 segundos)

✅ Curso gerado com sucesso! (em 35.2s)

📊 DETALHES DA GERAÇÃO:
   🤖 Provider: OPENAI
   🧠 Model: gpt-4o
   💰 Custo: $0.015234
   📈 Confiança: 92%
   ⏱️  Tempo: 35.2s
   🎫 Tokens: 500 in + 2000 out

📚 ESTRUTURA DO CURSO:
   📖 Título: Programação Python - Fundamentos
   📝 Descrição: Um curso completo sobre...
   ⏰ Duração estimada: 8 horas
   📊 Módulos: 4
   📄 Total de lições: 12

📑 MÓDULOS:
   1. Introdução ao Python
      └─ 3 lições
   2. Variáveis e Tipos
      └─ 3 lições
   3. Estruturas de Controle
      └─ 3 lições
   4. Funções e Módulos
      └─ 3 lições

✨ QUALIDADE:
   ✅ Curso aprovado automaticamente

💾 Resultado completo salvo em: test_course_result.json

...

RELATÓRIO FINAL

📊 Resultados:
   ✅ PASSOU - Health Check Python Service
   ✅ PASSOU - Endpoint de Teste
   ✅ PASSOU - Criar PDF de Teste
   ✅ PASSOU - Gerar Curso com IA
   ✅ PASSOU - Verificar Laravel
   ✅ PASSOU - Resumo Comparativo

📈 Taxa de Sucesso: 6/6 (100%)

🎉 TODOS OS TESTES PASSARAM! Sistema pronto para uso!
```

---

### Passo 3: Revisar o Resultado

Abra o arquivo gerado:
```
test_course_result.json
```

Você verá a estrutura completa do curso gerado pela IA:

```json
{
  "success": true,
  "course_data": {
    "title": "Programação Python - Fundamentos",
    "description": "...",
    "modules": [
      {
        "title": "Módulo 1: Introdução",
        "lessons": [
          {
            "title": "Aula 1: O que é Python?",
            "content": "Python é uma linguagem...",
            "duration_minutes": 45,
            "type": "lesson",
            "points": 15
          }
        ]
      }
    ]
  },
  "metadata": {
    "provider": "openai",
    "cost_usd": 0.015234,
    "confidence_score": 0.92
  }
}
```

---

## 🌐 TESTE NA INTERFACE WEB

### Preparação

**Terminal 1:** (Microserviço Python)
```bash
cd C:\xampp\htdocs\saas-gamificacao\eduai-ai-service
uvicorn app.main:app --reload --port 8001
```

**Terminal 2:** (Laravel)
```bash
cd C:\xampp\htdocs\saas-gamificacao
php artisan serve
```

**Os dois devem estar rodando simultaneamente!**

---

### Testar via Web

1. **Acesse:** http://localhost:8000

2. **Faça login** como professor/administrador

3. **Vá para:** Menu → EduAI → Gerar Curso

4. **Preencha:**
   - Título: "Teste Python AI Service"
   - Dificuldade: Intermediário
   - Faça upload de um PDF

5. **Clique:** "Gerar Curso"

6. **Aguarde** 30-60 segundos

7. **Verifique os logs:**

**Terminal Python:**
```
INFO: 📥 Received request: 'Teste Python AI Service'
INFO: 🧠 Routing: OPENAI - Complex PDF content
INFO: 🤖 Generating course with OpenAI GPT-4o
INFO: ✅ Course generated successfully
```

**Terminal Laravel:**
```
[INFO] 🐍 [Python AI] Calling microservice
[INFO] ✅ [Python AI] Course generated successfully
[INFO] - provider: openai
[INFO] - confidence: 0.92
```

8. **Resultado:** Você verá o curso gerado na tela!

---

## 📊 COMO SABER SE DEU CERTO?

### ✅ Sucesso Total

- [ ] Microserviço iniciou sem erros
- [ ] Todos os 6 testes passaram
- [ ] Arquivo `test_course_result.json` foi criado
- [ ] Provider = "openai" (não "gemini")
- [ ] Confiança >= 90%
- [ ] Custo entre $0.005 - $0.020
- [ ] Curso tem 3-5 módulos
- [ ] Cada módulo tem 2-4 lições
- [ ] Conteúdo das lições é detalhado (>200 palavras)

### ⚠️ Sucesso Parcial

Se vir:
```
provider: gemini
confidence: 0.75
```

**Significa:** Sistema usou fallback (Gemini), mas ainda funciona.

**Causas possíveis:**
- OpenAI demorou muito
- OpenAI retornou erro
- Limite de rate excedido

**Solução:** Execute novamente.

### ❌ Falha

Se vir:
```
❌ Erro ao gerar curso
Connection refused
```

**Significa:** Microserviço não está rodando

**Solução:**
1. Inicie o microserviço: `iniciar.bat`
2. Verifique `.env` tem `OPENAI_API_KEY`
3. Execute testes novamente

---

## 🔍 COMPARAR COM SISTEMA ANTIGO

### Geração com Gemini Direto (Antigo)

No Laravel, gere um curso **SEM** o Python AI rodando:

1. **Pare o microserviço Python** (feche a janela)
2. Gere um curso via interface web
3. Sistema vai usar Gemini automaticamente

**Anote:**
- Tempo de geração: _____ segundos
- Sucesso: ☐ Sim ☐ Não
- Qualidade do conteúdo: ☐ Boa ☐ Média ☐ Ruim
- Erros de formatação: ☐ Sim ☐ Não

### Geração com Python AI (Novo)

1. **Inicie o microserviço Python**
2. Gere um curso com **MESMO PDF**
3. Compare resultados

**Anote:**
- Tempo de geração: _____ segundos
- Sucesso: ☐ Sim ☐ Não
- Qualidade do conteúdo: ☐ Boa ☐ Média ☐ Ruim
- Erros de formatação: ☐ Sim ☐ Não

### Resultado Esperado

| Métrica | Gemini | Python AI |
|---------|--------|-----------|
| Taxa de Sucesso | 50-70% | 95%+ |
| Qualidade | Média | Alta |
| Detalhamento | Básico | Profundo |
| Formatação | Erros comuns | Limpa |

---

## 🐛 TROUBLESHOOTING

### Erro: "Python não encontrado"

**Solução:**
1. Baixe: https://www.python.org/downloads/
2. Instale marcando **"Add Python to PATH"**
3. Reinicie o terminal

### Erro: "ModuleNotFoundError"

**Solução:**
```bash
cd C:\xampp\htdocs\saas-gamificacao\eduai-ai-service
pip install -r requirements.txt
```

### Erro: "Connection refused port 8001"

**Solução:**
1. Verifique se microserviço está rodando
2. Execute: `uvicorn app.main:app --reload --port 8001`
3. Verifique se porta 8001 está livre

### Erro: "OPENAI_API_KEY not configured"

**Solução:**
1. Abra: `eduai-ai-service\.env`
2. Adicione sua chave:
   ```
   OPENAI_API_KEY=sk-proj-...
   ```
3. Salve e reinicie o microserviço

### Teste falha mas microserviço responde

**Solução:**
1. Veja logs detalhados: `python test_integration.py`
2. Verifique `test_course_result.json`
3. Teste manualmente: http://localhost:8001/health

---

## 📞 PRECISA DE AJUDA?

Se travou em algum passo, me envie:

1. **Print do erro** (screenshot)
2. **Log do terminal** (copiar e colar)
3. **Qual passo** você está

Vou te ajudar! 💪

---

## 🎯 CHECKLIST FINAL

Antes de considerar pronto:

- [ ] Microserviço inicia sem erros
- [ ] 6/6 testes passaram
- [ ] Curso gerado via script (test_integration.py)
- [ ] Curso gerado via interface web
- [ ] Provider = "openai" nos logs
- [ ] Confiança >= 90%
- [ ] Comparado com Gemini direto
- [ ] Python AI é superior ao Gemini

**Se marcou TUDO = Sistema APROVADO! ✅**

---

**Data:** 2025-10-05
**Versão:** 1.0
**Autor:** Claude PhD Expert
