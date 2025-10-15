# 🔥 CENÁRIOS CRÍTICOS DE TESTE

## 🚨 CENÁRIOS DE ALTA PRIORIDADE

### C1: VAZAMENTO ENTRE TENANTS
**Objetivo**: Garantir isolamento absoluto de dados

**Cenário**:
1. Criar 2 tenants: "Escola A" e "Escola B"
2. Criar curso no Tenant A: "Matemática A"
3. Logar no Tenant B
4. Tentar acessar URLs do Tenant A:
   ```
   escola-b.local/courses/1 (curso da Escola A)
   escola-b.local/admin/users (usuários da Escola A)
   ```

**Resultado Esperado**: 404 ou redirecionamento para login
**Risco**: CRÍTICO - Vazamento de dados confidenciais

### C2: ESCALAÇÃO DE PRIVILÉGIOS
**Objetivo**: Validar controle de acesso por roles

**Cenário**:
1. Login como Student
2. Tentar acessar URLs de admin:
   ```
   /admin/dashboard
   /admin/users
   /admin/courses/create
   ```
3. Tentar editar dados via manipulação de forms
4. Verificar middlewares de autorização

**Resultado Esperado**: Acesso negado + redirect
**Risco**: ALTO - Comprometimento de segurança

### C3: AUTENTICAÇÃO CRUZADA
**Objetivo**: Evitar login simultâneo em múltiplos tenants

**Cenário**:
1. Login no Tenant A como admin@escolaa.com
2. Em nova aba, tentar acessar Tenant B
3. Verificar se sessão é isolada
4. Testar logout em um tenant

**Resultado Esperado**: Sessões independentes
**Risco**: ALTO - Confusão de contexto

### C4: REGISTRO DE TENANT DUPLICADO
**Objetivo**: Prevenir conflitos de slug/domínio

**Cenário**:
1. Registrar tenant com slug "escola-teste"
2. Tentar registrar outro tenant com mesmo slug
3. Testar variações: "Escola-Teste", "escola_teste"
4. Verificar validação de domínio

**Resultado Esperado**: Erro de validação claro
**Risco**: MÉDIO - Conflitos de roteamento

### C5: OPERAÇÕES EM CASCATA
**Objetivo**: Testar integridade em operações complexas

**Cenário**:
1. Cancelar tenant com dados ativos:
   - 10 usuários ativos
   - 5 cursos publicados
   - 50 inscrições ativas
2. Verificar cleanup de dados
3. Testar restauração de tenant

**Resultado Esperado**: Operação controlada + logs
**Risco**: ALTO - Perda de dados

## ⚡ CENÁRIOS DE STRESS

### S1: CARGA SIMULTÂNEA
**Objetivo**: Testar limite de usuários simultâneos

**Cenário**:
1. Simular 50 logins simultâneos no mesmo tenant
2. Todos acessando mesmo curso
3. Submissões de quiz simultâneas
4. Monitorar performance e erros

**Métricas**:
- Tempo de resposta < 5s
- Taxa de erro < 1%
- Sem travamentos

### S2: CRIAÇÃO EM MASSA
**Objetivo**: Testar limites de criação

**Cenário**:
1. Criar 100 usuários em sequência
2. Criar 50 cursos com 10 atividades cada
3. Gerar 1000 inscrições automaticamente
4. Verificar integridade dos dados

### S3: UPLOAD DE ARQUIVOS
**Objetivo**: Testar upload de materiais

**Cenário**:
1. Upload de arquivo 50MB
2. Upload simultâneo de 10 arquivos
3. Upload de formatos não suportados
4. Verificar armazenamento e segurança

## 💀 CENÁRIOS DESTRUTIVOS

### D1: SQL INJECTION
**Objetivo**: Testar proteção contra ataques

**Cenário**:
1. Tentar injeção em campos de busca:
   ```sql
   '; DROP TABLE users; --
   ' OR '1'='1
   ```
2. Testar em formulários de registro
3. Verificar sanitização de dados

### D2: XSS (Cross-Site Scripting)
**Objetivo**: Testar proteção contra scripts maliciosos

**Cenário**:
1. Inserir scripts em campos de texto:
   ```html
   <script>alert('XSS')</script>
   <img src="x" onerror="alert('XSS')">
   ```
