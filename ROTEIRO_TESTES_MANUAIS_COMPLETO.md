# 🧪 ROTEIRO DE TESTES MANUAIS COMPLETO
**Sistema:** SaaS Gamificação - Plataforma Educacional Multi-Tenant
**Versão:** 1.0
**Data:** 01/10/2025

---

## 📋 PRÉ-REQUISITOS PARA TESTES

### 1. Configuração do Ambiente

#### A) Arquivo Hosts (Windows)
**Arquivo:** `C:\Windows\System32\drivers\etc\hosts`

**Adicionar as seguintes linhas:**
```
127.0.0.1 saas-gamificacao.local
127.0.0.1 escola-teste.saas-gamificacao.local
127.0.0.1 escola-premium.saas-gamificacao.local
127.0.0.1 escola-demo.saas-gamificacao.local
```

**Como editar:**
1. Abrir Bloco de Notas como Administrador
2. Abrir arquivo: `C:\Windows\System32\drivers\etc\hosts`
3. Adicionar linhas acima no final
4. Salvar e fechar

#### B) Banco de Dados
```bash
# Limpar banco (CUIDADO - apaga tudo!)
php artisan migrate:fresh

# Executar migrations
php artisan migrate

# (Opcional) Rodar seeders de teste
php artisan db:seed
```

#### C) Servidor Local
```bash
# Iniciar servidor Laravel
php artisan serve
```

**URL Base:** http://127.0.0.1:8000

#### D) Compilar Assets Frontend
```bash
# Instalar dependências
npm install

# Desenvolvimento (watch mode)
npm run dev
```

### 2. Ferramentas Necessárias
- ✅ Navegador (Chrome/Firefox recomendado)
- ✅ Ferramenta de inspeção (DevTools)
- ✅ Bloco de notas para anotar bugs
- ✅ Print screen (Windows Snipping Tool)

### 3. Personas de Teste

Vamos criar 3 personas para cobrir todos os cenários:

**PERSONA 1 - Super Admin Central**
- Nome: Admin Central
- Email: superadmin@saas.com
- Acesso: Painel central

**PERSONA 2 - Escola Teste (Admin + Instructor + Student)**
- Tenant: escola-teste
- Admin: admin@escola-teste.com
- Instructor: professor@escola-teste.com
- Student: aluno1@escola-teste.com

**PERSONA 3 - Escola Premium (Admin + Students)**
- Tenant: escola-premium
- Admin: admin@escola-premium.com
- Students: aluno1@escola-premium.com, aluno2@escola-premium.com

---

## 🎯 MÓDULO 1: SISTEMA CENTRAL (LANDLORD)

### TESTE 1.1: Landing Page Central
**Objetivo:** Validar página inicial do SaaS

**Passos:**
1. Acessar: `http://saas-gamificacao.local:8000`
2. Verificar exibição da landing page
3. Verificar planos exibidos (TESTE, BÁSICO, PREMIUM, ENTERPRISE)
4. Verificar preços corretos
5. Verificar botão "Cadastrar" visível

**Resultado Esperado:**
- ✅ Página carrega sem erros
- ✅ 4 planos exibidos com preços
- ✅ Botão "Cadastrar" funcional
- ✅ Design responsivo

**Anotar:** Screenshots da landing page

---

### TESTE 1.2: Cadastro de Novo Tenant (Plano Teste)
**Objetivo:** Criar tenant completo via wizard de cadastro

#### STEP 1: Dados da Empresa
1. Acessar: `http://saas-gamificacao.local:8000/signup`
2. Preencher:
   - Nome da Empresa: "Escola Teste Digital"
   - Email da Empresa: admin@escola-teste.com
   - Nome do Admin: "João Silva"
   - Telefone: (11) 98765-4321
   - Plano: TESTE
   - Setor: Educação
   - Usuários Esperados: 1-10
3. Clicar "Próximo"

**Resultado Esperado:**
- ✅ Validação de campos funciona
- ✅ Redirect para STEP 2

#### STEP 2: Configuração do Tenant
1. Preencher:
   - Nome do Tenant: "Escola Teste"
   - Slug: `escola-teste` (verificar disponibilidade)
   - Descrição: "Escola de testes"
   - Cor Primária: #3B82F6 (azul)
2. Verificar preview do domínio: `escola-teste.saas-gamificacao.local`
3. Clicar "Próximo"

**Resultado Esperado:**
- ✅ Validação de slug em tempo real
- ✅ Slug único verificado
- ✅ Preview do domínio correto
- ✅ Redirect para STEP 3

#### STEP 3: Pagamento (Pulado para TESTE)
**Resultado Esperado:**
- ✅ Step pulado automaticamente para plano TESTE
- ✅ Redirect direto para STEP 4

