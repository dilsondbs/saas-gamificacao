# 👋 COMECE AQUI - SUPER SIMPLES!

> **Para quem nunca usou Python antes**

---

## 🎯 VOCÊ ESTÁ A 3 CLIQUES DE FAZER FUNCIONAR!

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   1️⃣  Obter Chave da OpenAI (2 minutos)                    │
│   2️⃣  Dar 2 cliques em "iniciar.bat"                       │
│   3️⃣  Abrir http://localhost:8001/docs                     │
│                                                             │
│   PRONTO! ✅                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 PASSO 1: OBTER CHAVE DA OPENAI

### O que é isso?

A OpenAI é a empresa do ChatGPT. Você precisa de uma "chave" (tipo uma senha) para usar a inteligência artificial deles.

**Não se preocupe:** Eles dão **$5 DÓLARES GRÁTIS!** (suficiente para gerar 250-500 cursos)

### Como fazer:

1. **Abra o navegador** e vá em: https://platform.openai.com/signup

2. **Crie uma conta:**
   - Pode usar sua conta Google (mais rápido)
   - Ou criar com email

3. **Depois de logar, vá em:**
   - Menu lateral → **"API keys"**

4. **Clique em:**
   - **"+ Create new secret key"**

5. **Dê um nome:**
   - Digite: "EduAI Project"

6. **COPIE A CHAVE:**
   - Ela começa com `sk-proj-...`
   - Tem umas 50 letras
   - **Cole num bloco de notas** (você vai usar já já)
   - ⚠️ **ELA SÓ APARECE UMA VEZ!** Guarde bem!

---

## 📝 PASSO 2: CONFIGURAR A CHAVE

### Método FÁCIL (Recomendado):

1. **Dê 2 CLIQUES** no arquivo: `iniciar.bat`
   - Está nesta pasta onde você está agora

2. Uma janela preta vai abrir

3. Se for a primeira vez, vai abrir o **Bloco de Notas**

4. Procure esta linha:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **APAGUE** `your_openai_api_key_here`

6. **COLE** a chave que você copiou

7. Deve ficar assim:
   ```
   OPENAI_API_KEY=sk-proj-AbCd1234EfGh5678...
   ```

8. **SALVE** o arquivo (Ctrl+S)

9. **FECHE** o bloco de notas

10. O script vai continuar sozinho!

---

## ▶️ PASSO 3: INICIAR O MICROSERVIÇO

**Se você fechou a janela preta, dê 2 cliques de novo em:** `iniciar.bat`

Você vai ver:

```
============================================
  EDUAI - MICROSERVICO PYTHON AI
============================================

[OK] Python encontrado
Python 3.12.0

[OK] Arquivo .env encontrado

Verificando dependencias...
[OK] Dependencias instaladas

============================================
  INICIANDO MICROSERVICO...
============================================

INFO:     Uvicorn running on http://0.0.0.0:8001
🚀 EduAI AI Service starting up...
   OpenAI: ✅ Configured
   Gemini: ✅ Configured
INFO:     Application startup complete.
```

**Se ver isso = FUNCIONOU!** 🎉

**IMPORTANTE:** Deixe esta janela ABERTA! Não feche!

---

## 🧪 PASSO 4: TESTAR

1. **Abra seu navegador** (Chrome, Firefox, Edge...)

2. **Digite na barra de endereço:**
   ```
   http://localhost:8001/docs
   ```

3. **Pressione Enter**

4. **Você vai ver:**
   - Uma página bonita
   - Título: "EduAI AI Generator Service"
   - Vários botões e opções

**Se ver isso = ESTÁ FUNCIONANDO PERFEITAMENTE!** ✅✅✅

---

## 🎯 TESTE RÁPIDO (30 segundos)

Na página que abriu (`/docs`):

1. Procure: **GET /api/v1/test**
2. Clique nele
3. Clique no botão azul: **"Try it out"**
4. Clique no botão azul: **"Execute"**

**Resultado esperado:**
```json
{
  "status": "OK",
  "message": "EduAI AI Service is running"
}
```

**Viu isso? Sistema está VIVO!** 🚀

---

## 📄 TESTE COM PDF (2 minutos)

Agora a MÁGICA! Vamos gerar um curso de verdade:

1. **Pegue um PDF qualquer**
   - Pode ser pequeno (1-2 páginas)
   - Tem que ter TEXTO (não pode ser só imagem)

2. **Na página `/docs`, procure:**
   - **POST /api/v1/generate/course**

3. **Clique nele** (vai expandir)

4. **Clique em:** "Try it out"

5. **Preencha:**
   - **file:** Clique "Choose File" → Selecione seu PDF
   - **title:** Digite "Meu Primeiro Curso"
   - **difficulty:** Selecione "intermediate"
   - **target_audience:** Deixe em branco
   - **premium_quality:** false
   - **provider:** "auto"

6. **Clique em:** "Execute"

7. **AGUARDE 30-60 segundos**
   - A IA está trabalhando!
   - Não feche a página

8. **Resultado:**
   - Vai aparecer um JSON GIGANTE
   - Procure por: `"success": true`
   - Você vai ver módulos, lições, conteúdo...

**FOI GERADO UM CURSO COMPLETO A PARTIR DO SEU PDF!** 🎉🎉🎉

---

## ❌ PROBLEMAS? SOLUÇÕES RÁPIDAS

### "Python não encontrado"
1. Baixe: https://www.python.org/downloads/
2. Instale
3. **MARQUE:** "Add Python to PATH" (IMPORTANTE!)
4. Tente de novo

### "OPENAI_API_KEY not configured"
- Você esqueceu de colocar a chave no .env
- Abra o arquivo `.env` nesta pasta
- Cole sua chave da OpenAI
- Salve e tente de novo

### "Port 8001 already in use"
- Você já tem o microserviço rodando
- Procure outra janela preta aberta
- Ou reinicie o computador

### "Demora muito / Não responde"
- É normal demorar 30-60 segundos
- A IA está processando o PDF
- Seja paciente!

### Outro problema?
- Abra: `GUIA_INSTALACAO_COMPLETO.md`
- Lá tem TUDO explicado em detalhes

---

## ✅ CHECKLIST - VOCÊ COMPLETOU QUANDO:

- [ ] Obtive chave da OpenAI
- [ ] Configurei o .env
- [ ] Dei 2 cliques em iniciar.bat
- [ ] Abri http://localhost:8001/docs
- [ ] Testei com /api/v1/test
- [ ] Gerei um curso de um PDF

**COMPLETOU TUDO? VOCÊ CONSEGUIU!** 🏆

---

## 🎓 PRÓXIMO PASSO

Agora que está funcionando, vamos:

1. **Integrar com o Laravel** (para usar na sua aplicação web)
2. **Criar página de preview** (para o professor ver antes de publicar)
3. **Sistema de edição** (para ajustar o que a IA gerou)

**Me avise quando terminar e eu te guio no próximo passo!** 🚀

---

## 📞 PRECISA DE AJUDA?

Se travar, me mande:

1. **Print da tela** do erro
2. **Cópia da mensagem** de erro (se tiver)
3. **Em qual passo** você travou

Eu vou te ajudar! 💪

---

## 🎉 PARABÉNS!

Você acabou de configurar um microserviço de IA profissional usando:
- ✅ Python
- ✅ FastAPI
- ✅ OpenAI GPT-4
- ✅ Roteador inteligente
- ✅ API REST

**Isso é INCRÍVEL!** Pode se orgulhar! 🏆
