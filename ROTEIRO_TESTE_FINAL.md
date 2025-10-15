# 🎯 ROTEIRO DE TESTE FINAL - Sistema SaaS de Gamificação

**Data:** 2025-10-01
**Status:** ✅ Ambiente LIMPO e PRONTO
**Objetivo:** Validar fluxo completo do zero até conclusão de curso com IA

---

## ✅ PRÉ-REQUISITOS VERIFICADOS

- ✅ Banco de dados limpo (0 registros)
- ✅ 27 bugs corrigidos
- ✅ Gemini API Key configurada
- ✅ Planos disponíveis (4 planos)
- ✅ Servidor rodando: `php artisan serve`
- ✅ Vite rodando: `npm run dev`

---

## 📋 ROTEIRO PASSO A PASSO

### 🔹 PASSO 1: CRIAR TENANT (Simular Compra)

**Ação:** Acessar página de signup

**URL:** http://127.0.0.1:8000/central/signup

**Dados sugeridos:**
```
Nome da Empresa: Escola Digital
Slug: escoladigital
Nome do Admin: João Silva
Email: admin@escoladigital.com
Plano: TESTE GRATUITO
```

**Resultado esperado:**
- ✅ Tenant criado
- ✅ Redirecionado para página de sucesso
- ✅ Mostra credenciais temporárias

**⚠️ IMPORTANTE:** Anote a senha temporária exibida!

---

### 🔹 PASSO 2: LOGIN COMO ADMIN DO TENANT

**Ação:** Fazer primeiro login

**URL:** http://escoladigital.saas-gamificacao.local:8000/login

**Credenciais:**
```
Email: admin@escoladigital.com
Senha: [senha temporária anotada]
```

**Resultado esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionado para /password/change
- ✅ Forçado a trocar senha temporária

**Troque a senha para:** `admin123` (ou outra de sua escolha)

**Após trocar senha:**
- ✅ Redirecionado para /admin/dashboard
- ✅ Vê painel administrativo

---

### 🔹 PASSO 3: CADASTRAR PROFESSOR

**Ação:** Criar usuário Professor

**Caminho:** Admin Dashboard → Usuários → Criar Novo

**Dados sugeridos:**
```
Nome: Prof. Maria Santos
Email: professor@escoladigital.com
Role: instructor (Professor)
Senha: professor123
```

**Resultado esperado:**
- ✅ Professor criado
- ✅ Aparece na lista de usuários
- ✅ Role = instructor

---

### 🔹 PASSO 4: CADASTRAR ALUNO

**Ação:** Criar usuário Aluno

**Caminho:** Admin Dashboard → Usuários → Criar Novo

**Dados sugeridos:**
```
Nome: Aluno Pedro Costa
Email: aluno@escoladigital.com
Role: student (Aluno)
Senha: aluno123
```

**Resultado esperado:**
- ✅ Aluno criado
- ✅ Aparece na lista de usuários
- ✅ Role = student

---

### 🔹 PASSO 5: LOGIN COMO PROFESSOR

**Ação:** Logout do admin e login como professor

**URL:** http://escoladigital.saas-gamificacao.local:8000/login

**Credenciais:**
```
Email: professor@escoladigital.com
Senha: professor123
```

**Resultado esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionado para dashboard do professor
- ✅ Vê opção "EduAI" no menu

---

### 🔹 PASSO 6: CRIAR CURSO COM IA

**Ação:** Gerar curso usando material PDF/TXT

**Caminho:** Menu → EduAI → Gerar Curso com IA

**⚠️ IMPORTANTE: Prepare um arquivo pequeno para teste**

