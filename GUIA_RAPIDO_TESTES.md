# ⚡ GUIA RÁPIDO - COMEÇAR TESTES AGORA

## 🚀 SETUP RÁPIDO (5 minutos)

### 1. Configurar Hosts
Abrir **Bloco de Notas como ADMINISTRADOR**:
```
127.0.0.1 saas-gamificacao.local
127.0.0.1 escola-teste.saas-gamificacao.local
```

### 2. Preparar Banco
```bash
php artisan migrate:fresh
```

### 3. Iniciar Servidor
```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

### 4. Criar Super Admin Central
```bash
php artisan tinker
```
```php
\App\Models\User::create([
    'name' => 'Super Admin',
    'email' => 'superadmin@saas.com',
    'password' => Hash::make('senha123'),
    'role' => 'admin',
    'email_verified_at' => now(),
    'tenant_id' => null
]);
```

---

## 🎯 CENÁRIO COMPLETO (30 minutos)

### FASE 1: Criar Tenant (5 min)

1. **Acessar:** http://saas-gamificacao.local:8000/signup

2. **STEP 1 - Dados:**
   - Empresa: Escola Teste
   - Email: admin@escola-teste.com
   - Admin: João Silva
   - Plano: TESTE

3. **STEP 2 - Config:**
   - Tenant: Escola Teste
   - Slug: escola-teste
   - Cor: #3B82F6

4. **STEP 4 - Confirmar**
   - Criar Plataforma
   - Anotar senha: **temporary123**

---

### FASE 2: Configurar Tenant (10 min)

1. **Login Admin:**
   - URL: http://escola-teste.saas-gamificacao.local:8000
   - Email: admin@escola-teste.com
   - Senha: temporary123
   - Nova Senha: Admin@123

2. **Criar Instructor:**
   - Menu: Admin → Usuários → Criar
   - Nome: Professor João
   - Email: professor@escola-teste.com
   - Role: Instructor

3. **Criar 3 Alunos:**
   - Aluno 1: aluno1@escola-teste.com
   - Aluno 2: aluno2@escola-teste.com
   - Aluno 3: aluno3@escola-teste.com

4. **Criar 3 Badges:**
   ```
   Badge 1: Iniciante
   - Critério: {"type":"completion","target_value":1}
   - Pontos: 10

   Badge 2: Estudioso
   - Critério: {"type":"points","target_value":100}
   - Pontos: 50

   Badge 3: Mestre
   - Critério: {"type":"completion","target_value":10}
   - Pontos: 100
   ```

---

### FASE 3: Criar Curso (10 min)

1. **Logout e Login como Instructor:**
   - Email: professor@escola-teste.com
   - Senha: (anotar a temporária)
   - Nova: Prof@123

2. **Criar Curso:**
   - Título: Introdução à Programação
   - Descrição: Curso básico
   - Status: Rascunho

3. **Criar 3 Atividades:**

   **Atividade 1 - Leitura:**
   ```
   Tipo: Reading
   Título: O que é Programação?
   Conteúdo: [texto longo]
   Pontos: 10
   Ordem: 1
   ```

   **Atividade 2 - Quiz:**
   ```
   Tipo: Quiz
   Título: Quiz - Conceitos
   Pontos: 20
   Ordem: 2
   Content:
   {
     "questions": [
       {
         "question": "O que é uma variável?",
         "options": ["Espaço na memória","Loop","Função","Operador"],
         "correct": 0
       }
     ]
   }
   ```

   **Atividade 3 - Exercício:**
   ```
   Tipo: Assignment
   Título: Primeiro Programa
   Instruções: Escreva "Olá Mundo"
   Pontos: 30
   Ordem: 3
   ```

4. **Publicar Curso:**
   - Editar curso
   - Status: Publicado

---

### FASE 4: Testar como Aluno (5 min)

1. **Logout e Login Aluno:**
   - Email: aluno1@escola-teste.com
   - Senha: (temporária)
   - Nova: Aluno@123

2. **Matricular em Curso:**
   - Menu: Cursos
   - Clicar em "Introdução à Programação"
   - Matricular-se

3. **Completar Atividades:**

   **Atividade 1:**
   - Ler conteúdo
   - Marcar como concluída
   - ✅ Verificar: +10 pontos
   - ✅ Badge "Iniciante" ganho

   **Atividade 2:**
   - Responder quiz (opção 0)
   - Submeter
   - ✅ Verificar: +20 pontos (total 30)

   **Atividade 3:**
   - Escrever resposta
   - Enviar
   - ✅ Verificar: +30 pontos (total 60)
   - ✅ Curso 100% completo

4. **Verificar Gamificação:**
   - Dashboard: 60 pontos
   - Badges: 1 conquistado
   - Leaderboard: 1º lugar

---

## ✅ CHECKLIST RÁPIDO

### Funcionou?
- [ ] Tenant criado
- [ ] Login com senha temporária
- [ ] Troca de senha obrigatória
- [ ] 3 usuários criados
- [ ] Curso publicado
- [ ] Progressão sequencial funciona
- [ ] Pontos somam corretamente
- [ ] Badge automático concedido
- [ ] Leaderboard atualiza

### Bugs Críticos a Observar
- [ ] Dados vazam entre tenants?
- [ ] tenant_id correto em todas as tabelas?
- [ ] Atividades desbloqueiam sequencialmente?
- [ ] Pontos duplicam?
- [ ] Badge concede múltiplas vezes?

---

## 🔥 TESTES CRÍTICOS DE SEGURANÇA

### TESTE 1: Isolamento Multi-Tenant

1. **Criar 2º Tenant:**
   - Slug: escola-premium
   - Admin: admin@escola-premium.com

2. **Verificar Isolamento:**
   ```bash
   # Ver tenants
   SELECT id, slug FROM tenants;

   # Ver usuários por tenant
   SELECT email, tenant_id FROM users ORDER BY tenant_id;
   ```

3. **Tentar Vazar Dados:**
   - Login em escola-teste
   - Copiar URL de um curso
   - Logout
   - Login em escola-premium
   - Tentar acessar URL do curso de escola-teste
   - ✅ DEVE dar erro 403/404

---

## 📊 VALIDAÇÕES NO BANCO

```sql
-- 1. Verificar tenant_id em TODAS as tabelas
SELECT * FROM users WHERE tenant_id IS NULL; -- NÃO deve ter (exceto super admin)
SELECT * FROM courses WHERE tenant_id IS NULL; -- NÃO deve ter
SELECT * FROM activities WHERE tenant_id IS NULL; -- NÃO deve ter

