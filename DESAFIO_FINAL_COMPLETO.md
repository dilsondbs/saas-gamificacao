# Sistema de Desafio Final - Documentação Completa

## 📋 Visão Geral

O **Desafio Final** é uma funcionalidade gamificada que permite aos alunos testarem todo o conhecimento adquirido em um curso através de um conjunto de 30 questões distribuídas em 3 níveis de dificuldade progressivos.

### Características Principais

- ✅ **30 questões geradas automaticamente por IA** (Gemini 2.5 Flash)
- ✅ **3 níveis progressivos**: Easy (10), Medium (10), Hard (10)
- ✅ **Desbloqueio progressivo**: Precisa passar no nível anterior
- ✅ **Sistema Skinneriano de Motivação**: Cooperação entre alunos com dobro de pontos
- ✅ **Timer de 20 minutos** por tentativa
- ✅ **Badges e pontos** ao completar cada nível
- ✅ **Interface React moderna** com feedback em tempo real

---

## 🏗️ Arquitetura do Sistema

### Backend (Laravel)

#### 1. Models

**`app/Models/FinalChallenge.php`**
- Armazena as questões do desafio para cada nível
- Campos: `course_id`, `difficulty_level`, `title`, `time_limit_minutes`, `min_score_percentage`, `content` (JSON)
- Relationships: `belongsTo(Course)`, `hasMany(ChallengeAttempt)`, `hasMany(ChallengeMotivation)`

**`app/Models/ChallengeAttempt.php`**
- Registra cada tentativa de um aluno
- Campos: `user_id`, `challenge_id`, `level`, `answers` (JSON), `score`, `completed_at`
- Scopes: `completed()`, `passed()`, `failed()`

**`app/Models/ChallengeMotivation.php`**
- Sistema de cooperação Skinneriana
- Campos: `sender_id`, `receiver_id`, `course_id`, `message`, `confirmed_at`, `points_doubled`
- Método crítico: `confirm()` - dobra os pontos automaticamente

#### 2. Controller

**`app/Http/Controllers/Student/FinalChallengeController.php`**

**Métodos:**
- `show($course)` - Exibe tela de seleção de níveis
- `start(Request $request, $course)` - Inicia uma tentativa
- `submit(Request $request, $course)` - Avalia respostas e calcula pontuação
- `sendMotivation(Request $request, $course)` - Envia mensagem motivacional
- `confirmMotivation(Request $request)` - Confirma recebimento e dobra pontos

**Helpers:**
- `hasCompletedAllActivities()` - Verifica 100% de conclusão do curso
- `calculateScore()` - Calcula pontuação baseada em respostas
- `canAccessLevel()` - Verifica se pode acessar determinado nível

#### 3. Services

**`app/Services/PythonAIService.php`**

**Novo Método:**
```php
public function generateFinalChallengeQuestions(
    int $courseId,
    string $courseTitle,
    string $courseContent,
    array $courseModules
): array
```

Chama o endpoint `/api/v1/generate/final-challenge` do serviço Python.

#### 4. Rotas

**`routes/web.php`**
```php
Route::prefix('courses/{course}/challenge')->name('challenge.')->group(function () {
    Route::get('/', [FinalChallengeController::class, 'show'])->name('show');
    Route::post('/start', [FinalChallengeController::class, 'start'])->name('start');
    Route::post('/submit', [FinalChallengeController::class, 'submit'])->name('submit');
    Route::post('/motivation/send', [FinalChallengeController::class, 'sendMotivation'])->name('motivation.send');
    Route::post('/motivation/confirm/{motivation}', [FinalChallengeController::class, 'confirmMotivation'])->name('motivation.confirm');
});
```

---

### Frontend (React/Inertia.js)

**`resources/js/Pages/Student/FinalChallenge.jsx`**

#### Telas:

1. **levels** - Seleção de nível com indicadores de progresso
2. **playing** - Questões com timer e contador
3. **result** - Resultado da tentativa (passou/falhou)
4. **cooperation** - Sistema Skinneriano de motivação