**Arquivo de teste sugerido (salvar como `teste.txt`):**
```
INTRODUÇÃO À PROGRAMAÇÃO PYTHON

Módulo 1: Conceitos Básicos
Python é uma linguagem de programação de alto nível, interpretada e de propósito geral.
É conhecida por sua sintaxe clara e legível, tornando-a ideal para iniciantes.

Principais características:
- Sintaxe simples e intuitiva
- Interpretada (não precisa compilar)
- Tipagem dinâmica
- Multiplataforma
- Grande comunidade

Módulo 2: Variáveis e Tipos de Dados
Em Python, você não precisa declarar o tipo da variável. O interpretador deduz automaticamente.

Exemplos:
nome = "João"  # String
idade = 25     # Inteiro
altura = 1.75  # Float
ativo = True   # Boolean

Módulo 3: Estruturas de Controle
Python usa indentação para definir blocos de código.

Exemplo de IF:
if idade >= 18:
    print("Maior de idade")
else:
    print("Menor de idade")

Exemplo de LOOP:
for i in range(5):
    print(i)

Conclusão:
Python é uma excelente linguagem para começar a programar.
Sua simplicidade permite focar na lógica de programação.
```

**Passos:**
1. Clique em "Upload de Material"
2. Selecione o arquivo `teste.txt`
3. Aguarde processamento (pode levar 10-30 segundos)
4. Revise o curso gerado
5. Clique em "Salvar Curso"

**Resultado esperado:**
- ✅ Arquivo enviado com sucesso
- ✅ IA processou o conteúdo
- ✅ Gerou 3+ atividades
- ✅ Curso salvo com status "published"
- ✅ Curso tem tenant_id correto

**🐛 Se der erro:**
- Verifique Gemini API Key
- Verifique logs: `storage/logs/laravel.log`
- Arquivo não pode estar vazio
- Arquivo deve ter pelo menos 100 palavras

---

### 🔹 PASSO 7: VERIFICAR CURSO CRIADO

**Ação:** Confirmar que curso está visível

**Caminho:** Menu → Cursos (ou Meus Cursos)

**Resultado esperado:**
- ✅ Curso aparece na lista
- ✅ Título: relacionado ao conteúdo enviado
- ✅ Status: Published
- ✅ Possui atividades (3+)

**Clique no curso e verifique:**
- ✅ Atividades listadas em ordem
- ✅ Cada atividade tem título e descrição
- ✅ Tipos: reading, quiz, ou assignment

---

### 🔹 PASSO 8: LOGIN COMO ALUNO

**Ação:** Logout e login como aluno

**URL:** http://escoladigital.saas-gamificacao.local:8000/login

**Credenciais:**
```
Email: aluno@escoladigital.com
Senha: aluno123
```

**Resultado esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionado para dashboard do aluno
- ✅ Vê opção "Cursos" no menu

---

### 🔹 PASSO 9: MATRICULAR-SE NO CURSO

**Ação:** Visualizar e matricular no curso

**Caminho:** Menu → Cursos

**Resultado esperado:**
- ✅ Vê o curso criado pelo professor
- ✅ Curso mostra descrição e número de atividades
- ✅ Botão "Matricular-se" disponível

**Clique em "Matricular-se"**

**Resultado:**
- ✅ Matrícula realizada
- ✅ Botão muda para "Acessar Curso" ou "Continuar"
- ✅ Pode clicar para entrar no curso

---

### 🔹 PASSO 10: FAZER PRIMEIRA ATIVIDADE

**Ação:** Completar a Lição 1

**Caminho:** Cursos → [Curso Criado] → Lição 1

**Se for READING (Leitura):**
1. Clique em "Iniciar Leitura"
2. Leia o conteúdo
3. **AGUARDE 20 segundos** (barra de progresso)
4. Aparecerá "Leitura Concluída! 🎉"
5. Clique em "Finalizar e Ganhar X Pontos"

**Se for QUIZ:**
1. Leia as perguntas
2. Selecione as respostas
3. Clique em "Enviar Respostas"
4. Veja resultado e pontos ganhos

**Resultado esperado:**
- ✅ Atividade marcada como completada
- ✅ Pontos adicionados ao perfil
- ✅ Próxima atividade desbloqueada
- ✅ Progresso atualizado

---

### 🔹 PASSO 11: FAZER SEGUNDA ATIVIDADE

**Ação:** Verificar desbloqueio e completar Lição 2

**Caminho:** Voltar ao curso → Clicar na Lição 2