-- 2. Verificar pontos do aluno1
SELECT u.name, u.total_points, COUNT(p.id) as point_records
FROM users u
LEFT JOIN points p ON p.user_id = u.id
WHERE u.email = 'aluno1@escola-teste.com'
GROUP BY u.id;

-- 3. Verificar badges conquistados
SELECT u.name, b.name as badge_name, ub.earned_at
FROM users u
JOIN user_badges ub ON ub.user_id = u.id
JOIN badges b ON b.id = ub.badge_id
WHERE u.email = 'aluno1@escola-teste.com';

-- 4. Verificar progressão de atividades
SELECT
  u.name,
  a.title,
  ua.completed_at,
  ua.score,
  a.points_value
FROM users u
JOIN user_activities ua ON ua.user_id = u.id
JOIN activities a ON a.id = ua.activity_id
WHERE u.email = 'aluno1@escola-teste.com'
ORDER BY ua.completed_at;
```

---

## 🐛 TEMPLATE RÁPIDO DE BUG

```
BUG #___

MÓDULO: [Central/Admin/Instructor/Student]
CRÍTICO: [SIM/NÃO]

PASSOS:
1.
2.
3.

ESPERADO:

ATUAL:

PRINT:
```

---

## 📞 PRÓXIMOS PASSOS

**Encontrou bugs?**
→ Anotar no formato acima
→ Documentar no README

**Tudo funcionou?**
→ Continuar com ROTEIRO_TESTES_MANUAIS_COMPLETO.md
→ Testar edge cases
→ Testar performance

**Sistema pronto?**
→ Implementar testes automatizados
→ Deploy em staging
→ Documentação final

---

**Tempo estimado:** 30 minutos
**Dificuldade:** ⭐⭐⭐☆☆ Média
**Status:** ✅ Sistema funcional para testes

Boa sorte! 🚀
