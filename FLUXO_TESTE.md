# 🧪 ROTEIRO DE TESTE COMPLETO - SISTEMA MULTI-TENANT

## 📋 PRÉ-REQUISITOS

1. **Rodar o seeder mínimo:**
   ```bash
   php artisan db:seed MinimalTestSeeder
   ```

2. **Iniciar servidor:**
   ```bash
   php artisan serve
   ```

3. **Dados criados:**
   - 🏢 **Tenant:** "Escola Teste" (ID: escola-teste, Plano Premium)
   - 👑 **Admin:** admin@escola.com / senha123
   - 👨‍🏫 **Professor:** professor@escola.com / senha123
   - 👨‍🎓 **Aluno:** aluno@escola.com / senha123

---

## 🔥 TESTE 1: LOGIN E REDIRECIONAMENTO

### 1.1 Teste Login Admin
1. Acesse: http://127.0.0.1:8000/login
2. Login: `admin@escola.com` / `senha123`
3. **✅ Deve redirecionar para:** `/admin/dashboard`
4. **✅ Verificar:** Tenant "Escola Teste" ativo na sessão

### 1.2 Teste Login Professor
1. Logout e faça login: `professor@escola.com` / `senha123`
2. **✅ Deve redirecionar para:** `/instructor/dashboard`
3. **✅ Verificar:** Acesso ao menu "EduAI"

### 1.3 Teste Login Aluno
1. Logout e faça login: `aluno@escola.com` / `senha123`
2. **✅ Deve redirecionar para:** `/student/dashboard`
3. **✅ Verificar:** Dashboard do aluno (vazio inicialmente)

---

## 🧪 TESTE 2: SISTEMA DE TENANT

### 2.1 Verificar Tenant Ativo
1. Acesse: http://127.0.0.1:8000/test-tenant
2. **✅ Verificar:**
   - Tenant atual: "Escola Teste"
   - Domínio central: Sim
   - Funções helper funcionando

### 2.2 Teste Troca de Tenant
1. Na página test-tenant, use o dropdown
2. **✅ Verificar:** Troca de tenant funciona
3. **✅ Verificar:** Limpar tenant funciona

---

## 🤖 TESTE 3: EDUAI (PROFESSOR)

### 3.1 Acesso EduAI
1. Login como: `professor@escola.com` / `senha123`
2. Acesse: http://127.0.0.1:8000/eduai
3. **✅ Deve carregar:** Dashboard do EduAI
4. **✅ Verificar:** Interface de geração de cursos

### 3.2 Teste Restrição de Acesso
1. Login como: `aluno@escola.com` / `senha123`
2. Tente acessar: http://127.0.0.1:8000/eduai
3. **✅ Deve retornar:** Erro 403 - Acesso negado

### 3.3 Teste API Gemini
1. Como professor, tente gerar conteúdo
2. **✅ Verificar:** API Key configurada (GEMINI_API_KEY)
3. **✅ Verificar:** Geração funcionando

---

## 📚 TESTE 4: FLUXO CURSO COMPLETO

### 4.1 Professor Cria Curso
1. Login: `professor@escola.com` / `senha123`
2. Vá para: `/instructor/dashboard`
3. **Criar novo curso:**
   - Título: "Curso Teste"
   - Descrição: "Curso para testar o sistema"
4. **✅ Verificar:** Curso criado com `tenant_id` correto

### 4.2 Professor Usa EduAI
1. Acesse: `/eduai`
2. **Gere atividades** para o curso criado
3. **✅ Verificar:**
   - Geração funciona
   - Atividades são criadas com `tenant_id`

### 4.3 Aluno Acessa Curso
1. Login: `aluno@escola.com` / `senha123`
2. Vá para: `/student/courses`
3. **✅ Verificar:**
   - Vê apenas cursos do seu tenant
   - Pode se inscrever no curso

### 4.4 Admin Gerencia
1. Login: `admin@escola.com` / `senha123`
2. Vá para: `/admin/dashboard`
3. **✅ Verificar:**
   - Vê usuários do tenant
   - Vê cursos do tenant
   - Dados isolados por tenant

---

## 🔍 TESTE 5: ISOLAMENTO DE DADOS

### 5.1 Verificar Filtros Automáticos
1. Como qualquer usuário logado
2. **✅ Verificar no banco:**
   - Queries automáticas filtram por `tenant_id`
   - Usuário só vê dados do seu tenant
   - Criação automática de `tenant_id`

### 5.2 Teste Trait BelongsToTenant
1. **✅ Verificar models:**
   - Course, Activity, Badge, etc.
   - Têm trait BelongsToTenant
   - Filtram automaticamente

---

## ✅ CHECKLIST FINAL

- [ ] **Login funciona** para todos os roles
- [ ] **Redirecionamento correto** por role
- [ ] **Tenant é definido** na sessão após login
- [ ] **EduAI acessível** para professor
- [ ] **EduAI bloqueado** para aluno
- [ ] **API Gemini configurada** e funcionando
- [ ] **Dados isolados** por tenant
- [ ] **Traits funcionando** automaticamente
- [ ] **Helpers disponíveis** globalmente
- [ ] **Sistema completo** funcional

---

## 🚨 PROBLEMAS COMUNS

### Erro "Class not found"
```bash
composer dump-autoload
```

### Erro de tenant_id
```bash
# Verificar se colunas foram criadas
php artisan tinker
>>> \Schema::hasColumn('courses', 'tenant_id')
```

### Erro EduAI
- Verificar GEMINI_API_KEY no .env
- Verificar middleware 'eduai.access' registrado

### Erro de redirecionamento
- Verificar rotas existem
- Verificar middlewares registrados
- Verificar roles dos usuários

---

## 📞 PRÓXIMOS PASSOS

Após todos os testes passarem:

1. **Passo 5:** Implementar dashboard tenant-aware
2. **Passo 6:** Configurar limitações por plano
3. **Passo 7:** Sistema de billing
4. **Passo 8:** Deploy e configuração final

---

**🎯 OBJETIVO:** Sistema multi-tenant funcional com isolamento completo de dados e EduAI integrado!