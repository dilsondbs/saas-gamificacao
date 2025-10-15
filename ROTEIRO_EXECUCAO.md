# 🎬 ROTEIRO DE EXECUÇÃO - TESTES MANUAIS

## ⚙️ SETUP INICIAL (15 minutos)

### 1. Preparação do Ambiente
```bash
# Terminal 1 - Iniciar servidor
cd C:\xampp\htdocs\saas-gamificacao
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2 - Verificações
php artisan migrate:status
php artisan queue:monitor --max-jobs=0
```

### 2. Configurar Hosts (Windows)
```bash
# Executar como Administrador
notepad C:\Windows\System32\drivers\etc\hosts

# Adicionar linhas:
127.0.0.1 saas-gamificacao.local
127.0.0.1 escola-teste.saas-gamificacao.local
127.0.0.1 escola-manual.saas-gamificacao.local
```

### 3. URLs Principais
- **Central Landing**: http://127.0.0.1:8000/central/
- **Tenant Info**: http://127.0.0.1:8000/central/tenants-dev
- **Central Login**: http://127.0.0.1:8000/central/login
- **Signup**: http://127.0.0.1:8000/central/signup

---

## 🎯 EXECUÇÃO POR BLOCOS

### BLOCO 1: SISTEMA CENTRAL (30 minutos)

#### 1.1 - Verificação Inicial
**Tempo**: 5 min
```
✅ Acessar: http://127.0.0.1:8000/central/
✅ Verificar página inicial carrega
✅ Links funcionam corretamente
✅ Não há erros no console
```

#### 1.2 - Registro de Tenant
**Tempo**: 15 min
```
✅ Clicar "Criar Conta" → /central/signup
✅ Step 1: Escola Manual | escola-manual | admin@manual.com | Basic
✅ Step 2: Admin João Silva | senha123 | confirmar
✅ Step 3: Configurações padrão
✅ Step 4: Verificar criação bem-sucedida
✅ Anotar URL do tenant criado
```

#### 1.3 - Dashboard Central
**Tempo**: 10 min
```
✅ Login central: http://127.0.0.1:8000/central/login
✅ Verificar lista de tenants
✅ Testar impersonação (se disponível)
✅ Verificar métricas gerais
```

### BLOCO 2: ADMIN TENANT (45 minutos)

#### 2.1 - Primeiro Acesso
**Tempo**: 10 min
```
✅ Acessar: http://escola-manual.saas-gamificacao.local:8000
✅ Login com credenciais do registro
✅ Alterar senha (se obrigatório)
✅ Explorar dashboard admin
```

#### 2.2 - Criação de Usuários
**Tempo**: 15 min
```
✅ Admin → Usuários → Criar Instructor:
   Nome: Prof. Maria Santos
   Email: maria@manual.com
   Role: instructor

✅ Criar Student:
   Nome: Pedro Almeida
   Email: pedro@manual.com
   Role: student

✅ Anotar credenciais temporárias geradas
```

#### 2.3 - Configuração de Badges
**Tempo**: 20 min
```
✅ Admin → Badges → Criar:

   Badge 1:
   Nome: Primeiro Login
   Descrição: Bem-vindo ao sistema!
   Pontos: 10
   Tipo: Automático

   Badge 2:
   Nome: Curso Completo
   Descrição: Completou um curso
   Pontos: 100
   Tipo: Por conclusão

   Badge 3:
   Nome: Aluno Destaque
   Descrição: Desempenho excepcional
   Pontos: 250
   Tipo: Manual
```

### BLOCO 3: INSTRUCTOR (60 minutos)

#### 3.1 - Login e Setup
**Tempo**: 10 min
```
✅ Login como maria@manual.com
✅ Verificar dashboard instructor
✅ Explorar menu disponível
✅ Confirmar permissões corretas
```

#### 3.2 - Criar Curso Manual
**Tempo**: 25 min
```
✅ Instructor → Cursos → Criar
✅ Dados do curso:
   Título: Python para Iniciantes
   Descrição: Aprenda programação Python do zero
   Pontos conclusão: 500
   Status: Rascunho

✅ Salvar curso
✅ Publicar curso
✅ Verificar na listagem
```

#### 3.3 - Adicionar Atividades
**Tempo**: 25 min
```
✅ Acessar curso "Python para Iniciantes"
✅ Adicionar atividades em ordem:

   Atividade 1 - Leitura:
   Título: "Introdução ao Python"
   Conteúdo: Texto explicativo sobre Python
   Pontos: 50

   Atividade 2 - Quiz:
   Título: "Conceitos Básicos"
   5 questões múltipla escolha
   Pontos: 100

   Atividade 3 - Tarefa:
   Título: "Primeiro Programa"
   Descrição: Escreva um programa que imprima "Olá Mundo"
   Pontos: 150

✅ Configurar ordem de desbloqueio
✅ Verificar progressão sequencial
```

