# 🚀 GUIA COMPLETO DE INSTALAÇÃO - PARA INICIANTES

## ETAPA 0: VERIFICAR O QUE VOCÊ TEM

### 1. Abrir o Terminal/Prompt de Comando

**No Windows:**
1. Pressione a tecla `Windows` no teclado
2. Digite: `cmd`
3. Pressione `Enter`
4. Uma janela preta vai abrir (isso é o terminal)

### 2. Verificar se tem Python

Na janela preta, digite:
```
python --version
```

Pressione `Enter`.

**Você vai ver uma de duas coisas:**

✅ **SE APARECER algo como:** `Python 3.11.5` ou `Python 3.12.0`
   - **ÓTIMO!** Você já tem Python instalado
   - Pule para a ETAPA 1

❌ **SE APARECER:** `'python' não é reconhecido...` ou erro
   - Você precisa instalar Python
   - Continue lendo abaixo

---

## 📥 INSTALANDO PYTHON (se não tiver)

### Passo 1: Baixar Python

1. Abra o navegador
2. Vá em: https://www.python.org/downloads/
3. Clique no botão grande **"Download Python 3.12.x"**
4. Aguarde o download (arquivo ~25MB)

### Passo 2: Instalar Python

1. Localize o arquivo baixado (geralmente na pasta `Downloads`)
2. Nome do arquivo: `python-3.12.x-amd64.exe`
3. **DÊ DOIS CLIQUES** no arquivo
4. **IMPORTANTE:** Na primeira tela do instalador:
   - ✅ **MARQUE a caixinha:** "Add python.exe to PATH"
   - Isso é CRUCIAL! Sem isso não vai funcionar
5. Clique em **"Install Now"**
6. Aguarde a instalação (2-3 minutos)
7. Quando terminar, clique em **"Close"**

### Passo 3: Verificar se instalou certo

1. **FECHE** o terminal/cmd que estava aberto
2. **ABRA NOVAMENTE** um terminal novo (Windows → cmd → Enter)
3. Digite: `python --version`
4. Se aparecer `Python 3.12.x` → **SUCESSO!** ✅

---

## ✅ ETAPA 1: OBTER CHAVE DA OPENAI

### Por que preciso disso?

A OpenAI é a empresa que criou o ChatGPT. Para usar a inteligência artificial deles, você precisa de uma "chave" (como uma senha).

**Boa notícia:** Eles dão $5 dólares GRÁTIS de crédito para novos usuários!

### Passo 1: Criar conta na OpenAI

1. Abra o navegador
2. Vá em: https://platform.openai.com/signup
3. Clique em **"Sign up"**
4. **Opção A:** Usar sua conta Google (mais rápido)
5. **Opção B:** Criar com email
   - Digite seu email
   - Crie uma senha
   - Confirme o email (verifique sua caixa de entrada)

### Passo 2: Obter a chave API

1. Após fazer login, você estará em: https://platform.openai.com/
2. No menu lateral esquerdo, procure: **"API keys"**
3. Clique em **"API keys"**
4. Clique no botão verde: **"+ Create new secret key"**
5. Dê um nome para a chave: "EduAI Project"
6. Clique em **"Create secret key"**
7. **ATENÇÃO:** Uma janela vai aparecer com sua chave
8. A chave começa com: `sk-proj-...` (tem umas 50 letras)
9. **COPIE ESTA CHAVE** e cole em um bloco de notas
10. **MUITO IMPORTANTE:** Guarde bem, ela só aparece UMA VEZ!

### Passo 3: Adicionar crédito (se necessário)

1. No menu lateral, clique em **"Billing"**
2. Se aparecer "Free trial credits: $5.00" → **ÓTIMO, você já tem!**
3. Se não tiver crédito, clique em **"Add payment method"**
4. Adicione um cartão de crédito (não vai ser cobrado ainda)

---

## 📂 ETAPA 2: PREPARAR OS ARQUIVOS

### Passo 1: Navegar até a pasta do projeto

