# 🚀 Guia de Teste - Acesso aos Níveis do Sistema

## ⚡ **STATUS DOS SERVIDORES:**
- ✅ **Laravel**: `http://127.0.0.1:8080`
- ✅ **Vite**: `http://localhost:5173`
- ✅ **Multi-tenancy**: Configurado e funcionando

---

## 👥 **USUÁRIOS DE TESTE CRIADOS:**

### **Central (SaaS Admin)**
- **Email**: `admin@saas-gamificacao.com`
- **Senha**: `password`
- **Role**: `admin`

### **Tenant "escola-exemplo"**
- **Admin**: `admin@escola-exemplo.com` / `password`
- **Instrutor**: `professor@escola-exemplo.com` / `password` 
- **Aluno**: `aluno@escola-exemplo.com` / `password`

---

## 🌐 **CONFIGURAÇÃO DO ARQUIVO HOSTS (Windows)**

**Passo 1**: Abra o Notepad como **Administrador**

**Passo 2**: Abra o arquivo: `C:\Windows\System32\drivers\etc\hosts`

**Passo 3**: Adicione essas linhas no final:
```
127.0.0.1 saas-gamificacao.local
127.0.0.1 escola-teste.saas-gamificacao.local
```

**Passo 4**: Salve o arquivo

---

## 🔐 **ROTEIRO DE TESTES POR NÍVEL:**

### **1. NÍVEL CENTRAL (SaaS Admin)**
**URL**: `http://127.0.0.1:8080/login`

**Login**: `admin@saas-gamificacao.com` / `password`

**O que testar**:
- ✅ Dashboard central com visão geral
- ✅ Gerenciar tenants (escolas)  
- ✅ Configurações do SaaS
- ✅ Métricas globais

**URL após login**: `http://127.0.0.1:8080/central/dashboard`

---

### **2. NÍVEL ADMIN TENANT (Admin da Escola)**
**URL**: `http://escola-teste.saas-gamificacao.local:8080/login`

**Login**: `admin@escola-exemplo.com` / `password`

**O que testar**:
- ✅ Dashboard administrativo da escola
- ✅ Gerenciar professores e alunos
- ✅ Configurações da escola
- ✅ Relatórios e métricas

**URL após login**: `http://escola-teste.saas-gamificacao.local:8080/admin/dashboard`

---

### **3. NÍVEL INSTRUTOR (Professor)**
**URL**: `http://escola-teste.saas-gamificacao.local:8080/login`

**Login**: `professor@escola-exemplo.com` / `password`

**O que testar**:
- ✅ Dashboard do professor
- ✅ **CRIAR CURSO NORMAL**
- ✅ **🤖 PROFESSOR ASSISTENTE IA** ← PRINCIPAL NOVIDADE!
- ✅ Gerenciar alunos matriculados
- ✅ Acompanhar progresso
- ✅ Criar atividades e badges

**URLs importantes**:
- Dashboard: `http://escola-teste.saas-gamificacao.local:8080/instructor/dashboard`
- **IA Course**: `http://escola-teste.saas-gamificacao.local:8080/instructor/courses/ai/create`

**🤖 TESTE ESPECIAL - IA COURSE GENERATION**:
1. Clique em "🤖 Criar com IA"
2. Cole um texto sobre qualquer assunto (ex: história do Brasil, matemática, etc.)
3. Clique em "Ver Preview" 
4. Veja a estrutura gerada pela IA
5. Clique em "Gerar Curso com IA"
6. **NOTA**: Para funcionar completamente, precisa configurar `GEMINI_API_KEY` no `.env`

---

### **4. NÍVEL ESTUDANTE (Aluno)**
**URL**: `http://escola-teste.saas-gamificacao.local:8080/login`

**Login**: `aluno@escola-exemplo.com` / `password`

**O que testar**:
- ✅ Dashboard do aluno
- ✅ Ver cursos disponíveis
- ✅ Se matricular em cursos
- ✅ Realizar atividades (quizzes, leituras, exercícios)
- ✅ Ver badges conquistados
- ✅ Ranking/leaderboard
- ✅ Progresso pessoal

**URL após login**: `http://escola-teste.saas-gamificacao.local:8080/student/dashboard`

---

## 🎯 **FLUXO DE TESTE COMPLETO:**

### **Fase 1**: Como INSTRUTOR
1. Login como professor
2. Criar curso com IA usando texto de exemplo
3. Criar algumas atividades manuais
4. Configurar badges

### **Fase 2**: Como ALUNO  
1. Login como aluno
2. Ver cursos disponíveis
3. Se matricular no curso criado
4. Realizar algumas atividades
5. Ganhar badges
6. Ver progresso

### **Fase 3**: Como ADMIN
1. Login como admin da escola
2. Ver relatórios de uso
3. Gerenciar usuários
4. Configurar sistema

### **Fase 4**: Como CENTRAL ADMIN
1. Login como admin central
2. Ver métricas globais
3. Gerenciar tenants
4. Configurações do SaaS

---

## 📝 **CONTEÚDO DE TESTE PARA IA:**

Para testar o Professor Assistente IA, use este conteúdo de exemplo:

```
História do Brasil - Período Colonial

O período colonial brasileiro iniciou-se em 1500 com a chegada dos portugueses e estendeu-se até 1822.

Capítulo 1: Descobrimento e Primeiras Expedições
A chegada de Pedro Álvares Cabral ao Brasil em 22 de abril de 1500 marcou o início da colonização portuguesa. As primeiras expedições tinham caráter exploratório e buscavam principalmente o pau-brasil.

Capítulo 2: Sistema Colonial
O sistema colonial português baseava-se na exploração de recursos naturais e na agricultura de exportação. O açúcar tornou-se o principal produto colonial.

Capítulo 3: Sociedade Colonial
A sociedade colonial era hierárquica e patriarcal. No topo estavam os grandes proprietários rurais, seguidos por comerciantes, artesãos, trabalhadores livres e escravos.

Capítulo 4: Economia Colonial
A economia era baseada no tripé: latifúndio, monocultura e mão de obra escrava. O sistema de plantation foi implementado principalmente no Nordeste.

Capítulo 5: Independência
O processo de independência foi gradual e culminou com a Proclamação da Independência em 7 de setembro de 1822 por Dom Pedro I.
```

**A IA irá gerar automaticamente**:
- 🎯 Estrutura modular do curso
- 📋 Quizzes com perguntas de múltipla escolha
- 📖 Atividades de leitura organizadas
- ✍️ Exercícios práticos
- 🏆 Sistema de pontuação
- 🥇 Badges automáticos

---

## 🔧 **COMANDOS ÚTEIS PARA TESTES:**

```bash
# Ver status dos servidores
# Laravel: http://127.0.0.1:8080
# Vite: http://localhost:5173

# Limpar cache se necessário
php artisan config:clear
php artisan cache:clear

# Ver logs em tempo real
php artisan tail

# Testar sistema de IA
php artisan ai:test-course-generation

# Ver tenants
php artisan tenants:list

# Recriar dados de teste
php artisan test:tenancy create
```

---

## 🎉 **COMEÇE OS TESTES!**

1. **Configure o arquivo hosts** (se ainda não fez)
2. **Comece pelo nível INSTRUTOR** para testar a IA
3. **Use o conteúdo de exemplo** fornecido acima
4. **Navegue por todos os níveis** para ver a experiência completa

**Divirta-se explorando o sistema! 🚀**