#### Sistema Skinneriano:

**6 Templates de Mensagem** baseados em B.F. Skinner:
- Reforço de Dedicação
- Reconhecimento de Progresso
- Estímulo à Continuidade
- Valorização do Esforço
- Motivação por Conquista
- Encorajamento Científico

**Validação em Tempo Real:**
- ✅ Mínimo 50 caracteres
- ✅ Palavras-chave Skinnerianas: "comportamento", "consequência", "resultado", "ação", "reforço"
- ✅ Formatação em **negrito** obrigatória

---

### Serviço de IA (Python/FastAPI)

**`eduai-ai-service/app/services/gemini_service.py`**

**Novo Método:**
```python
async def generate_final_challenge_questions(
    self,
    course_content: str,
    course_title: str,
    course_modules: list
) -> Dict[str, Any]
```

**Prompt Engineering:**
- Gera exatamente 10 questões por nível
- Taxonomia de Bloom: Conhecimento → Aplicação → Análise
- Easy: "O QUE é?" (conceitos básicos)
- Medium: "COMO aplicar?" (situações práticas)
- Hard: "POR QUE e QUANDO?" (pensamento crítico)

**`eduai-ai-service/app/routers/generate.py`**

**Novo Endpoint:**
```python
@router.post("/final-challenge")
async def generate_final_challenge(request: FinalChallengeRequest)
```

**Request:**
```json
{
  "course_id": 123,
  "course_title": "Nome do Curso",
  "course_content": "Conteúdo completo...",
  "course_modules": [...]
}
```

**Response:**
```json
{
  "success": true,
  "easy_questions": [...10 questões...],
  "medium_questions": [...10 questões...],
  "hard_questions": [...10 questões...],
  "generation_time_ms": 12500,
  "metadata": {
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  }
}
```

---

## 🚀 Como Usar

### 1. Gerar Questões Automaticamente

**Comando Artisan:**
```bash
php artisan final-challenge:generate {course_id}
```

**Exemplo:**
```bash
php artisan final-challenge:generate 64
```

**Saída:**
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

### 2. Integração Automática na Criação de Cursos

Adicione no final do método de criação de curso:

```php
// app/Http/Controllers/Admin/CourseController.php
public function store(Request $request)
{
    // ... criação do curso ...

    // Gerar questões do Desafio Final automaticamente
    try {
        \Artisan::call('final-challenge:generate', [
            'course_id' => $course->id
        ]);

        Log::info("Desafio Final gerado automaticamente para curso {$course->id}");
    } catch (\Exception $e) {
        Log::error("Erro ao gerar Desafio Final: {$e->getMessage()}");
        // Não falha a criação do curso se a geração falhar
    }

    return redirect()->route('admin.courses.show', $course);
}
```

### 3. Acesso pelo Aluno

**Pré-requisitos:**
- ✅ 100% de conclusão do curso (todas as atividades)
- ✅ Botão "🚀 Iniciar Desafio Final" aparece automaticamente em `Course.jsx`

**Fluxo:**
1. Aluno completa 100% das atividades do curso
2. Botão de Desafio Final aparece com animação
3. Clica no botão → Tela de seleção de níveis
4. Seleciona nível Easy (único desbloqueado inicialmente)
5. Responde 10 questões em 20 minutos
6. Submete respostas → Vê resultado
7. Se passou (≥60%), desbloqueia nível Medium
8. Repete até completar Hard
9. Pode enviar mensagem Skinneriana para outro aluno
10. Recebe dobro dos pontos quando confirmado

---

## 📊 Estrutura das Questões

### Formato JSON Armazenado

```json
{
  "questions": [
    {
      "question": "Qual a definição de variável em programação?",
      "options": [
        "A) Um espaço de memória para armazenar dados",
        "B) Uma função que retorna valores",
        "C) Um loop que se repete infinitamente",
        "D) Um comentário no código"
      ],
      "correct_answer": "A",
      "explanation": "Variável é um espaço reservado na memória do computador para armazenar dados temporariamente durante a execução do programa. A opção A está correta porque define precisamente esse conceito fundamental.",
      "points": 10
    }
  ]
}
```