#### STEP 4: Confirmação e Criação
1. Revisar dados preenchidos
2. Clicar "Criar Plataforma"
3. Aguardar processo de criação (progress bar)
4. Verificar mensagem de sucesso
5. Anotar credenciais exibidas:
   - Email: admin@escola-teste.com
   - Senha Temporária: temporary123
   - URL: http://escola-teste.saas-gamificacao.local:8000

**Resultado Esperado:**
- ✅ Progress bar funciona (10% → 100%)
- ✅ Mensagem de sucesso exibida
- ✅ Credenciais corretas mostradas
- ✅ Link de acesso funcional

**Anotar:**
- Tempo de criação do tenant
- Credenciais geradas
- Screenshots de cada etapa

---

### TESTE 1.3: Login Central e Dashboard
**Objetivo:** Acessar painel central de administração

**Pré-requisito:** Criar usuário central no banco

```bash
# Executar no terminal
php artisan tinker

# Criar super admin
\App\Models\User::create([
    'name' => 'Super Admin',
    'email' => 'superadmin@saas.com',
    'password' => Hash::make('senha123'),
    'role' => 'admin',
    'email_verified_at' => now(),
    'tenant_id' => null
]);
```

**Passos:**
1. Acessar: `http://saas-gamificacao.local:8000/central-login`
2. Login:
   - Email: superadmin@saas.com
   - Senha: senha123
3. Acessar Dashboard Central: `/central/dashboard`
4. Verificar estatísticas:
   - Total de tenants
   - Tenants ativos
   - Receita mensal estimada

**Resultado Esperado:**
- ✅ Login bem-sucedido
- ✅ Redirect para dashboard central
- ✅ Estatísticas exibidas corretamente
- ✅ Tenant criado aparece na contagem

---

### TESTE 1.4: Gestão de Tenants
**Objetivo:** Gerenciar tenants criados

**Passos:**
1. No dashboard central, acessar: `/central/tenants`
2. Verificar listagem de tenants
3. Clicar no tenant "escola-teste"
4. Verificar detalhes:
   - Nome, slug, plano
   - Limites (max_users, max_courses)
   - Status (ativo/inativo)
5. Testar botão "Impersonate" (acessar como admin do tenant)

**Resultado Esperado:**
- ✅ Listagem de tenants correta
- ✅ Detalhes completos exibidos
- ✅ Impersonate funciona (acessa tenant como admin)

---

### TESTE 1.5: Billing e Contratos
**Objetivo:** Validar gestão de planos e preços

**Passos:**
1. Acessar: `/central/billing`
2. Verificar preços de catálogo dos planos
3. Verificar contratos ativos
4. Testar edição de preço de um plano
5. Verificar impacto em novos cadastros

**Resultado Esperado:**
- ✅ Preços exibidos corretamente
- ✅ Contratos listados
- ✅ Edição de preço funciona
- ✅ Novos tenants usam preço atualizado

---

## 🏫 MÓDULO 2: TENANT - ADMINISTRADOR

### TESTE 2.1: Primeiro Acesso e Troca de Senha
**Objetivo:** Validar sistema de senhas temporárias

**Passos:**
1. Acessar: `http://escola-teste.saas-gamificacao.local:8000`
2. Fazer login:
   - Email: admin@escola-teste.com
   - Senha: temporary123
3. Verificar redirect automático para `/password/change`
4. Preencher:
   - Senha Atual: temporary123
   - Nova Senha: Admin@123456
   - Confirmar Senha: Admin@123456
5. Submeter formulário
6. Verificar redirect para dashboard

**Resultado Esperado:**
- ✅ Login com senha temporária funciona
- ✅ Redirect automático para troca de senha
- ✅ Middleware bloqueia acesso a outras páginas
- ✅ Senha atualizada com sucesso
- ✅ Redirect para dashboard após troca
- ✅ password_is_temporary = false no banco

**Anotar:** Fluxo completo de troca de senha

---

### TESTE 2.2: Dashboard do Administrador
**Objetivo:** Validar métricas e estatísticas

**Passos:**
1. Verificar estatísticas gerais:
   - Total de usuários (deve ser 1 - admin)
   - Total de cursos (deve ser 0)
   - Total de atividades (deve ser 0)
   - Total de badges (deve ser 0)
2. Verificar gráficos:
   - Crescimento de usuários (30 dias)
   - Matrículas (30 dias)
   - Pontos distribuídos
3. Verificar seções vazias (ainda sem dados)

**Resultado Esperado:**
- ✅ Dashboard carrega sem erros
- ✅ Estatísticas corretas (zeradas ou mínimas)
- ✅ Gráficos renderizam (mesmo vazios)
- ✅ Design responsivo

---

### TESTE 2.3: CRUD de Usuários - Criar Instructor
**Objetivo:** Criar usuário instrutor

**Passos:**
1. Acessar: `/admin/users/create`
2. Preencher:
   - Nome: Professor João
   - Email: professor@escola-teste.com
   - Role: Instructor
