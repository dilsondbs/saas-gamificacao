# Teste Rápido - Sistema de Desafio Final

## 🚀 Como Testar em 5 Minutos

### Pré-requisitos
- ✅ Laravel rodando
- ✅ Python FastAPI rodando (`cd eduai-ai-service && python -m uvicorn app.main:app --reload --port 8001`)
- ✅ Gemini API Key configurada

---

## Passo 1: Verificar Serviço Python

```bash
# Verificar se está rodando
curl http://localhost:8001/api/v1/test

# Resposta esperada:
# {"status":"OK","message":"EduAI AI Service is running"}
```

---

## Passo 2: Gerar Questões para um Curso Existente

```bash
# Listar cursos disponíveis
php artisan tinker
>>> Course::select('id', 'title')->get();

# Exemplo de saída:
# [64] => "Introdução à Programação"
# [65] => "Algoritmos Avançados"

# Sair do tinker
>>> exit

# Gerar questões para curso ID 64
php artisan final-challenge:generate 64
```

**Saída esperada:**
```
🎯 Gerando questões do Desafio Final para o curso ID: 64
📚 Curso encontrado: Introdução à Programação
📊 Módulos: 5
🤖 Chamando serviço de IA...
✅ Questões geradas:
   🟢 Fáceis: 10
   🟡 Médias: 10
   🔴 Difíceis: 10
💾 Salvando questões no banco de dados...
   ✓ easy: Criado
   ✓ medium: Criado
   ✓ hard: Criado
✅ Desafio Final criado com sucesso!
🎉 Total de questões: 30
```

---

## Passo 3: Verificar no Banco de Dados

```bash
php artisan tinker
```

```php
// Ver os desafios criados
>>> FinalChallenge::where('course_id', 64)->get(['id', 'difficulty_level', 'title']);

// Exemplo de saída:
// [
//   {id: 1, difficulty_level: "easy", title: "Desafio Final - Nível Easy"},
//   {id: 2, difficulty_level: "medium", title: "Desafio Final - Nível Medium"},
//   {id: 3, difficulty_level: "hard", title: "Desafio Final - Nível Hard"}
// ]

// Ver uma questão específica
>>> $challenge = FinalChallenge::where('course_id', 64)->where('difficulty_level', 'easy')->first();
>>> $content = json_decode($challenge->content, true);
>>> count($content['questions']); // Deve retornar 10
>>> $content['questions'][0]; // Ver a primeira questão

exit
```

---

## Passo 4: Testar na Interface Web

### 4.1 Criar um Usuário de Teste (se necessário)

```bash
php artisan tinker
```

```php
$user = User::create([
    'name' => 'Aluno Teste',
    'email' => 'aluno.teste@example.com',
    'password' => bcrypt('password123'),
    'role' => 'student',
    'tenant_id' => 'seu-tenant-id' // Use o tenant_id correto
]);

exit
```

### 4.2 Matricular no Curso

```bash
php artisan tinker
```

```php
use App\Models\CourseEnrollment;

$enrollment = CourseEnrollment::create([
    'user_id' => 1, // ID do usuário criado acima
    'course_id' => 64,
    'enrolled_at' => now(),
    'progress_percentage' => 100, // Simular 100% de conclusão
    'tenant_id' => 'seu-tenant-id'
]);

exit
```

### 4.3 Acessar o Curso

1. Faça login como o usuário de teste
2. Acesse: `http://seu-tenant.localhost/courses/64`
3. **Verifique**: Botão "🚀 Iniciar Desafio Final" deve aparecer (pois progress = 100%)

---

## Passo 5: Jogar o Desafio Final

### Tela 1: Seleção de Níveis
- ✅ Nível Easy: **DISPONÍVEL** (verde)
- 🔒 Nível Medium: **BLOQUEADO** (cinza)
- 🔒 Nível Hard: **BLOQUEADO** (cinza)

Clique em "Iniciar Nível Easy"

### Tela 2: Jogando
- ⏱️ Timer: 20:00 (contagem regressiva)
- 📊 Contador: "Questão 1 de 10"
- ❓ Questão com 4 opções (A, B, C, D)
- ➡️ Botão "Próxima"
- ✅ Botão "Finalizar Desafio" (último questão)

Responda as 10 questões e clique em "Finalizar Desafio"

### Tela 3: Resultado
**Se passou (≥60%):**
```
🎉 Parabéns! Você passou!

Pontuação: 7/10 (70%)

Próximo nível desbloqueado: Medium

[Continuar para próximo nível]
[Enviar mensagem motivacional]
```

**Se falhou (<60%):**
```
😔 Quase lá! Continue estudando!

Pontuação: 5/10 (50%)
Necessário: 60%

[Tentar novamente]
[Revisar conteúdo]
```

### Tela 4: Sistema Skinneriano (se passou)