### Pontuação por Nível

- **Easy**: 10 pontos por questão (total: 100 pontos)
- **Medium**: 15 pontos por questão (total: 150 pontos)
- **Hard**: 20 pontos por questão (total: 200 pontos)

**Total possível: 450 pontos**

---

## 🎮 Sistema de Progressão

### Critérios de Aprovação

```php
private function getMinScoreForLevel($level)
{
    return [
        'easy' => 60,     // 60% = 6/10 questões corretas
        'medium' => 70,   // 70% = 7/10 questões corretas
        'hard' => 80      // 80% = 8/10 questões corretas
    ][$level];
}
```

### Desbloqueio de Níveis

```php
private function canAccessLevel($user, $course, $level)
{
    if ($level === 'easy') return true; // Sempre disponível

    if ($level === 'medium') {
        // Precisa ter passado no Easy
        return ChallengeAttempt::where('user_id', $user->id)
            ->where('level', 'easy')
            ->where('score', '>=', 60)
            ->exists();
    }

    if ($level === 'hard') {
        // Precisa ter passado no Medium
        return ChallengeAttempt::where('user_id', $user->id)
            ->where('level', 'medium')
            ->where('score', '>=', 70)
            ->exists();
    }
}
```

---

## 🏆 Badges e Recompensas

### Badges Automáticas

Ao completar cada nível, o sistema verifica e concede badges via `BadgeService`:

```php
// app/Http/Controllers/Student/FinalChallengeController.php (submit method)
$this->badgeService->checkAndAwardBadges($user);
```

### Badges Sugeridas

Criar badges específicas no seeder:

```php
// database/seeders/BadgeSeeder.php
Badge::create([
    'name' => 'Desafio Final - Easy',
    'description' => 'Completou o desafio final no nível fácil',
    'icon' => '🟢',
    'points_value' => 50,
    'criteria' => json_encode([
        'type' => 'final_challenge',
        'level' => 'easy',
        'min_score' => 60
    ])
]);

Badge::create([
    'name' => 'Desafio Final - Medium',
    'description' => 'Completou o desafio final no nível médio',
    'icon' => '🟡',
    'points_value' => 100,
    'criteria' => json_encode([
        'type' => 'final_challenge',
        'level' => 'medium',
        'min_score' => 70
    ])
]);

Badge::create([
    'name' => 'Desafio Final - Hard',
    'description' => 'Completou o desafio final no nível difícil',
    'icon' => '🔴',
    'points_value' => 200,
    'criteria' => json_encode([
        'type' => 'final_challenge',
        'level' => 'hard',
        'min_score' => 80
    ])
]);

Badge::create([
    'name' => 'Mestre Completo',
    'description' => 'Completou todos os 3 níveis do desafio final',
    'icon' => '👑',
    'points_value' => 500,
    'criteria' => json_encode([
        'type' => 'final_challenge',
        'level' => 'all',
        'min_score' => 60
    ])
]);
```

---

## 🤝 Sistema Skinneriano de Cooperação

### Fundamentos Teóricos

Baseado em **B.F. Skinner** - Condicionamento Operante:
- **Estímulo**: Aluno completa desafio final
- **Resposta**: Outro aluno envia mensagem motivacional
- **Reforço**: Ambos recebem pontos dobrados

### Fluxo de Cooperação

1. **Aluno A** completa o Hard Challenge
2. **Aluno A** vê lista de colegas que completaram o mesmo curso
3. **Aluno A** seleciona um template Skinneriano pré-escrito
4. **Aluno A** personaliza com mínimo 50 caracteres + palavras-chave + **negrito**
5. **Aluno A** envia mensagem para **Aluno B**
6. **Aluno B** recebe notificação
7. **Aluno B** confirma recebimento
8. **Sistema** dobra pontos de AMBOS automaticamente

### Validação da Mensagem