3. Submeter formulário
4. Verificar mensagem de sucesso
5. Verificar na listagem `/admin/users`
6. Anotar senha temporária gerada

**Resultado Esperado:**
- ✅ Formulário valida campos
- ✅ Usuário criado com tenant_id correto
- ✅ Senha temporária gerada automaticamente
- ✅ Email de convite enviado (se configurado)
- ✅ Usuário aparece na listagem

**Validar no Banco:**
```sql
SELECT id, name, email, role, tenant_id, password_is_temporary
FROM users
WHERE email = 'professor@escola-teste.com';
```

---

### TESTE 2.4: CRUD de Usuários - Criar Students
**Objetivo:** Criar múltiplos alunos

**Passos:**
1. Criar Aluno 1:
   - Nome: Maria Santos
   - Email: aluno1@escola-teste.com
   - Role: Student
2. Criar Aluno 2:
   - Nome: Pedro Oliveira
   - Email: aluno2@escola-teste.com
   - Role: Student
3. Criar Aluno 3:
   - Nome: Ana Silva
   - Email: aluno3@escola-teste.com
   - Role: Student
4. Verificar listagem com todos os usuários

**Resultado Esperado:**
- ✅ 3 alunos criados com sucesso
- ✅ Cada um com senha temporária única
- ✅ tenant_id correto para todos
- ✅ Total de usuários = 5 (1 admin + 1 instructor + 3 students)

---

### TESTE 2.5: CRUD de Badges
**Objetivo:** Criar badges para gamificação

**Passos:**
1. Acessar: `/admin/badges/create`

**Badge 1 - Iniciante:**
- Nome: Iniciante
- Descrição: Complete sua primeira atividade
- Tipo: completion
- Critério: { "type": "completion", "target_value": 1 }
- Pontos: 10
- Ícone: 🏅
- Cor: #FFD700
- Status: Ativo

**Badge 2 - Estudioso:**
- Nome: Estudioso
- Descrição: Acumule 100 pontos
- Tipo: points
- Critério: { "type": "points", "target_value": 100 }
- Pontos: 50
- Ícone: 📚
- Cor: #4CAF50
- Status: Ativo

**Badge 3 - Mestre:**
- Nome: Mestre
- Descrição: Complete 10 atividades
- Tipo: completion
- Critério: { "type": "completion", "target_value": 10 }
- Pontos: 100
- Ícone: 👑
- Cor: #9C27B0
- Status: Ativo

2. Verificar listagem de badges
3. Testar edição de um badge
4. Testar desativação (is_active = false)

**Resultado Esperado:**
- ✅ 3 badges criados com sucesso
- ✅ Critérios em JSON válidos
- ✅ tenant_id correto
- ✅ Listagem exibe todos os badges

---

## 👨‍🏫 MÓDULO 3: TENANT - INSTRUCTOR

### TESTE 3.1: Login do Instructor e Dashboard
**Objetivo:** Acessar como instrutor

**Passos:**
1. Logout do admin
2. Login como instructor:
   - Email: professor@escola-teste.com
   - Senha temporária: (anotar a gerada)
3. Trocar senha:
   - Nova Senha: Prof@123456
4. Verificar redirect para `/instructor/dashboard`
5. Explorar dashboard do instrutor

**Resultado Esperado:**
- ✅ Login funciona com senha temporária
- ✅ Troca de senha obrigatória
- ✅ Dashboard de instrutor carrega
- ✅ Menus específicos de instrutor visíveis

---

### TESTE 3.2: Criar Curso Manualmente
**Objetivo:** Criar curso completo sem IA

**Passos:**
1. Acessar: `/instructor/courses/create`
2. Preencher:
   - Título: Introdução à Programação
   - Descrição: Aprenda os fundamentos da programação
   - Categoria: Tecnologia
   - Nível: Iniciante
   - Status: Rascunho
3. Salvar curso
4. Verificar na listagem de cursos

**Resultado Esperado:**
- ✅ Curso criado com instructor_id correto
- ✅ tenant_id correto
- ✅ Status = draft
- ✅ Aparece na listagem

---

### TESTE 3.3: Criar Atividades para o Curso
**Objetivo:** Adicionar atividades sequenciais

#### Atividade 1 - Leitura (Lição 1)
1. Acessar curso → Atividades → Nova Atividade
2. Preencher:
   - Tipo: Reading
   - Título: O que é Programação?
   - Descrição: Introdução aos conceitos básicos
   - Conteúdo: (texto longo explicativo)
   - Pontos: 10
   - Ordem: 1
   - Duração: 15 minutos
3. Salvar

