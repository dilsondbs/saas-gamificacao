# 🎭 Roteiro Completo de Teste por Personas - SaaS Gamificação

**Data:** 31/08/2025  
**Versão:** 1.0.0  
**Objetivo:** Validar experiência do usuário para cada role/persona  

---

## 🚀 SETUP INICIAL

### 📋 Pré-requisitos
```bash
# 1. Iniciar servidor Laravel
php artisan serve --host=127.0.0.1 --port=8080

# 2. Iniciar Vite (opcional para development)
npm run dev

# 3. Verificar banco de dados ativo
php artisan migrate:status
```

### 🏗️ Preparação do Ambiente
1. **Banco Central:** `saas_gamificacao_central` ativo
2. **Tenant de Teste:** Limpar ou criar novo tenant
3. **Usuários de Teste:** Preparados para cada role
4. **Dados Mock:** Cursos e atividades de exemplo

### 🔑 Credenciais de Teste
- **Central Admin:** admin@saas-gamificacao.com / admin123
- **Tenant Admin:** admin@escola-exemplo.com / admin123  
- **Instructor:** professor@escola-exemplo.com / professor123
- **Student:** aluno@escola-exemplo.com / aluno123

---

## 👨‍💼 ROTEIRO PERSONA: SUPER ADMINISTRADOR (Central)

> **Perfil:** João Silva - CTO da SaaS Gamificação  
> **Objetivo:** Gerenciar tenants, monitorar sistema, configurar planos

### 🎯 Cenário de Uso
"Preciso criar um novo cliente (escola) na plataforma e configurar seu ambiente inicial"

### 📝 Checklist de Teste

#### ✅ **FASE 1: Acesso ao Sistema Central**
- [ ] **1.1** Acessar: `http://127.0.0.1:8080`
- [ ] **1.2** Login central: admin@saas-gamificacao.com / admin123
- [ ] **1.3** Verificar dashboard central carregando
- [ ] **1.4** Validar métricas gerais (total tenants, usuários, receita)

#### ✅ **FASE 2: Gestão de Tenants**
- [ ] **2.1** Navegar para "Tenants" no menu
- [ ] **2.2** Visualizar lista de tenants existentes
- [ ] **2.3** Clicar em "Criar Novo Tenant"
- [ ] **2.4** Preencher dados do novo tenant:
  ```
  Nome: Escola Exemplo Ltda
  Slug: escola-exemplo
  Domínio: escola-exemplo.saas-gamificacao.local
  Plano: Pro (50 usuários)
  ```
- [ ] **2.5** Criar tenant e verificar confirmação
- [ ] **2.6** Verificar tenant aparece na lista

#### ✅ **FASE 3: Configuração do Tenant**
- [ ] **3.1** Clicar em "Ver Detalhes" do tenant criado
- [ ] **3.2** Verificar informações básicas corretas
- [ ] **3.3** Configurar limites:
  - Máximo usuários: 50
  - Máximo cursos: 20
  - Storage: 1GB
- [ ] **3.4** Salvar configurações

#### ✅ **FASE 4: Impersonation/Acesso ao Tenant**
- [ ] **4.1** Clicar em "Acessar Tenant" 
- [ ] **4.2** Verificar redirecionamento para tenant
- [ ] **4.3** Confirmar contexto mudou (URL, branding)
- [ ] **4.4** Verificar admin do tenant foi criado automaticamente

### 📊 **Critérios de Sucesso**
- ✅ Tenant criado sem erros
- ✅ Configurações aplicadas corretamente  
- ✅ Acesso ao tenant funcional
- ✅ Dados isolados entre tenants

### 🔍 **Pontos de Atenção**
- Performance na criação do tenant
- Validação de dados obrigatórios
- Feedback visual durante operações
- Tratamento de erros

---

## 👨‍🏫 ROTEIRO PERSONA: ADMINISTRADOR/INSTRUCTOR

> **Perfil:** Maria Fernandes - Diretora Pedagógica  
> **Objetivo:** Criar cursos, gerenciar professores e acompanhar progresso dos alunos

### 🎯 Cenário de Uso
"Preciso criar um curso completo de 'Marketing Digital' com materiais e atividades gamificadas"

### 📝 Checklist de Teste

#### ✅ **FASE 1: Acesso ao Tenant**
- [ ] **1.1** Acessar: `http://escola-exemplo.saas-gamificacao.local:8080`
- [ ] **1.2** Login: admin@escola-exemplo.com / admin123
- [ ] **1.3** Verificar dashboard do tenant carregando
- [ ] **1.4** Confirmar branding específico do tenant
- [ ] **1.5** Visualizar métricas do tenant (usuários, cursos, atividade)