```javascript
const validateSkinnerianMessage = (message) => {
    const keywords = ['comportamento', 'consequência', 'resultado', 'ação', 'reforço'];
    const hasKeyword = keywords.some(k => message.toLowerCase().includes(k));
    const hasLength = message.length >= 50;
    const hasBold = message.includes('**');

    return {
        valid: hasKeyword && hasLength,
        hasKeyword,
        hasLength,
        hasBold
    };
};
```

---

## 🧪 Testes

### Teste Manual Rápido

```bash
# 1. Criar curso de teste
php artisan tinker
>>> $course = Course::find(64);

# 2. Gerar questões
php artisan final-challenge:generate 64

# 3. Verificar no banco
>>> FinalChallenge::where('course_id', 64)->get();

# 4. Testar na interface
# Acesse: http://tenant.localhost/courses/64
# Complete 100% das atividades
# Clique em "Iniciar Desafio Final"
```

### Teste de Geração de IA

```bash
# Verificar se serviço Python está rodando
curl http://localhost:8001/api/v1/test

# Testar endpoint diretamente (via Postman ou curl)
curl -X POST http://localhost:8001/api/v1/generate/final-challenge \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 64,
    "course_title": "Teste",
    "course_content": "Conteúdo de teste...",
    "course_modules": []
  }'
```

---

## 🐛 Troubleshooting

### Problema: "Serviço de IA não está disponível"

**Solução:**
```bash
cd eduai-ai-service
python -m uvicorn app.main:app --reload --port 8001
```

### Problema: "Questões não foram geradas"

**Verificar:**
1. Serviço Python rodando: `curl http://localhost:8001/health`
2. API Key do Gemini configurada: `.env` → `GEMINI_API_KEY`
3. Logs: `storage/logs/laravel.log`

### Problema: "Botão não aparece no curso"

**Verificar:**
1. Progresso do aluno é 100%?
   ```php
   $progress = CourseEnrollment::where('user_id', auth()->id())
       ->where('course_id', $course->id)
       ->first();
   dd($progress->progress_percentage);
   ```
2. Componente `Course.jsx` foi atualizado?

---

## 📝 Checklist de Implementação

- [x] Migration criada (`2025_10_14_140000_create_final_challenge_tables.php`)
- [x] Models criados (FinalChallenge, ChallengeAttempt, ChallengeMotivation)
- [x] Controller completo (FinalChallengeController)
- [x] Rotas adicionadas (routes/web.php)
- [x] Componente React criado (FinalChallenge.jsx)
- [x] UI integrada (Course.jsx)
- [x] Método Python criado (gemini_service.py)
- [x] Endpoint FastAPI criado (generate.py)
- [x] Serviço Laravel criado (PythonAIService.php)
- [x] Comando Artisan criado (GenerateFinalChallengeQuestions.php)
- [x] Documentação completa (DESAFIO_FINAL_COMPLETO.md)

---

## 🎯 Próximos Passos

### Melhorias Futuras

1. **Analytics Dashboard**
   - Taxa de aprovação por nível
   - Tempo médio de conclusão
   - Questões mais difíceis

2. **Ranking Global**
   - Leaderboard de pontuação
   - Comparação entre alunos
   - Badges exclusivas

3. **Questões Dinâmicas**
   - Geração on-the-fly por tentativa
   - Evitar repetição de questões
   - Adaptação de dificuldade

4. **Modo Competitivo**
   - Desafio entre dois alunos
   - Tempo real
   - Premiação especial

---

## 📚 Referências

- **B.F. Skinner**: "Science and Human Behavior" (1953)
- **Taxonomia de Bloom**: Anderson & Krathwohl (2001)
- **Gamificação**: Deterding et al. (2011)
- **Micro-learning**: Hug (2005)

---

## 👨‍💻 Suporte

Para dúvidas ou problemas:
1. Verificar logs: `storage/logs/laravel.log`
2. Verificar console do navegador (F12)
3. Revisar esta documentação
4. Consultar código-fonte com comentários inline

---

**Versão**: 1.0.0
**Data**: 2025-10-14
**Autor**: Sistema SaaS Gamificação
**Status**: ✅ Implementação Completa