#### Atividade 2 - Quiz (Quiz 1)
1. Nova Atividade
2. Preencher:
   - Tipo: Quiz
   - Título: Quiz - Conceitos Básicos
   - Descrição: Teste seus conhecimentos
   - Pontos: 20
   - Ordem: 2
   - Perguntas:
     ```json
     {
       "questions": [
         {
           "question": "O que é uma variável?",
           "options": [
             "Um espaço na memória",
             "Um tipo de loop",
             "Uma função",
             "Um operador"
           ],
           "correct": 0
         },
         {
           "question": "Qual a função do IF?",
           "options": [
             "Repetir código",
             "Tomar decisões",
             "Declarar variáveis",
             "Imprimir texto"
           ],
           "correct": 1
         }
       ]
     }
     ```
3. Salvar

#### Atividade 3 - Exercício (Assignment 1)
1. Nova Atividade
2. Preencher:
   - Tipo: Assignment
   - Título: Exercício Prático - Primeiro Programa
   - Descrição: Escreva um programa que exibe "Olá Mundo"
   - Instruções: (detalhadas)
   - Pontos: 30
   - Ordem: 3
3. Salvar

**Resultado Esperado:**
- ✅ 3 atividades criadas
- ✅ Ordem sequencial (1, 2, 3)
- ✅ Tipos diferentes funcionam
- ✅ JSON de quiz válido

---

### TESTE 3.4: Publicar Curso
**Objetivo:** Tornar curso disponível para alunos

**Passos:**
1. Acessar curso criado
2. Clicar em "Editar"
3. Alterar status de "Rascunho" para "Publicado"
4. Salvar
5. Verificar na listagem de cursos
6. Fazer logout

**Resultado Esperado:**
- ✅ Status alterado para published
- ✅ Curso agora visível para alunos
- ✅ Badge "Publicado" aparece

---

### TESTE 3.5: Criar Curso com EduAI (Opcional - requer API Gemini)
**Objetivo:** Testar geração de curso com IA

**Pré-requisito:** Configurar `GEMINI_API_KEY` no `.env`

**Passos:**
1. Acessar: `/eduai`
2. Upload de PDF ou documento
3. Aguardar processamento
4. Revisar curso gerado:
   - Título
   - Descrição
   - Atividades auto-geradas
   - Badges sugeridos
5. Salvar ou descartar
6. Publicar se aprovado

**Resultado Esperado:**
- ✅ Upload funciona
- ✅ Gemini processa e retorna JSON
- ✅ Curso gerado corretamente
- ✅ Atividades fazem sentido com conteúdo
- ✅ Salvar curso no banco funciona

**Anotar:** Qualidade da geração de IA

---

## 🎓 MÓDULO 4: TENANT - STUDENT

### TESTE 4.1: Login do Aluno e Dashboard
**Objetivo:** Acessar como estudante

**Passos:**
1. Acessar: `http://escola-teste.saas-gamificacao.local:8000`
2. Login:
   - Email: aluno1@escola-teste.com
   - Senha temporária: (usar a gerada)
3. Trocar senha:
   - Nova Senha: Aluno@123
4. Verificar redirect para `/student/dashboard`
5. Explorar dashboard:
   - Total de pontos (deve ser 0)
   - Badges (deve ser 0)
   - Cursos ativos (deve ser 0)
   - Ranking (deve ser último)
   - Streak (deve ser 0)

**Resultado Esperado:**
- ✅ Login funciona
- ✅ Troca de senha obrigatória
- ✅ Dashboard carrega com dados zerados
- ✅ Interface limpa e intuitiva

---

### TESTE 4.2: Catálogo de Cursos e Matrícula
**Objetivo:** Visualizar e matricular em curso

**Passos:**
1. Acessar: `/student/courses`
2. Verificar curso "Introdução à Programação" na lista
3. Clicar no card do curso
4. Verificar detalhes:
   - Título, descrição
   - Instrutor: Professor João
   - Número de atividades: 3
   - Status: Publicado
5. Clicar em "Matricular-se"
6. Verificar mensagem de sucesso
7. Voltar para dashboard
8. Verificar "Cursos Ativos" = 1

**Resultado Esperado:**
- ✅ Curso aparece no catálogo
- ✅ Detalhes corretos exibidos
- ✅ Matrícula criada com tenant_id correto
- ✅ enrolled_at = now()
- ✅ Dashboard atualiza contagem

---

### TESTE 4.3: Sistema de Progressão - Atividade 1 (Leitura)
**Objetivo:** Completar primeira atividade

**Passos:**
1. Acessar curso matriculado
2. Ver lista de atividades:
   - Atividade 1: O que é Programação? ✅ (desbloqueada)
   - Atividade 2: Quiz - Conceitos Básicos 🔒 (bloqueada)
   - Atividade 3: Exercício Prático 🔒 (bloqueada)
3. Clicar na Atividade 1
4. Ler conteúdo completo
5. Rolar até o final
6. Clicar em "Marcar como Concluída"
7. Verificar:
   - Pontos ganhos: +10
   - Badge "Iniciante" conquistado automaticamente
   - Notificação de conquista
   - Atividade 2 agora desbloqueada

