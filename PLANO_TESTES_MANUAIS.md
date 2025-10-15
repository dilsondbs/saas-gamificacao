# 🎯 PLANO DE TESTES MANUAIS - SaaS Gamificação

## 📋 VISÃO GERAL DO SISTEMA

### Arquitetura Multi-Tenant
- **Central**: Gerenciamento de tenants, billing, registro
- **Tenant**: Escola/organização individual com isolamento completo

### Personas de Teste
1. **Super Admin Central** - Gerencia toda a plataforma
2. **Admin Tenant** - Administra uma escola específica
3. **Instructor** - Professor que cria conteúdo
4. **Student** - Aluno que consome conteúdo

## 🚀 ROTEIRO DE EXECUÇÃO SEQUENCIAL

### FASE 1: CONFIGURAÇÃO INICIAL
```bash
# 1. Verificar se o servidor está rodando
php artisan serve --host=127.0.0.1 --port=8000

# 2. Verificar status das migrations
php artisan migrate:status

# 3. Configurar hosts (Windows)
# Adicionar no arquivo C:\Windows\System32\drivers\etc\hosts:
127.0.0.1 saas-gamificacao.local
127.0.0.1 escola-teste.saas-gamificacao.local
```

### FASE 2: SISTEMA CENTRAL (Super Admin)

#### URLs Base:
- **Central**: http://127.0.0.1:8000
- **Tenant Info**: http://127.0.0.1:8000/tenants-dev

#### T2.1 - Registro de Novo Tenant
**Objetivo**: Validar fluxo completo de criação de escola

**Passos**:
1. Acessar: http://127.0.0.1:8000
2. Clicar em "Criar Conta" ou acessar `/signup`
3. **Step 1**: Preencher dados da escola
   - Nome: "Escola Teste Manuel"
   - Slug: "escola-teste-manuel"
   - E-mail: admin@escolateste.com
   - Plano: Basic
4. **Step 2**: Dados do administrador
   - Nome completo
   - Confirmar senha
5. **Step 3**: Configurações iniciais
6. **Step 4**: Confirmação e criação

**Critérios de Sucesso**:
- [ ] Todas as etapas são concluídas sem erro
- [ ] Tenant criado com domínio funcional
- [ ] Admin recebe credenciais temporárias
- [ ] Redirecionamento para dashboard do tenant

#### T2.2 - Dashboard Central
**Objetivo**: Verificar painel de controle central

**Passos**:
1. Login como Super Admin: http://127.0.0.1:8000/central-login
2. Verificar dashboard: `/central/dashboard`
3. Listar tenants ativos
4. Verificar métricas gerais

**Critérios de Sucesso**:
- [ ] Login realizado com sucesso
- [ ] Dashboard carrega sem erros
- [ ] Lista de tenants está visível
- [ ] Métricas estão sendo exibidas

#### T2.3 - Gerenciamento de Tenants
**Objetivo**: Validar operações CRUD de tenants

**Passos**:
1. Acessar lista de tenants
2. Ver detalhes de um tenant
3. Editar configurações
4. Alterar status (ativo/inativo)
5. Testar impersonação

**Critérios de Sucesso**:
- [ ] Todas operações funcionam
- [ ] Impersonação redireciona corretamente
- [ ] Logs de atividade registrados

### FASE 3: TENANT - ADMIN ESCOLA

#### URLs Base:
- **Tenant**: http://escola-teste.saas-gamificacao.local:8000

#### T3.1 - Primeiro Acesso (Admin Tenant)
**Objetivo**: Validar setup inicial do tenant

**Passos**:
1. Acessar URL do tenant criado
2. Login com credenciais temporárias
3. Alterar senha obrigatória
4. Explorar dashboard inicial

**Critérios de Sucesso**:
- [ ] Acesso ao tenant isolado
- [ ] Mudança de senha funciona
- [ ] Dashboard admin carrega
- [ ] Isolamento de dados confirmado

