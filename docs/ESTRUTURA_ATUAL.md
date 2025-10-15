# Estrutura Atual do Projeto SaaS Gamificação

## 1. ROTAS PRINCIPAIS

### Rotas em `/routes/web.php` (Contexto Tenant)

#### Rotas de Dashboard Principal
```php
// Dashboard principal com redirecionamento baseado em role
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Profile management
Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
```

#### Rotas de Admin
```php
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::resource('users', AdminUserController::class);
    Route::resource('courses', AdminCourseController::class);
    Route::resource('activities', AdminActivityController::class);
    Route::resource('badges', AdminBadgeController::class);
});
```

#### Rotas de Instructor
```php
Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    Route::get('/dashboard', [InstructorDashboardController::class, 'dashboard'])->name('dashboard');
    Route::get('/courses', [InstructorDashboardController::class, 'courses'])->name('courses');
    Route::get('/students', [InstructorDashboardController::class, 'students'])->name('students');

    // Course CRUD routes
    Route::get('/courses/create', [InstructorDashboardController::class, 'createCourse'])->name('courses.create');
    Route::post('/courses', [InstructorDashboardController::class, 'storeCourse'])->name('courses.store');
    Route::get('/courses/{course}', [InstructorDashboardController::class, 'showCourse'])->name('courses.show');
    Route::get('/courses/{course}/edit', [InstructorDashboardController::class, 'editCourse'])->name('courses.edit');
    Route::put('/courses/{course}', [InstructorDashboardController::class, 'updateCourse'])->name('courses.update');
    Route::delete('/courses/{course}', [InstructorDashboardController::class, 'destroyCourse'])->name('courses.destroy');

    // AI Course Generation
    Route::get('courses/ai/create', [InstructorCourseController::class, 'createWithAI'])->name('courses.ai.create');
    Route::post('courses/ai/generate', [InstructorCourseController::class, 'generateFromContent'])->name('courses.ai.generate');
    Route::post('courses/ai/preview', [InstructorCourseController::class, 'previewGenerated'])->name('courses.ai.preview');
});
```

### Rotas EduAI (Identificadas em `/routes/tenant.php`)
```php
Route::middleware(['auth', 'verified', 'eduai.access'])->prefix('eduai')->name('eduai.')->group(function () {
    Route::get('/', [EduAIController::class, 'index'])->name('dashboard');
    Route::get('/generate-complete', [EduAIController::class, 'generateComplete'])->name('generate-complete');
    Route::get('/canvas/{canvasId?}', [EduAIController::class, 'showCanvas'])->name('canvas');

    // API endpoints for AI generation
    Route::post('/generate-course', [EduAIController::class, 'generateCourse'])->name('generate-course');
    Route::post('/generate-course-from-file', [EduAIController::class, 'generateCourseFromFile'])->name('generate-course-from-file');
    Route::post('/generate-activities', [EduAIController::class, 'generateActivities'])->name('generate-activities');
    Route::post('/generate-badges', [EduAIController::class, 'generateBadges'])->name('generate-badges');
    Route::post('/generate-canvas', [EduAIController::class, 'generateCanvas'])->name('generate-canvas');
    Route::post('/generate-complete-package', [EduAIController::class, 'generateCompletePackage'])->name('generate-complete-package');
    Route::post('/save-course', [EduAIController::class, 'saveCourse'])->name('save-course');
    Route::post('/save-canvas', [EduAIController::class, 'saveCanvas'])->name('save-canvas');
});
```

### Rotas de Student (em `/routes/tenant.php`)
```php
Route::middleware(['auth'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [Student\DashboardController::class, 'index'])->name('dashboard');
    Route::post('/enroll/{course}', [Student\DashboardController::class, 'enrollCourse'])->name('enroll');
    Route::get('/courses', [Student\DashboardController::class, 'courses'])->name('courses');
    Route::get('/courses/{id}', [Student\DashboardController::class, 'showCourseById'])->name('courses.show');
    Route::get('/activities/{id}', [Student\DashboardController::class, 'showActivityById'])->name('activities.show');
    Route::get('/quiz/{id}', [Student\DashboardController::class, 'showActivityById'])->name('quiz.show');
    Route::post('/quiz/{id}', [Student\DashboardController::class, 'submitQuizById'])->name('quiz.submit');
    Route::get('/badges', [Student\DashboardController::class, 'badges'])->name('badges');
    Route::get('/leaderboard', [Student\DashboardController::class, 'leaderboard'])->name('leaderboard');
});
```