**Resultado esperado:**
- ✅ Lição 2 está DESBLOQUEADA (não redireciona)
- ✅ Consegue acessar normalmente
- ✅ Completa da mesma forma que Lição 1
- ✅ Mais pontos adicionados

---

### 🔹 PASSO 12: VERIFICAR RESULTADOS

**Ação:** Conferir gamificação funcionando

**Verificar em:**
1. **Dashboard do Aluno:**
   - ✅ Total de pontos atualizado
   - ✅ Progresso do curso (ex: 2/3 atividades)
   - ✅ Ranking atualizado

2. **Menu → Badges:**
   - ✅ Badges disponíveis
   - ✅ Progresso para cada badge
   - ✅ Badges conquistados (se aplicável)

3. **Menu → Ranking:**
   - ✅ Aluno aparece no ranking
   - ✅ Posição baseada em pontos
   - ✅ Compara com outros alunos

---

## ✅ CHECKLIST FINAL DE SUCESSO

Marque cada item conforme completar:

### Tenant & Autenticação
- [ ] Tenant criado via signup
- [ ] Login como admin funcionou
- [ ] Troca de senha temporária OK
- [ ] Professor criado
- [ ] Aluno criado

### Curso com IA
- [ ] Upload de arquivo funcionou
- [ ] IA processou e gerou curso
- [ ] Curso salvo como "published"
- [ ] Curso visível para aluno
- [ ] Atividades criadas (3+)

### Matrícula & Progressão
- [ ] Aluno conseguiu matricular
- [ ] Primeira atividade acessível
- [ ] Primeira atividade completada
- [ ] Pontos concedidos
- [ ] Segunda atividade desbloqueada
- [ ] Segunda atividade completada

### Gamificação
- [ ] Pontos acumulando
- [ ] Progresso calculado corretamente
- [ ] Ranking funcionando
- [ ] Badges disponíveis

---

## 🐛 TROUBLESHOOTING

### Problema: "Curso não aparece para aluno"
**Solução:**
```bash
# Verificar no banco
php diagnose_complete_flow.php

# Deve mostrar:
# - Curso com tenant_id correto
# - Status = published
# - Atividades com tenant_id
```

### Problema: "Não consigo acessar Lição 2"
**Solução:**
- Verifique se Lição 1 está completada
- Veja logs: `tail -100 storage/logs/laravel.log | grep "🔒"`
- Score deve ser >= 1 para readings, >= 70 para quizzes

### Problema: "Erro ao gerar curso com IA"
**Solução:**
- Verifique Gemini API Key no .env
- Teste em: https://aistudio.google.com/
- Arquivo deve ter conteúdo legível
- Veja logs para erro específico

### Problema: "Erro 419 ao submeter atividade"
**Solução:**
```bash
# Limpar cache
php artisan cache:clear
php artisan config:clear

# Recarregar página (Ctrl+Shift+R)
```

### Problema: "Redirecionamentos infinitos (302)"
**Solução:**
```bash
# Ver logs detalhados
tail -100 storage/logs/laravel.log

# Deve mostrar o motivo do bloqueio
```

---

## 📊 DADOS PARA RELATÓRIO

Após concluir o teste, anote:

| Item | Valor |
|------|-------|
| ⏱️ Tempo total do teste | ___ minutos |
| ✅ Etapas concluídas | ___/12 |
| 🐛 Bugs encontrados | ___ |
| ⭐ Experiência geral | ___/10 |

**Bugs encontrados (se houver):**
```
1.
2.
3.
```

---

## 🚀 PRÓXIMOS PASSOS (Se sucesso)

1. ✅ Documentar fluxo para clientes
2. ✅ Criar vídeo tutorial
3. ✅ Preparar ambiente VPS
4. ✅ Configurar domínio real
5. ✅ SSL/HTTPS
6. ✅ Backup automatizado
7. ✅ Monitoramento

---

**BOA SORTE NO TESTE! 🎯**

Se tudo funcionar, o projeto está PRONTO para produção! 🚀