### BLOCO 4: STUDENT (45 minutos)

#### 4.1 - Primeiro Acesso
**Tempo**: 10 min
```
✅ Login como pedro@manual.com
✅ Verificar dashboard student
✅ Confirmar badge "Primeiro Login" foi concedido
✅ Verificar pontuação inicial
```

#### 4.2 - Inscrição no Curso
**Tempo**: 10 min
```
✅ Student → Cursos
✅ Ver curso "Python para Iniciantes"
✅ Realizar inscrição
✅ Verificar acesso liberado
✅ Confirmar progresso 0%
```

#### 4.3 - Progressão Completa
**Tempo**: 25 min
```
✅ Atividade 1 - Leitura:
   - Acessar e ler conteúdo
   - Marcar como concluída
   - Verificar +50 pontos

✅ Atividade 2 - Quiz:
   - Responder 5 questões
   - Submeter respostas
   - Verificar feedback
   - Confirmar +100 pontos

✅ Atividade 3 - Tarefa:
   - Ler instruções
   - Submeter resposta
   - Aguardar avaliação (se necessário)
   - Verificar +150 pontos

✅ Verificar conclusão do curso
✅ Confirmar badge "Curso Completo"
✅ Verificar total de pontos: 310 (10+50+100+150)
```

### BLOCO 5: GAMIFICAÇÃO (20 minutos)

#### 5.1 - Sistema de Pontos
**Tempo**: 10 min
```
✅ Verificar leaderboard atualizado
✅ Confirmar posição do Pedro
✅ Verificar histórico de pontos
✅ Testar diferentes visualizações
```

#### 5.2 - Badges e Conquistas
**Tempo**: 10 min
```
✅ Ver todas as badges do Pedro
✅ Verificar metadados das badges
✅ Admin conceder badge "Aluno Destaque" manualmente
✅ Verificar notificação de nova badge
```

### BLOCO 6: TESTES CRÍTICOS (30 minutos)

#### 6.1 - Isolamento de Tenants
**Tempo**: 15 min
```
✅ Criar segundo tenant via /signup
✅ Login no Tenant 1
✅ Tentar acessar URLs do Tenant 2
✅ Verificar bloqueio/redirecionamento
✅ Confirmar dados não vazam
```

#### 6.2 - Controle de Acesso
**Tempo**: 15 min
```
✅ Login como Student
✅ Tentar acessar /admin/dashboard
✅ Tentar acessar /admin/users
✅ Verificar negação de acesso
✅ Confirmar redirecionamento apropriado
```

---

## ✅ CHECKLIST DE EXECUÇÃO

### Preparação
- [ ] Servidor Laravel ativo
- [ ] Hosts configurados
- [ ] Banco de dados operacional
- [ ] Browser com console aberto

### Execução por Bloco
- [ ] **BLOCO 1** - Sistema Central (30 min)
- [ ] **BLOCO 2** - Admin Tenant (45 min)
- [ ] **BLOCO 3** - Instructor (60 min)
- [ ] **BLOCO 4** - Student (45 min)
- [ ] **BLOCO 5** - Gamificação (20 min)
- [ ] **BLOCO 6** - Testes Críticos (30 min)

### Tempo Total Estimado: **4h 30min**

---

## 📊 TEMPLATE DE EXECUÇÃO

### Dados Criados Durante o Teste:
```
TENANT:
- Nome: Escola Manual
- Slug: escola-manual
- URL: escola-manual.saas-gamificacao.local:8000
- Admin: admin@manual.com / senha123

USUÁRIOS:
- Instructor: maria@manual.com / [senha temp]
- Student: pedro@manual.com / [senha temp]

CURSO:
- Título: Python para Iniciantes
- 3 atividades configuradas
- Progressão sequencial ativa

BADGES:
- Primeiro Login (10 pts)
- Curso Completo (100 pts)
- Aluno Destaque (250 pts)
```

### Issues Encontrados:
```
[  ] Issue #1: _______________
[  ] Issue #2: _______________
[  ] Issue #3: _______________
```

### Observações:
```
_________________________________
_________________________________
_________________________________
```

---

**Executado por**: _______________
**Data**: _______________
**Duração real**: _______________
**Status final**: ✅ PASSOU | ❌ FALHOU