## 2. EDUAI

### Caminho dos Arquivos

#### Controller
- **Path**: `app/Http/Controllers/EduAIController.php`
- **Função Principal**: Gerencia todas as operações de IA do sistema
- **Construtor**: Injeta `GeminiAIService`

#### Services
- **Path**: `app/Services/GeminiAIService.php`
- **Path**: `app/Services/AICourseGeneratorService.php`
- **Função**: Integração com Google Gemini AI e geração de cursos

#### Views (React Components)
- **Dashboard**: `resources/js/Pages/EduAI/Dashboard.jsx`
- **Canvas**: `resources/js/Pages/EduAI/Canvas.jsx`
- **Generate Complete**: `resources/js/Pages/EduAI/GenerateComplete.jsx`

### Integração com Gemini

#### Configuração
- **API Key**: Configurada via `config('services.gemini.api_key')`
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`

#### Implementação em `AICourseGeneratorService.php`
```php
public function callGeminiAPI(string $prompt): string
{
    $url = $this->baseUrl . '?key=' . $this->apiKey;

    $requestBody = [
        'contents' => [
            [
                'parts' => [
                    [
                        'text' => $prompt
                    ]
                ]
            ]
        ],
        'generationConfig' => [
            'temperature' => 0.7,
            'topK' => 40,
            'topP' => 0.95,
            'maxOutputTokens' => 8192,
        ]
    ];
    // ... resto da implementação
}
```

### Onde Salva os Cursos Gerados

#### Processo de Salvamento
1. **Geração via IA**: `EduAIController::generateCourse()`
2. **Parsing**: `AICourseGeneratorService::parseCourseResponse()`
3. **Criação**: `AICourseGeneratorService::createCourseFromAIData()`

#### Tabelas Afetadas
- **courses**: Curso principal criado
- **activities**: Atividades do curso (quiz, reading, assignment)
- **badges**: Badges específicas do curso criado

#### Local de Armazenamento
```php
// Em AICourseGeneratorService::createCourseFromAIData()
$course = Course::create([
    'title' => $courseData['title'],
    'description' => $courseData['description'],
    'points_per_completion' => $courseData['points_per_completion'],
    'instructor_id' => $courseData['instructor_id'],
    'status' => 'draft'
]);
```

## 3. FLUXO DE AUTENTICAÇÃO

### Como Funciona o Login Atual

#### Detecção de Contexto
```php
// Em AuthenticatedSessionController::store()
$host = request()->getHost();
$centralDomains = config('tenancy.central_domains');
$isCentral = in_array($host, $centralDomains);
```

#### Processo de Login
1. **Verificação de Host**: Determina se é central ou tenant
2. **Validação de Credenciais**: Via `LoginRequest`
3. **Autenticação**: `$request->authenticate()`
4. **Regeneração de Sessão**: `$request->session()->regenerate()`
5. **Redirecionamento**: Baseado no contexto e role do usuário

### Onde Decide o Redirecionamento

#### Redirecionamento Principal (em `/routes/tenant.php`)
```php
Route::get('/dashboard', function() {
    if (!auth()->check()) {
        return redirect()->route('login');
    }

    $user = auth()->user();

    // Redirect based on user role
    switch ($user->role) {
        case 'admin':
            return redirect()->route('admin.dashboard');
        case 'instructor':
            return redirect()->route('admin.dashboard'); // Instructors also use admin dashboard
        case 'student':
            return redirect()->route('student.dashboard');
        default:
            return redirect()->route('student.dashboard');
    }
})->name('dashboard');
```

#### Redirecionamento Após Login
```php
// Em AuthenticatedSessionController::store()
if ($isCentral) {
    return redirect()->intended('/central/dashboard');
} else {
    return redirect()->intended(RouteServiceProvider::HOME);
}
```

### Como Identifica o Tipo de Usuário

#### Campo na Tabela Users
```php
// Migration: add_role_to_users_table.php
$table->enum('role', ['admin', 'instructor', 'student'])->default('student');
```

#### Métodos no Model User
```php
public function isAdmin()
{
    return $this->role === 'admin';
}

public function isInstructor()
{
    return $this->role === 'instructor';
}