**Resultado Esperado:**
- ✅ Leitura exibe conteúdo completo
- ✅ Botão "Concluir" visível
- ✅ UserActivity criada com completed_at
- ✅ Pontos somados em users.total_points
- ✅ Registro em points table
- ✅ Badge "Iniciante" concedido (1 atividade)
- ✅ Próxima atividade desbloqueada
- ✅ Progresso do curso atualizado (33%)

**Validar no Banco:**
```sql
-- UserActivity
SELECT * FROM user_activities WHERE user_id = (SELECT id FROM users WHERE email = 'aluno1@escola-teste.com');

-- Pontos
SELECT * FROM points WHERE user_id = (SELECT id FROM users WHERE email = 'aluno1@escola-teste.com');

-- Badge
SELECT * FROM user_badges WHERE user_id = (SELECT id FROM users WHERE email = 'aluno1@escola-teste.com');

-- Total de pontos
SELECT total_points FROM users WHERE email = 'aluno1@escola-teste.com';
```

---

### TESTE 4.4: Sistema de Progressão - Atividade 2 (Quiz)
**Objetivo:** Completar quiz e validar pontuação

**Passos:**
1. Voltar para curso
2. Clicar na Atividade 2 (agora desbloqueada)
3. Ver quiz:
   - Pergunta 1: O que é uma variável?
   - Pergunta 2: Qual a função do IF?
4. Responder:
   - Pergunta 1: Opção 0 (correta)
   - Pergunta 2: Opção 1 (correta)
5. Submeter quiz
6. Verificar resultado:
   - Score: 2/2 (100%)
   - Pontos ganhos: 20
   - Mensagem de parabéns
7. Verificar:
   - Total de pontos agora: 30 (10 + 20)
   - Atividade 3 desbloqueada
   - Progresso do curso: 66%

**Resultado Esperado:**
- ✅ Quiz renderiza perguntas
- ✅ Seleção de respostas funciona
- ✅ Cálculo de score correto
- ✅ Pontos concedidos apenas se >= 70%
- ✅ UserActivity atualizada com score
- ✅ Próxima atividade desbloqueada

**Testar Cenário de Falha:**
1. Criar outro aluno (aluno2)
2. Matricular no mesmo curso
3. Fazer quiz errando todas
4. Verificar:
   - Score: 0/2 (0%)
   - Pontos ganhos: 0
   - Mensagem: "Você precisa de 70% para ganhar pontos"
   - Atividade marcada como concluída mesmo sem pontos
   - Próxima atividade desbloqueada (progressão não depende de nota)

---

### TESTE 4.5: Sistema de Progressão - Atividade 3 (Exercício)
**Objetivo:** Completar exercício prático

**Passos:**
1. Voltar para curso
2. Clicar na Atividade 3
3. Ler instruções do exercício
4. Preencher textarea com resposta:
   ```
   print("Olá Mundo")
   ```
5. Clicar em "Enviar Exercício"
6. Verificar:
   - Pontos ganhos: 30
   - Total de pontos: 60
   - Progresso do curso: 100%
   - Curso marcado como completo
   - Mensagem de conclusão do curso

**Resultado Esperado:**
- ✅ Exercício aceita texto longo
- ✅ Validação de mínimo de caracteres
- ✅ Pontos concedidos
- ✅ UserActivity completa
- ✅ Progresso 100%
- ✅ CourseEnrollment.completed_at preenchido

---

### TESTE 4.6: Verificar Badges Automáticos
**Objetivo:** Validar sistema de conquista de badges

**Passos:**
1. Acessar: `/student/badges`
2. Verificar badges conquistados:
   - ✅ Iniciante (1 atividade completa)
   - ❌ Estudioso (100 pontos - faltam 40)
   - ❌ Mestre (10 atividades - faltam 7)
3. Verificar progresso de cada badge
4. Verificar badges disponíveis

**Resultado Esperado:**
- ✅ Badge "Iniciante" aparece como conquistado
- ✅ Outros badges mostram progresso (60/100 pontos)
- ✅ Interface mostra porcentagem de conclusão
- ✅ Badges inativos não aparecem

---

### TESTE 4.7: Leaderboard
**Objetivo:** Validar ranking entre alunos

**Pré-requisito:** Fazer aluno2 e aluno3 completarem atividades

**Passos:**
1. Acessar: `/student/leaderboard`
2. Verificar ranking:
   - 1º Maria Santos (aluno1) - 60 pontos
   - 2º Pedro Oliveira (aluno2) - X pontos
   - 3º Ana Silva (aluno3) - Y pontos
3. Verificar estatísticas gerais:
   - Total de estudantes
   - Média de pontos
   - Top score
4. Verificar destaque do usuário atual no ranking