#### ✅ **FASE 2: Gestão de Usuários**
- [ ] **2.1** Navegar para "Usuários"
- [ ] **2.2** Criar novo professor:
  ```
  Nome: Professor João Santos
  Email: joao@escola-exemplo.com
  Role: Instructor
  ```
- [ ] **2.3** Criar novos alunos (pelo menos 3):
  ```
  Aluno 1: Ana Silva - ana@escola-exemplo.com
  Aluno 2: Pedro Costa - pedro@escola-exemplo.com  
  Aluno 3: Carla Lima - carla@escola-exemplo.com
  ```
- [ ] **2.4** Verificar emails de boas-vindas (se configurado)

#### ✅ **FASE 3: Configuração de Badges**
- [ ] **3.1** Navegar para "Badges"
- [ ] **3.2** Criar sistema de badges:
  ```
  Badge 1: 🎯 Primeira Atividade (1 atividade completa)
  Badge 2: 📚 Estudante Dedicado (3 atividades)
  Badge 3: 🏆 Expert em Marketing (100 pontos)
  Badge 4: ⭐ Curso Completo (curso 100%)
  ```
- [ ] **3.3** Configurar critérios e pontuações
- [ ] **3.4** Testar preview das badges

#### ✅ **FASE 4: Criação de Curso**
- [ ] **4.1** Navegar para "Cursos" → "Criar Curso"
- [ ] **4.2** Preencher dados do curso:
  ```
  Título: Fundamentos do Marketing Digital
  Descrição: Curso completo sobre estratégias de marketing online
  Instrutor: Professor João Santos
  Duração: 20 horas
  Nível: Iniciante
  Máx. Alunos: 30
  ```
- [ ] **4.3** Fazer upload de imagem do curso
- [ ] **4.4** Salvar e verificar curso criado

#### ✅ **FASE 5: Adição de Materiais**
- [ ] **5.1** Entrar no curso criado
- [ ] **5.2** Navegar para "Materiais"
- [ ] **5.3** Adicionar materiais:
  ```
  Material 1: Slides - Introdução ao Marketing Digital (PDF)
  Material 2: Vídeo - SEO para Iniciantes (MP4 ou link)
  Material 3: E-book - Guia de Redes Sociais (PDF)
  ```
- [ ] **5.4** Verificar upload e organização dos materiais

#### ✅ **FASE 6: Criação de Atividades**
- [ ] **6.1** Criar Quiz:
  ```
  Título: Quiz - Conceitos Básicos
  Perguntas: 5 questões múltipla escolha
  Pontuação: 50 pontos
  Tentativas: 2
  ```
- [ ] **6.2** Criar Atividade de Leitura:
  ```
  Título: Leitura - Estratégias de SEO
  Conteúdo/Link: Artigo sobre SEO
  Pontuação: 20 pontos
  Tempo estimado: 15 min
  ```
- [ ] **6.3** Criar Assignment:
  ```
  Título: Projeto - Plano de Marketing
  Descrição: Criar estratégia para produto fictício
  Pontuação: 100 pontos
  Prazo: 7 dias
  ```

#### ✅ **FASE 7: Configuração e Publicação**
- [ ] **7.1** Revisar estrutura completa do curso
- [ ] **7.2** Configurar ordem das atividades
- [ ] **7.3** Definir pré-requisitos se necessário
- [ ] **7.4** Publicar curso para alunos
- [ ] **7.5** Testar matrícula manual de alguns alunos

### 📊 **Critérios de Sucesso**
- ✅ Curso completo criado sem erros
- ✅ Materiais organizados e acessíveis
- ✅ Atividades variadas e funcionais
- ✅ Sistema de pontuação coerente

---

## 👩‍🎓 ROTEIRO PERSONA: ESTUDANTE

> **Perfil:** Ana Silva - Estudante de Marketing, 22 anos  
> **Objetivo:** Aprender marketing digital de forma engajante e acompanhar meu progresso

### 🎯 Cenário de Uso
"Quero me matricular no curso de Marketing Digital e completar todas as atividades para conquistar certificado"

### 📝 Checklist de Teste

#### ✅ **FASE 1: Primeiro Acesso**
- [ ] **1.1** Acessar: `http://escola-exemplo.saas-gamificacao.local:8080`
- [ ] **1.2** Login: ana@escola-exemplo.com / senha123
- [ ] **1.3** Verificar dashboard do aluno carregando
- [ ] **1.4** Explorar interface e navegação
- [ ] **1.5** Verificar pontuação inicial (0 pontos, 0 badges)

#### ✅ **FASE 2: Descoberta de Cursos**
- [ ] **2.1** Navegar para "Cursos Disponíveis"
- [ ] **2.2** Visualizar curso "Fundamentos do Marketing Digital"
- [ ] **2.3** Clicar em "Ver Detalhes" do curso
- [ ] **2.4** Revisar:
  - Descrição e objetivos
  - Carga horária
  - Atividades incluídas  
  - Pontuação total possível