#### T3.2 - Gestão de Usuários
**Objetivo**: Criar professores e alunos

**Passos**:
1. Admin → Usuários → Criar
2. Criar Instructor:
   - Nome: "Prof. João Silva"
   - Email: joao@escolateste.com
   - Role: instructor
3. Criar Student:
   - Nome: "Ana Oliveira"
   - Email: ana@escolateste.com
   - Role: student
4. Verificar envio de credenciais

**Critérios de Sucesso**:
- [ ] Usuários criados com sucesso
- [ ] Roles atribuídos corretamente
- [ ] Credenciais temporárias geradas
- [ ] E-mails enviados (se configurado)

#### T3.3 - Configuração de Badges
**Objetivo**: Criar sistema de recompensas

**Passos**:
1. Admin → Badges → Criar
2. Criar badges básicos:
   - "Primeiro Login" (automático)
   - "Curso Completo" (por conclusão)
   - "Aluno Destaque" (manual)
3. Configurar critérios
4. Ativar badges

**Critérios de Sucesso**:
- [ ] Badges criados
- [ ] Critérios configurados
- [ ] Sistema de pontos ativo

### FASE 4: TENANT - INSTRUCTOR

#### T4.1 - Login e Dashboard Instructor
**Objetivo**: Validar acesso do professor

**Passos**:
1. Login como instructor criado
2. Verificar dashboard específico
3. Explorar menu de opções
4. Verificar permissões

**Critérios de Sucesso**:
- [ ] Login realizado
- [ ] Dashboard instructor carrega
- [ ] Menus corretos visíveis
- [ ] Sem acesso a funções de admin

#### T4.2 - Criação de Curso Manual
**Objetivo**: Criar curso completo manualmente

**Passos**:
1. Instructor → Cursos → Criar
2. Preencher dados:
   - Título: "Introdução à Programação"
   - Descrição detalhada
   - Pontos por conclusão: 100
3. Salvar e publicar
4. Verificar curso na lista

**Critérios de Sucesso**:
- [ ] Curso criado
- [ ] Dados salvos corretamente
- [ ] Status publicado
- [ ] Visível na listagem

#### T4.3 - Criação de Atividades
**Objetivo**: Adicionar conteúdo ao curso

**Passos**:
1. Acessar curso criado
2. Adicionar atividades:
   - **Leitura**: "O que é programação?"
   - **Quiz**: "Conceitos básicos" (5 questões)
   - **Tarefa**: "Primeiro código"
3. Configurar ordem/progressão
4. Definir pontuação

**Critérios de Sucesso**:
- [ ] Atividades criadas
- [ ] Tipos variados funcionam
- [ ] Ordem configurada
- [ ] Pontuação definida

#### T4.4 - EduAI - Geração com IA
**Objetivo**: Testar funcionalidade de IA

**Passos**:
1. Instructor → EduAI
2. Testar geração de curso:
   - Tema: "Python Básico"
   - Nível: Iniciante
   - Duração: 4 semanas
3. Revisar conteúdo gerado
4. Salvar curso gerado

**Critérios de Sucesso**:
- [ ] Interface EduAI carrega
- [ ] Geração funciona
- [ ] Conteúdo coerente
- [ ] Salvamento funcional

### FASE 5: TENANT - STUDENT

#### T5.1 - Login e Dashboard Student
**Objetivo**: Validar experiência do aluno

**Passos**:
1. Login como student criado
2. Verificar dashboard student
3. Explorar cursos disponíveis
4. Verificar gamificação

**Critérios de Sucesso**:
- [ ] Login realizado
- [ ] Dashboard student carrega
- [ ] Cursos visíveis
- [ ] Sistema de pontos ativo

#### T5.2 - Inscrição em Curso
**Objetivo**: Validar processo de matrícula