**Resultado Esperado:**
- ✅ Ranking ordenado por total_points DESC
- ✅ Apenas estudantes do tenant correto
- ✅ Posição do usuário destacada
- ✅ Estatísticas corretas

---

### TESTE 4.8: Atividades Recentes e Notificações
**Objetivo:** Validar feed de atividades

**Passos:**
1. Voltar para `/student/dashboard`
2. Verificar seção "Atividades Recentes"
3. Deve mostrar:
   - ✅ Completou: Exercício Prático - 30 pontos (X min atrás)
   - ✅ Completou: Quiz - Conceitos Básicos - 20 pontos
   - ✅ Completou: O que é Programação? - 10 pontos
   - 🏅 Conquistou badge: Iniciante
4. Verificar ordem cronológica (mais recente primeiro)

**Resultado Esperado:**
- ✅ Feed exibe atividades corretas
- ✅ Ordem cronológica
- ✅ Pontos corretos
- ✅ Badges aparecem no feed

---

## 🔒 MÓDULO 5: ISOLAMENTO MULTI-TENANT

### TESTE 5.1: Criar Segundo Tenant
**Objetivo:** Criar tenant separado para testar isolamento

**Passos:**
1. Logout de todos os usuários
2. Acessar: `http://saas-gamificacao.local:8000/signup`
3. Criar novo tenant:
   - Nome: Escola Premium
   - Slug: escola-premium
   - Plano: Premium
   - Admin: admin@escola-premium.com
4. Completar cadastro
5. Fazer login no novo tenant

**Resultado Esperado:**
- ✅ Segundo tenant criado com UUID diferente
- ✅ Domínio: escola-premium.saas-gamificacao.local
- ✅ Banco de dados único, tenant_id diferente

---

### TESTE 5.2: Validar Isolamento de Dados
**Objetivo:** CRÍTICO - Garantir que tenants não veem dados uns dos outros

#### Teste A: Isolamento de Usuários
**Passos:**
1. Login em escola-premium como admin
2. Acessar `/admin/users`
3. Verificar listagem de usuários

**Resultado Esperado:**
- ✅ APENAS usuários do tenant escola-premium aparecem
- ❌ Usuários de escola-teste NÃO devem aparecer
- ✅ Filtro WHERE tenant_id funciona

**Validar no Banco:**
```sql
-- Buscar tenant_ids
SELECT id, slug FROM tenants;

-- Verificar users do tenant 1
SELECT name, email, tenant_id FROM users WHERE tenant_id = 'UUID_TENANT_1';

-- Verificar users do tenant 2
SELECT name, email, tenant_id FROM users WHERE tenant_id = 'UUID_TENANT_2';
```

#### Teste B: Isolamento de Cursos
**Passos:**
1. Criar curso em escola-premium
2. Login em escola-teste
3. Verificar catálogo de cursos

**Resultado Esperado:**
- ✅ Curso de escola-premium NÃO aparece em escola-teste
- ✅ Apenas cursos com tenant_id correto aparecem

#### Teste C: Isolamento de Pontos e Badges
**Passos:**
1. Verificar leaderboard em cada tenant
2. Verificar se alunos de outro tenant aparecem

**Resultado Esperado:**
- ✅ Leaderboard mostra APENAS alunos do próprio tenant
- ✅ Badges são específicos de cada tenant

---

### TESTE 5.3: Tentar Acessar Dados de Outro Tenant (Security Test)
**Objetivo:** CRÍTICO - Validar segurança contra acesso indevido

#### Teste A: Manipulação de URL
**Passos:**
1. Login em escola-teste
2. Encontrar ID de curso em escola-teste (ex: curso_id = 1)
3. Logout
4. Login em escola-premium
5. Tentar acessar manualmente:
   - `/student/courses/1` (curso do outro tenant)

**Resultado Esperado:**
- ❌ Deve retornar erro 403/404
- ❌ NÃO deve mostrar curso de outro tenant
- ✅ Middleware/Policy bloqueia acesso

#### Teste B: Manipulação de Session/Cookie
**Passos:**
1. Login em escola-teste
2. Copiar cookies da sessão
3. Trocar domínio para escola-premium
4. Tentar usar cookies de outro tenant

**Resultado Esperado:**
- ❌ Sessão inválida
- ✅ Redirect para login
- ✅ Contexto de tenant validado

---

### TESTE 5.4: Impersonation do Central
**Objetivo:** Validar que super admin pode acessar qualquer tenant

**Passos:**
1. Login no painel central: `http://saas-gamificacao.local:8000/central-login`
   - Email: superadmin@saas.com
   - Senha: senha123
2. Acessar: `/central/tenants`
3. Selecionar tenant "escola-teste"
4. Clicar em "Impersonate"
5. Verificar:
   - Redirect para tenant
   - Logado como admin do tenant
   - Banner indicando impersonation ativa
6. Testar funcionalidades como admin do tenant
7. Clicar em "Sair da Impersonation"
8. Verificar:
   - Retorno ao painel central
   - Logout do tenant