1. Abra o terminal (cmd)
2. Digite:
```
cd C:\xampp\htdocs\saas-gamificacao
```
3. Pressione `Enter`
4. Digite: `dir`
5. Você deve ver uma lista de pastas, incluindo `eduai-ai-service`

### Passo 2: Entrar na pasta do microserviço

Digite:
```
cd eduai-ai-service
```
Pressione `Enter`

### Passo 3: Criar o arquivo .env

**Opção A - Usando comando (mais rápido):**
```
copy .env.example .env
```

**Opção B - Manualmente:**
1. Abra o Windows Explorer
2. Navegue até: `C:\xampp\htdocs\saas-gamificacao\eduai-ai-service`
3. Encontre o arquivo: `.env.example`
4. Clique com botão direito → **Copiar**
5. Clique com botão direito na pasta → **Colar**
6. Renomeie a cópia para: `.env` (sem o .example)

### Passo 4: Editar o arquivo .env

1. Na pasta `eduai-ai-service`, encontre o arquivo `.env`
2. Clique com botão direito → **Abrir com** → **Bloco de Notas**
3. Procure a linha:
```
OPENAI_API_KEY=your_openai_api_key_here
```
4. **SUBSTITUA** `your_openai_api_key_here` pela chave que você copiou
5. Deve ficar assim:
```
OPENAI_API_KEY=sk-proj-AbCd1234...
```
6. **SALVE** o arquivo (Ctrl+S)
7. **FECHE** o bloco de notas

---

## 📦 ETAPA 3: INSTALAR AS BIBLIOTECAS PYTHON

### O que é isso?

Python precisa de "bibliotecas" (pedaços de código prontos) para funcionar. É como baixar plugins.

### Passo 1: Instalar tudo de uma vez

No terminal (certifique-se de estar em `eduai-ai-service`), digite:

```
pip install -r requirements.txt
```

Pressione `Enter`

**O que vai acontecer:**
- Vai aparecer MUUUITO texto rolando na tela
- Vai demorar uns 2-5 minutos
- Vai baixar umas 30-40 bibliotecas
- **NÃO FECHE O TERMINAL!** Deixe terminar

**Você vai ver coisas como:**
```
Collecting fastapi==0.109.0
Downloading fastapi-0.109.0...
Installing collected packages: ...
Successfully installed fastapi-0.109.0 ...
```

### Passo 2: Verificar se instalou

Quando terminar (a última linha vai voltar para `C:\xampp\htdocs\...`), digite:

```
pip list
```

Você vai ver uma lista gigante. Se tiver `fastapi`, `openai`, `uvicorn` → **SUCESSO!** ✅

---

## 🚀 ETAPA 4: RODAR O MICROSERVIÇO

### Passo 1: Iniciar o servidor

No terminal, digite:

```
uvicorn app.main:app --reload --port 8001
```

Pressione `Enter`

**O que esperar:**
```
INFO:     Will watch for changes in these directories: ['C:\\xampp\\htdocs\\saas-gamificacao\\eduai-ai-service']
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
🚀 EduAI AI Service starting up...
   OpenAI: ✅ Configured
   Gemini: ✅ Configured
INFO:     Application startup complete.
```

**Se ver isso, PARABÉNS! Está funcionando!** 🎉

**IMPORTANTE:**
- **NÃO FECHE ESTE TERMINAL!** Deixe ele aberto
- Enquanto estiver rodando, o microserviço está "vivo"

### Passo 2: Testar se está funcionando

1. Abra o navegador (Chrome, Firefox, Edge...)
2. Digite na barra de endereço: `http://localhost:8001/docs`
3. Pressione `Enter`

**Você vai ver:**
- Uma página bonita com documentação
- Título: "EduAI AI Generator Service"
- Vários endpoints listados

**Se ver isso → FUNCIONOU!** ✅✅✅

---

## 🧪 ETAPA 5: FAZER O PRIMEIRO TESTE

### Teste Simples (sem PDF)