1. **Selecione um template** (6 opções disponíveis)
2. **Personalize a mensagem**:
   - Mínimo 50 caracteres
   - Usar palavras-chave: "comportamento", "consequência", "resultado", "ação", "reforço"
   - Usar **negrito** com `**texto**`
3. **Validação em tempo real**:
   - ✅ Verde: Todos os critérios cumpridos
   - ❌ Vermelho: Faltam critérios
4. **Selecione o destinatário** (outro aluno que completou o curso)
5. **Enviar** → Dobro de pontos quando confirmado!

---

## 🧪 Teste de API Direta (Opcional)

### Testar Endpoint FastAPI com cURL

```bash
curl -X POST http://localhost:8001/api/v1/generate/final-challenge \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 64,
    "course_title": "Curso de Teste",
    "course_content": "Este é um curso de teste sobre programação. Variáveis são espaços de memória. Funções executam tarefas específicas. Loops repetem ações.",
    "course_modules": [
      {
        "title": "Módulo 1: Introdução",
        "description": "Introdução à programação",
        "activities": [
          {
            "title": "Lição 1: Variáveis",
            "type": "lesson",
            "content": "Variáveis são espaços na memória do computador..."
          }
        ]
      }
    ]
  }'
```

**Resposta esperada (após ~10-30 segundos):**
```json
{
  "success": true,
  "easy_questions": [...10 questões...],
  "medium_questions": [...10 questões...],
  "hard_questions": [...10 questões...],
  "generation_time_ms": 15000,
  "metadata": {
    "course_id": 64,
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  }
}
```

---

## 🐛 Problemas Comuns

### 1. "Serviço não disponível"
```bash
# Verifique se Python está rodando
ps aux | grep uvicorn

# Se não estiver, inicie:
cd eduai-ai-service
python -m uvicorn app.main:app --reload --port 8001
```

### 2. "Gemini API error"
```bash
# Verifique a chave no .env do Python
cat eduai-ai-service/.env | grep GEMINI_API_KEY

# Se estiver vazia, adicione:
echo "GEMINI_API_KEY=sua-chave-aqui" >> eduai-ai-service/.env
```

### 3. "Botão não aparece no curso"
```sql
-- Verifique o progresso no banco
SELECT user_id, course_id, progress_percentage
FROM course_enrollments
WHERE user_id = 1 AND course_id = 64;

-- Se progress_percentage < 100, atualize:
UPDATE course_enrollments
SET progress_percentage = 100
WHERE user_id = 1 AND course_id = 64;
```

### 4. "Erro ao gerar questões"
```bash
# Veja os logs do Laravel
tail -f storage/logs/laravel.log

# Veja os logs do Python
# (aparecem no terminal onde o uvicorn está rodando)
```

---

## ✅ Checklist de Teste

- [ ] Serviço Python rodando (`curl http://localhost:8001/api/v1/test`)
- [ ] Comando gera questões (`php artisan final-challenge:generate 64`)
- [ ] 3 registros no banco (`FinalChallenge::where('course_id', 64)->count()` = 3)
- [ ] Botão aparece no curso (progress = 100%)
- [ ] Consegue iniciar nível Easy
- [ ] Timer funciona (20 minutos)
- [ ] Consegue responder e finalizar
- [ ] Resultado exibe pontuação correta
- [ ] Nível Medium desbloqueia após passar Easy
- [ ] Sistema Skinneriano valida mensagem
- [ ] Pontos dobram ao confirmar motivação

---

## 📊 Resultado Esperado Final

Após completar os testes:

1. ✅ 3 FinalChallenge records no banco (easy, medium, hard)
2. ✅ Cada um com 10 questões em JSON
3. ✅ Interface funcional com timer e feedback
4. ✅ Progressão de níveis funcionando
5. ✅ Sistema de cooperação Skinneriano operacional

---

## 🎯 Teste Completo - Tempo Estimado

- Passo 1-2: **2 minutos**
- Passo 3: **1 minuto**
- Passo 4: **2 minutos**
- Passo 5: **5-10 minutos** (jogar o desafio)

**Total: ~15 minutos**

---

## 📞 Suporte Rápido

**Se algo não funcionar:**

1. Verifique logs: `tail -f storage/logs/laravel.log`
2. Console do navegador: F12 → Console
3. Terminal do Python: Onde o uvicorn está rodando
4. Banco de dados: `php artisan tinker` → comandos SQL

**Comandos úteis de debug:**

```php
// Ver todas as tentativas de um usuário
ChallengeAttempt::where('user_id', 1)->get();

// Ver motivações recebidas
ChallengeMotivation::where('receiver_id', 1)->with('sender')->get();

// Limpar tentativas (recomeçar)
ChallengeAttempt::where('user_id', 1)->delete();
```

---

**Happy Testing! 🚀**