**Resultado Esperado:**
- ✅ Impersonation funciona
- ✅ Token gerado corretamente
- ✅ Acesso total ao tenant
- ✅ Saída limpa da impersonation

---

## 📊 MÓDULO 6: TESTES DE LIMITES E VALIDAÇÕES

### TESTE 6.1: Limites de Plano - Max Users
**Objetivo:** Validar limites de usuários por plano

**Contexto:** Tenant escola-teste está no plano TESTE (max_users = 1)

**Passos:**
1. Login em escola-teste como admin
2. Tentar criar 2º usuário
3. Verificar se sistema bloqueia ou permite

**Resultado Esperado:**
- ⚠️ Se não validado: Permitirá criar mais usuários
- ✅ Se validado: Bloqueará com mensagem "Limite de usuários atingido"

**Anotar:** Se validação existe ou não

---

### TESTE 6.2: Limites de Plano - Max Courses
**Objetivo:** Validar limites de cursos

**Contexto:** Plano TESTE (max_courses = 1)

**Passos:**
1. Login como instructor em escola-teste
2. Já existe 1 curso criado
3. Tentar criar 2º curso
4. Verificar se sistema bloqueia

**Resultado Esperado:**
- ⚠️ Se não validado: Permitirá criar mais cursos
- ✅ Se validado: Bloqueará com mensagem

**Anotar:** Se validação existe ou não

---

### TESTE 6.3: Limites de Plano - Storage
**Objetivo:** Validar limites de armazenamento

**Contexto:** Plano TESTE (max_storage_mb = 50)

**Passos:**
1. Fazer upload de material de 60MB
2. Verificar se sistema bloqueia

**Resultado Esperado:**
- ⚠️ Se não validado: Permitirá upload
- ✅ Se validado: Bloqueará com mensagem

---

### TESTE 6.4: Validação de Dados - Formulários
**Objetivo:** Testar validações de entrada

#### Teste A: Criar Usuário com Email Inválido
**Passos:**
1. Tentar criar usuário com email: "teste@invalido"
2. Verificar mensagem de erro

**Resultado Esperado:**
- ✅ Validação de email funciona
- ✅ Mensagem clara de erro

#### Teste B: Criar Curso com Campos Vazios
**Passos:**
1. Tentar criar curso sem preencher título
2. Verificar mensagem de erro

**Resultado Esperado:**
- ✅ Validação de required funciona
- ✅ Formulário não submete

#### Teste C: Slug Duplicado
**Passos:**
1. Tentar criar tenant com slug já existente
2. Verificar se sistema bloqueia

**Resultado Esperado:**
- ✅ Validação unique funciona
- ✅ Mensagem: "Slug já em uso"

---

## 🎨 MÓDULO 7: UX/UI E RESPONSIVIDADE

### TESTE 7.1: Responsividade Mobile
**Objetivo:** Validar interface em diferentes resoluções

**Passos:**
1. Redimensionar navegador para:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
2. Navegar por:
   - Landing page
   - Dashboard admin
   - Dashboard student
   - Catálogo de cursos
   - Quiz
3. Verificar:
   - Menus responsivos
   - Tabelas adaptativas
   - Botões acessíveis
   - Textos legíveis

**Resultado Esperado:**
- ✅ Layout adapta em todas as resoluções
- ✅ Funcionalidades acessíveis em mobile
- ✅ Sem overflow horizontal
- ✅ Tailwind CSS responsivo funciona

---

### TESTE 7.2: Acessibilidade
**Objetivo:** Validar acessibilidade básica

**Passos:**
1. Navegar usando TAB
2. Verificar foco visível em elementos
3. Testar leitor de tela (NVDA/JAWS)
4. Verificar contraste de cores
5. Verificar labels em formulários

**Resultado Esperado:**
- ✅ Navegação por teclado funciona
- ✅ Foco visível em todos os elementos
- ✅ Labels descritivos
- ⚠️ Contraste pode precisar ajustes

---

### TESTE 7.3: Feedback Visual
**Objetivo:** Validar feedback ao usuário

**Passos:**
1. Testar operações:
   - Criar usuário (loading + sucesso)
   - Login (loading + redirect)
   - Completar atividade (animação + notificação)
   - Ganhar badge (modal/notificação)
2. Verificar mensagens de erro
3. Verificar mensagens de sucesso
4. Verificar estados de loading

**Resultado Esperado:**
- ✅ Loading spinners aparecem
- ✅ Mensagens de sucesso em verde
- ✅ Mensagens de erro em vermelho
- ✅ Animações suaves (Inertia.js)

---

## 🐛 MÓDULO 8: TESTES DE EDGE CASES

### TESTE 8.1: Concorrência
**Objetivo:** Testar cenários de uso simultâneo