2. Testar em descrições de cursos
3. Verificar escape de HTML

### D3: CSRF (Cross-Site Request Forgery)
**Objetivo**: Testar proteção contra requisições falsas

**Cenário**:
1. Tentar submeter forms sem token CSRF
2. Usar token de outro tenant
3. Verificar middleware de proteção

## 🎯 CENÁRIOS DE GAMIFICAÇÃO

### G1: PONTUAÇÃO NEGATIVA
**Objetivo**: Testar limites de pontuação

**Cenário**:
1. Aluno com 100 pontos
2. Errar quiz que remove 150 pontos
3. Verificar se pontuação fica negativa
4. Testar comportamento do sistema

### G2: BADGES DUPLICADOS
**Objetivo**: Evitar badges múltiplos

**Cenário**:
1. Configurar badge "Primeiro Login"
2. Fazer login/logout múltiplas vezes
3. Verificar se badge é concedido apenas uma vez
4. Testar condições de borda

### G3: PROGRESSÃO QUEBRADA
**Objetivo**: Validar sequência de atividades

**Cenário**:
1. Curso com 5 atividades em sequência
2. Tentar acessar atividade 5 sem completar 1-4
3. Verificar middleware de progressão
4. Testar URLs diretas

## 🔄 CENÁRIOS DE RECUPERAÇÃO

### R1: TENANT CANCELADO
**Objetivo**: Testar reativação de tenant

**Cenário**:
1. Cancelar tenant ativo
2. Tentar acessar após cancelamento
3. Reativar tenant
4. Verificar integridade dos dados

### R2: SENHA TEMPORÁRIA EXPIRADA
**Objetivo**: Testar renovação de credenciais

**Cenário**:
1. Gerar senha temporária para usuário
2. Aguardar expiração (ou simular)
3. Tentar login com senha expirada
4. Verificar processo de renovação

### R3: BACKUP E RESTORE
**Objetivo**: Testar recuperação de dados

**Cenário**:
1. Backup completo de tenant
2. Simular perda de dados
3. Executar restore
4. Verificar integridade

## 📱 CENÁRIOS MOBILE

### M1: RESPONSIVIDADE
**Objetivo**: Testar em dispositivos móveis

**Cenário**:
1. Acessar sistema em smartphone
2. Testar todas as funcionalidades principais
3. Verificar touch interactions
4. Testar orientação portrait/landscape

### M2: CONEXÃO LENTA
**Objetivo**: Testar em conexões 3G

**Cenário**:
1. Simular conexão lenta
2. Testar carregamento de conteúdo
3. Verificar timeouts
4. Testar modo offline

## 🎪 CENÁRIOS EDGE CASE

### E1: DADOS EXTREMOS
**Objetivo**: Testar limites dos campos

**Cenário**:
1. Nome de curso com 500 caracteres
2. Descrição com 10.000 caracteres
3. E-mail com formato limite: muito.longo.email@dominio.muito.longo.com
4. Verificar validações

### E2: CARACTERES ESPECIAIS
**Objetivo**: Testar suporte internacional

**Cenário**:
1. Criar tenant com nome: "Escola São José & Ñícolás"
2. Usuário: "José María Åkesson"
3. Curso: "Matemática Básica - 1º Año"
4. Verificar encoding UTF-8

### E3: TIMEZONE DIFERENTE
**Objetivo**: Testar fuso horário

**Cenário**:
1. Configurar servidor em UTC
2. Usuário em GMT-3 (São Paulo)
3. Criar atividade com deadline
4. Verificar cálculos de tempo

## 🔍 CHECKLIST DE VALIDAÇÃO

### Para cada cenário:
- [ ] Cenário executado conforme planejado
- [ ] Resultado obtido = Resultado esperado
- [ ] Screenshots/evidências coletadas
- [ ] Bugs documentados no tracker
- [ ] Logs do sistema verificados
- [ ] Performance monitorada

### Critérios de Aceitação:
- [ ] Todos os cenários CRÍTICOS passam
- [ ] 90% dos cenários ALTO passam
- [ ] Sem vazamentos de dados entre tenants
- [ ] Sem escalação de privilégios
- [ ] Performance aceitável sob stress

---

**Nota**: Execute estes cenários após os testes básicos do PLANO_TESTES_MANUAIS.md