1. Na página `http://localhost:8001/docs`
2. Procure: **GET /api/v1/test**
3. Clique nele (vai expandir)
4. Clique no botão azul: **"Try it out"**
5. Clique no botão azul: **"Execute"**

**Resultado esperado:**
```json
{
  "status": "OK",
  "message": "EduAI AI Service is running"
}
```

**Se ver isso → Sistema está VIVO!** ✅

### Teste Completo (com PDF)

1. Pegue um PDF qualquer (pode ser pequeno, 1-2 páginas)
2. Na página `http://localhost:8001/docs`
3. Procure: **POST /api/v1/generate/course**
4. Clique nele
5. Clique em **"Try it out"**
6. Preencha:
   - **file:** Clique em "Choose File" → Selecione seu PDF
   - **title:** Digite "Curso de Teste"
   - **difficulty:** Selecione "intermediate"
   - **provider:** Deixe "auto"
7. Clique em **"Execute"**

**O que vai acontecer:**
- Vai demorar 30-60 segundos (é normal!)
- Vai aparecer um JSON gigante com o curso gerado
- Procure por `"success": true`

**Se aparecer → FUNCIONOU PERFEITAMENTE!** 🎉🎉🎉

---

## 🔗 ETAPA 6: CONECTAR COM O LARAVEL

### Passo 1: Configurar o Laravel

1. Abra o arquivo: `C:\xampp\htdocs\saas-gamificacao\.env`
2. No final do arquivo, adicione esta linha:
```
PYTHON_AI_SERVICE_URL=http://localhost:8001
```
3. Salve o arquivo

### Passo 2: Testar a integração

**Você precisa de 2 terminais abertos ao mesmo tempo:**

**Terminal 1 - Python AI:**
```
cd C:\xampp\htdocs\saas-gamificacao\eduai-ai-service
uvicorn app.main:app --reload --port 8001
```

**Terminal 2 - Laravel:**
```
cd C:\xampp\htdocs\saas-gamificacao
php artisan serve
```

**Agora:**
1. Abra o navegador
2. Vá na sua aplicação Laravel
3. Faça upload de um PDF
4. **MÁGICA:** O Laravel vai chamar o Python automaticamente!

---

## ❓ PROBLEMAS COMUNS E SOLUÇÕES

### "python não é reconhecido..."
**Solução:** Você não instalou Python ou esqueceu de marcar "Add to PATH"
- Reinstale Python
- **MARQUE** a opção "Add python.exe to PATH"

### "pip não é reconhecido..."
**Solução:** Mesmo problema acima
- Reinstale Python corretamente

### "Port 8001 already in use"
**Solução:** Já tem algo rodando na porta 8001
- Feche outros programas
- Ou use outra porta: `--port 8002`

### "ModuleNotFoundError: No module named 'app'"
**Solução:** Você não está na pasta certa
- Digite: `cd C:\xampp\htdocs\saas-gamificacao\eduai-ai-service`
- Tente novamente

### "Invalid API key"
**Solução:** Chave da OpenAI errada
- Verifique se copiou certo
- Verifique se não tem espaços no início/fim
- Crie uma nova chave se necessário

### PDF não gera curso
**Solução:** Verifique os logs no terminal
- Olhe a mensagem de erro
- PDF pode ter imagens (precisa de texto)

---

## 📞 PRECISA DE AJUDA?

Se travar em alguma etapa:

1. **COPIE** a mensagem de erro exata
2. **TIRE PRINT** da tela se possível
3. **ME MOSTRE** o erro e eu vou te ajudar!

---

## ✅ CHECKLIST FINAL

Você completou quando:

- [ ] Python instalado e funcionando
- [ ] Chave OpenAI obtida
- [ ] Arquivo .env configurado
- [ ] Bibliotecas instaladas (pip install)
- [ ] Microserviço rodando (uvicorn)
- [ ] Teste funcionou (/docs)
- [ ] Laravel conectado

**Completou tudo? VOCÊ É INCRÍVEL! 🎉**

Próximo passo: Vamos testar com PDFs reais e criar a página de preview!