**Passos**:
1. Student → Cursos
2. Selecionar curso disponível
3. Realizar inscrição
4. Verificar acesso ao conteúdo

**Critérios de Sucesso**:
- [ ] Inscrição realizada
- [ ] Acesso liberado
- [ ] Progresso iniciado
- [ ] Badge "Primeiro Login" concedido

#### T5.3 - Progressão no Curso
**Objetivo**: Testar fluxo de aprendizagem

**Passos**:
1. Acessar primeira atividade
2. Completar leitura
3. Fazer quiz (acertar/errar questões)
4. Submeter tarefa
5. Verificar progresso

**Critérios de Sucesso**:
- [ ] Atividades carregam
- [ ] Progressão funciona
- [ ] Pontos são atribuídos
- [ ] Badges são concedidos

#### T5.4 - Sistema de Gamificação
**Objetivo**: Validar mecânicas de jogo

**Passos**:
1. Verificar ranking/leaderboard
2. Visualizar badges conquistados
3. Acompanhar pontuação total
4. Testar notificações

**Critérios de Sucesso**:
- [ ] Leaderboard atualizado
- [ ] Badges visíveis
- [ ] Pontos corretos
- [ ] Notificações funcionam

### FASE 6: TESTES DE ISOLAMENTO

#### T6.1 - Isolamento de Dados
**Objetivo**: Confirmar separação entre tenants

**Passos**:
1. Criar segundo tenant
2. Logar em ambos alternativamente
3. Verificar que dados não "vazam"
4. Testar URLs cruzadas

**Critérios de Sucesso**:
- [ ] Dados isolados
- [ ] Sem vazamento entre tenants
- [ ] URLs protegidas
- [ ] Autenticação independente

#### T6.2 - Testes de Permissão
**Objetivo**: Validar controle de acesso

**Passos**:
1. Tentar acessar rotas sem permissão
2. Verificar middlewares
3. Testar escalação de privilégios
4. Confirmar logs de segurança

**Critérios de Sucesso**:
- [ ] Acessos negados corretamente
- [ ] Redirects apropriados
- [ ] Logs registrados
- [ ] Sem escalação possível

## 📝 CHECKLIST DE EXECUÇÃO

### Pré-requisitos
- [ ] Servidor Laravel rodando
- [ ] Banco de dados configurado
- [ ] Hosts configurados (Windows)
- [ ] E-mail configurado (opcional)

### Dados de Teste
- [ ] Super Admin Central criado
- [ ] Pelo menos 2 tenants criados
- [ ] Usuários de cada role criados
- [ ] Cursos e atividades preparados

### Cenários Críticos
- [ ] Registro completo de tenant
- [ ] Login em todos os níveis
- [ ] Criação de conteúdo
- [ ] Progressão de aluno
- [ ] Isolamento de dados
- [ ] Sistema de gamificação

### Validações de Segurança
- [ ] Autenticação multi-tenant
- [ ] Autorização por role
- [ ] Proteção CSRF
- [ ] Isolamento de sessões
- [ ] Logs de auditoria

## 🐛 LOG DE ISSUES

| ID | Severity | Descrição | Status | Assignee |
|----|----------|-----------|---------|----------|
| #001 | High | - | Open | - |
| #002 | Medium | - | Open | - |

## 🎯 MÉTRICAS DE SUCESSO

### Performance
- [ ] Tempo de carregamento < 3s
- [ ] Responsividade em mobile
- [ ] Sem erros JS no console

### Funcionalidade
- [ ] 100% dos fluxos principais funcionam
- [ ] Gamificação completamente operacional
- [ ] Multi-tenancy sem vazamentos

### Experiência do Usuário
- [ ] Interface intuitiva
- [ ] Feedback adequado em ações
- [ ] Mensagens de erro claras

---

**Executado por**: _Nome do Testador_
**Data**: _DD/MM/YYYY_
**Versão**: _1.0_
**Ambiente**: Desenvolvimento