- [ ] **2.5** Clicar em "Matricular-se"

#### ✅ **FASE 3: Exploração do Curso**
- [ ] **3.1** Acessar curso após matrícula
- [ ] **3.2** Visualizar estrutura completa:
  - Materiais disponíveis
  - Atividades pendentes
  - Progresso atual (0%)
- [ ] **3.3** Navegar pelos materiais
- [ ] **3.4** Baixar/visualizar PDFs e vídeos

#### ✅ **FASE 4: Primeira Atividade - Leitura**
- [ ] **4.1** Iniciar atividade de leitura
- [ ] **4.2** Ler conteúdo sobre SEO
- [ ] **4.3** Marcar como concluída
- [ ] **4.4** Verificar pontos ganhos (+20 pontos)
- [ ] **4.5** Conferir se conquistou badge "Primeira Atividade"

#### ✅ **FASE 5: Segunda Atividade - Quiz**
- [ ] **5.1** Iniciar quiz sobre conceitos básicos
- [ ] **5.2** Responder 5 questões
- [ ] **5.3** Ver resultado imediato
- [ ] **5.4** Verificar feedback para respostas incorretas
- [ ] **5.5** Conferir pontos ganhos (baseado em performance)
- [ ] **5.6** Verificar progresso atualizado

#### ✅ **FASE 6: Terceira Atividade - Assignment**
- [ ] **6.1** Acessar projeto de plano de marketing
- [ ] **6.2** Ler instruções detalhadamente
- [ ] **6.3** Criar documento de resposta
- [ ] **6.4** Fazer upload do arquivo
- [ ] **6.5** Submeter assignment
- [ ] **6.6** Aguardar avaliação do professor

#### ✅ **FASE 7: Acompanhamento de Progresso**
- [ ] **7.1** Verificar dashboard atualizado
- [ ] **7.2** Conferir badges conquistados
- [ ] **7.3** Visualizar pontuação total
- [ ] **7.4** Acessar "Leaderboard" e ver ranking
- [ ] **7.5** Comparar progresso com outros alunos
- [ ] **7.6** Verificar porcentagem de conclusão do curso

#### ✅ **FASE 8: Gamificação e Engajamento**
- [ ] **8.1** Explorar seção "Minhas Badges"
- [ ] **8.2** Ver badges em progresso
- [ ] **8.3** Verificar próximos objetivos
- [ ] **8.4** Testar compartilhamento de conquistas (se disponível)

### 📊 **Critérios de Sucesso**
- ✅ Matrícula simples e intuitiva
- ✅ Atividades engajantes e claras
- ✅ Feedback imediato sobre performance
- ✅ Progresso visível e motivador

---

## 📋 DOCUMENTAÇÃO DA EXPERIÊNCIA

### 🔍 **Matriz de Avaliação UX**

#### Para cada persona, documente:

| Aspecto | Pontuação (1-5) | Observações |
|---------|----------------|-------------|
| **Facilidade de Login** | | |
| **Clareza da Navegação** | | |
| **Velocidade de Carregamento** | | |
| **Intuitividade das Ações** | | |
| **Feedback Visual** | | |
| **Tratamento de Erros** | | |
| **Design Responsivo** | | |
| **Gamificação (quando aplicável)** | | |

### 🚫 **Pontos de Fricção Identificados**
```
❌ [CRÍTICO] - Descrição do problema
⚠️ [MODERADO] - Descrição do problema  
💡 [MELHORIA] - Sugestão de otimização
```

### ⭐ **Funcionalidades que Impressionam**
```
🌟 Funcionalidade X - Por que impressiona
🎯 Funcionalidade Y - Impacto na experiência
🚀 Funcionalidade Z - Diferencial competitivo
```

### 📝 **Gaps de Usabilidade**
```
🕳️ Gap 1 - O que está faltando
🕳️ Gap 2 - Como impacta o usuário
🕳️ Gap 3 - Prioridade de implementação
```

### 📊 **Score Geral por Persona**

| Persona | UX Score | Prioridade de Melhorias |
|---------|----------|------------------------|
| **Super Admin** | /100 | |
| **Instructor** | /100 | |
| **Student** | /100 | |

---

## 🎬 **Scripts de Execução**

### Windows (.bat)
```batch
# Criar arquivo: executar_testes_personas.bat
```

### Linux/Mac (.sh)  
```bash
# Criar arquivo: executar_testes_personas.sh
```

---

**📞 Suporte:** Para dúvidas durante os testes, consulte CLAUDE.md ou logs da aplicação
**⏱️ Tempo Estimado:** 2-3 horas para todos os roteiros
**👥 Recomendação:** Teste com usuários reais de cada perfil quando possível