**Passos:**
1. Abrir 2 navegadores diferentes
2. Login com mesmo usuário em ambos
3. Completar atividade no navegador 1
4. Atualizar dashboard no navegador 2
5. Verificar sincronização

**Resultado Esperado:**
- ✅ Pontos atualizam em ambos
- ✅ Sem duplicação de registros
- ⚠️ Pode precisar refresh manual

---

### TESTE 8.2: Dados Inválidos
**Objetivo:** Testar robustez contra dados malformados

#### Teste A: Quiz com JSON Inválido
**Passos:**
1. Criar atividade quiz
2. Inserir JSON malformado no content
3. Tentar salvar
4. Se salvar, tentar visualizar como aluno

**Resultado Esperado:**
- ✅ Validação de JSON no backend
- ✅ Mensagem de erro clara
- ⚠️ Se passar, deve tratar gracefully no frontend

#### Teste B: Upload de Arquivo Malicioso
**Passos:**
1. Tentar upload de arquivo .exe
2. Verificar se sistema bloqueia

**Resultado Esperado:**
- ✅ Apenas tipos permitidos (PDF, DOC, etc)
- ✅ Validação de MIME type

---

### TESTE 8.3: Performance
**Objetivo:** Validar performance em cenários pesados

**Passos:**
1. Criar 50 usuários (script/seeder)
2. Criar 20 cursos
3. Criar 100 atividades
4. Acessar dashboard admin
5. Medir tempo de carregamento
6. Verificar queries no Laravel Debugbar

**Resultado Esperado:**
- ⚠️ Tempo < 3 segundos para dashboard
- ⚠️ Identificar N+1 queries
- ⚠️ Pode precisar otimização

---

## 📝 TEMPLATE DE REGISTRO DE BUGS

Para cada bug encontrado, registre:

```markdown
## BUG #[número]

**Módulo:** [Central/Admin/Instructor/Student]
**Severidade:** [Crítica/Alta/Média/Baixa]
**Prioridade:** [P0/P1/P2/P3]

**Descrição:**
[Descrever o bug claramente]

**Passos para Reproduzir:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Resultado Esperado:**
[O que deveria acontecer]

**Resultado Atual:**
[O que está acontecendo]

**Screenshots:**
[Anexar prints]

**Ambiente:**
- Browser: [Chrome/Firefox/Edge]
- Tenant: [escola-teste/escola-premium]
- User: [admin@...]

**Logs:**
[Colar erros do console/Laravel logs]

**SQL para Verificar:**
```sql
[Queries para debug]
```

**Arquivo/Linha:**
[Se identificado]
```

---

## ✅ CHECKLIST FINAL DE TESTES

### Funcionalidades Core
- [ ] Cadastro de tenant funciona
- [ ] Login central funciona
- [ ] Login tenant funciona
- [ ] Senhas temporárias funcionam
- [ ] CRUD de usuários funciona
- [ ] CRUD de cursos funciona
- [ ] CRUD de atividades funciona
- [ ] CRUD de badges funciona

### Gamificação
- [ ] Sistema de pontos funciona
- [ ] Badges automáticos funcionam
- [ ] Leaderboard funciona
- [ ] Progressão sequencial funciona
- [ ] Streak calcula corretamente

### Multi-Tenant
- [ ] Isolamento de dados funciona
- [ ] tenant_id correto em todas as tabelas
- [ ] Não vaza dados entre tenants
- [ ] Impersonation funciona
- [ ] Domínios funcionam

### Segurança
- [ ] Autenticação robusta
- [ ] Autorização por roles funciona
- [ ] CSRF protection ativo
- [ ] Sanitização de inputs
- [ ] Validação de uploads

### Performance
- [ ] Dashboard carrega < 3s
- [ ] Queries otimizadas (sem N+1)
- [ ] Eager loading configurado
- [ ] Cache implementado (onde necessário)

### UX/UI
- [ ] Responsivo em mobile
- [ ] Feedback visual claro
- [ ] Mensagens de erro úteis
- [ ] Loading states visíveis
- [ ] Navegação intuitiva

---

## 📊 RELATÓRIO FINAL

Ao finalizar os testes, criar documento:

### Resumo Executivo
- Total de testes executados: ___
- Testes bem-sucedidos: ___
- Bugs encontrados: ___
- Bugs críticos: ___

### Bugs Críticos (Bloqueadores)
[Lista de bugs P0 que impedem uso]

### Bugs Importantes (Corrigir antes de produção)
[Lista de bugs P1]

### Melhorias Sugeridas
[Lista de melhorias não críticas]

### Aprovação para Produção
- [ ] Sim - Sistema está pronto
- [ ] Não - Necessita correções críticas
- [ ] Condicional - Pronto se bugs P0 corrigidos

---

**Boa sorte nos testes! 🚀**
**Qualquer dúvida, consulte a ANALISE_SISTEMA_COMPLETA.md**