public function isStudent()
{
    return $this->role === 'student';
}
```

## 4. ESTRUTURA DO BANCO

### Tabelas Principais

#### Central Database (saas_gamificacao_central)
- **tenants**: Informações dos tenants/organizações
- **domains**: Domínios associados aos tenants
- **users**: Usuários centrais (super admins)
- **plan_prices**: Preços dos planos disponíveis
- **tenant_contracts**: Contratos/assinaturas dos tenants
- **tenant_activities**: Log de atividades dos tenants

#### Tenant Databases (tenant[id])
- **users**: Usuários do tenant (admin, instructor, student)
- **courses**: Cursos criados no tenant
- **activities**: Atividades dos cursos (quiz, reading, assignment)
- **course_enrollments**: Matrículas dos estudantes
- **user_activities**: Progresso dos usuários nas atividades
- **badges**: Badges/conquistas disponíveis
- **user_badges**: Badges conquistadas pelos usuários
- **points**: Histórico de pontuação dos usuários
- **course_materials**: Materiais uploaded para os cursos

### Estrutura da Tabela Courses
```php
// Migration: create_courses_table.php
Schema::create('courses', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('description')->nullable();
    $table->string('image')->nullable();
    $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
    $table->integer('points_per_completion')->default(100);
    $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
    $table->timestamps();
});
```

### Estrutura da Tabela Users
```php
// Migration base: create_users_table.php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->rememberToken();
    $table->timestamps();
});

// Migration adicional: add_role_to_users_table.php
Schema::table('users', function (Blueprint $table) {
    $table->enum('role', ['admin', 'instructor', 'student'])->default('student')->after('email');
    $table->integer('total_points')->default(0)->after('role');
});

// Migration adicional: add_password_fields_to_users_table.php
Schema::table('users', function (Blueprint $table) {
    $table->boolean('password_is_temporary')->default(false);
    $table->timestamp('password_changed_at')->nullable();
    $table->timestamp('last_login_at')->nullable();
    $table->string('temporary_token')->nullable();
});
```

### Tenant_ID - Identificação

#### **NÃO EXISTE campo tenant_id nas tabelas tenant**
- O sistema usa **isolamento por banco de dados**
- Cada tenant possui sua própria base de dados separada
- A identificação é feita via **contexto do tenant inicializado**
- Exemplo: `tenantXXXX` é o nome do banco do tenant com ID XXXX

#### Identificação do Tenant Atual
```php
// Via helper global
$tenantId = tenant('id');

// Via facade
$tenant = tenancy()->tenant;

// Verificar se está em contexto tenant
if (tenancy()->initialized) {
    // Está em contexto tenant
}
```

## 5. COMPONENTES REACT

### Dashboard do Professor (Instructor)
- **Path**: `resources/js/Pages/Instructor/Dashboard.jsx`
- **Função**: Dashboard principal para instrutores
- **Componente adicional**: `resources/js/Pages/Instructor/CreateCourseWithAI.jsx`

### Componente EduAI
- **Dashboard Principal**: `resources/js/Pages/EduAI/Dashboard.jsx`
- **Canvas Visual**: `resources/js/Pages/EduAI/Canvas.jsx`
- **Geração Completa**: `resources/js/Pages/EduAI/GenerateComplete.jsx`

### Dashboard do Aluno (Student)
- **Dashboard Principal**: `resources/js/Pages/Student/Dashboard.jsx`
- **Dashboard Simples**: `resources/js/Pages/Student/DashboardSimple.jsx`
- **Cursos**: `resources/js/Pages/Student/Courses.jsx`
- **Curso Individual**: `resources/js/Pages/Student/Course.jsx`
- **Atividades**:
  - `resources/js/Pages/Student/Quiz.jsx`
  - `resources/js/Pages/Student/Reading.jsx`
  - `resources/js/Pages/Student/Assignment.jsx`
- **Gamificação**:
  - `resources/js/Pages/Student/Badges.jsx`
  - `resources/js/Pages/Student/Leaderboard.jsx`

### Dashboard do Admin
- **Path**: `resources/js/Pages/Admin/Dashboard.jsx`
- **Função**: Interface administrativa para gerenciar usuários, cursos, atividades e badges

---

**Observação**: Esta documentação reflete a estrutura atual do projeto sem modificações, apenas documentando o que existe atualmente.