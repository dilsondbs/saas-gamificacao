<?php

declare(strict_types=1);

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\ActivityController as AdminActivityController;
use App\Http\Controllers\Admin\BadgeController as AdminBadgeController;
use App\Http\Controllers\Instructor\MaterialController;
use App\Http\Controllers\Instructor\CourseController as InstructorCourseController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\InstructorDashboardController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\FinalChallengeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// CSRF Token Refresh Route (deve estar antes de qualquer middleware)
Route::get('/refresh-csrf', function () {
    return response()->json([
        'csrf_token' => csrf_token()
    ]);
})->name('refresh-csrf');

// Root route - Landing page (handles both central and tenant contexts)
Route::get('/', function () {
    // Check if this is a central domain request
    $host = request()->getHost();
    $centralDomains = config('tenancy.central_domains', ['127.0.0.1', 'localhost', 'saas-gamificacao.local']);

    // If this is a central domain, show central landing page
    if (in_array($host, $centralDomains)) {
        try {
            // Buscar preços de catálogo atualizados (with error handling)
            $catalogPrices = [];
            try {
                $catalogPrices = \App\Models\PlanPrice::pluck('price', 'plan_name')->toArray();
            } catch (\Exception $e) {
                \Log::warning('Could not load catalog prices: ' . $e->getMessage());
            }

            // Valores padrão caso não existam no banco
            $defaultPrices = [
                'teste' => 0.00,
                'basic' => 19.90,
                'premium' => 49.90,
                'enterprise' => 199.00
            ];

            // Mesclar com valores padrão
            $finalPrices = array_merge($defaultPrices, $catalogPrices);

            return \Inertia\Inertia::render('Landing', [
                'canLogin' => \Route::has('central.login'),
                'canRegister' => true,
                'catalogPrices' => $finalPrices
            ]);
        } catch (\Exception $e) {
            \Log::error('Landing page error: ' . $e->getMessage());
            return response('Erro na página inicial: ' . $e->getMessage(), 500);
        }
    }

    // This is a TENANT domain - show tenant-specific landing/login
    if (auth()->check()) {
        $user = auth()->user();

        // Ensure user belongs to current tenant (basic tenant isolation check)
        $tenantContextService = app(\App\Services\TenantContextService::class);
        $currentTenantId = $tenantContextService->getCurrentTenantId();

        if ($user->tenant_id != $currentTenantId) {
            auth()->logout();
            return redirect('/login')->with('error', 'Acesso negado: usuário não pertence a este tenant.');
        }

        // Redirect based on user role within tenant
        switch($user->role) {
            case 'admin':
                return redirect('/admin/dashboard');
            case 'instructor':
                return redirect('/instructor/dashboard');
            case 'student':
                return redirect('/student/dashboard');
            default:
                return redirect('/dashboard');
        }
    }

    // If not authenticated, show tenant-specific landing page
    $tenantContextService = app(\App\Services\TenantContextService::class);
    $currentTenantId = $tenantContextService->getCurrentTenantId();

    $tenantInfo = [
        'domain' => $host,
        'name' => ucfirst(str_replace(['.saas-gamificacao.local', '-'], [' ', ' '], $host)),
        'message' => 'Bem-vindo à nossa plataforma de ensino gamificado'
    ];

    // Try to get real tenant information if available
    if ($currentTenantId) {
        try {
            $tenant = \App\Models\Tenant::find($currentTenantId);
            if ($tenant) {
                $tenantInfo['name'] = $tenant->name ?: $tenantInfo['name'];
                $tenantInfo['id'] = $tenant->id;
            }
        } catch (\Exception $e) {
            // Use default values if tenant not found
        }
    }

    return Inertia::render('TenantLanding', [
        'isTenant' => true,
        'tenantInfo' => $tenantInfo
    ]);
});

// This file now contains tenant-specific routes
// NOTE: Root route (/) is handled in central.php for central domains

// For tenant domains, we can add a tenant-specific root route if needed

// Impersonate route (no auth required, uses token)
Route::get('/impersonate/{token}', [App\Http\Controllers\ImpersonateController::class, 'loginWithToken'])
    ->name('impersonate.token');

Route::middleware(['auth', 'verified', 'temporary.password'])->group(function () {
    // Main dashboard route using new DashboardController
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'temporary.password', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // User management
    Route::resource('users', AdminUserController::class);

    // Course management
    Route::resource('courses', AdminCourseController::class);

    // Activity management
    Route::resource('activities', AdminActivityController::class);

    // Badge management
    Route::resource('badges', AdminBadgeController::class);
});

// EduAI Routes (para instructors)
Route::middleware(['auth', 'verified', 'temporary.password', 'eduai.access'])->prefix('eduai')->name('eduai.')->group(function () {
    Route::get('/', [App\Http\Controllers\EduAIController::class, 'index'])->name('dashboard');
    Route::get('/generate-complete', [App\Http\Controllers\EduAIController::class, 'generateComplete'])->name('generate-complete');
    Route::get('/canvas/{canvasId?}', [App\Http\Controllers\EduAIController::class, 'showCanvas'])->name('canvas');
    Route::post('/generate-course', [App\Http\Controllers\EduAIController::class, 'generateCourse'])->name('generate-course');
    Route::post('/generate-course-from-file', [App\Http\Controllers\EduAIController::class, 'generateCourseFromFile'])->name('generate-course-from-file');
    Route::post('/generate-activities', [App\Http\Controllers\EduAIController::class, 'generateActivities'])->name('generate-activities');
    Route::post('/generate-badges', [App\Http\Controllers\EduAIController::class, 'generateBadges'])->name('generate-badges');
    Route::post('/generate-canvas', [App\Http\Controllers\EduAIController::class, 'generateCanvas'])->name('generate-canvas');
    Route::post('/generate-complete-package', [App\Http\Controllers\EduAIController::class, 'generateCompletePackage'])->name('generate-complete-package');
    Route::post('/save-course', [App\Http\Controllers\EduAIController::class, 'saveCourse'])->name('save-course');
    Route::post('/save-canvas', [App\Http\Controllers\EduAIController::class, 'saveCanvas'])->name('save-canvas');
});






// Instructor Routes
Route::middleware(['auth', 'verified', 'temporary.password', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
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
    
    // Activity CRUD routes
    Route::get('/activities', [InstructorDashboardController::class, 'activities'])->name('activities.index');
    Route::get('/activities/create', [InstructorDashboardController::class, 'createActivity'])->name('activities.create');
    Route::post('/activities', [InstructorDashboardController::class, 'storeActivity'])->name('activities.store');
    Route::get('/activities/{activity}', [InstructorDashboardController::class, 'showActivity'])->name('activities.show');
    Route::get('/activities/{activity}/edit', [InstructorDashboardController::class, 'editActivity'])->name('activities.edit');
    Route::put('/activities/{activity}', [InstructorDashboardController::class, 'updateActivity'])->name('activities.update');
    Route::delete('/activities/{activity}', [InstructorDashboardController::class, 'destroyActivity'])->name('activities.destroy');
    
    // Activities for specific course
    Route::get('/courses/{course}/activities/create', [InstructorDashboardController::class, 'createActivityForCourse'])->name('courses.activities.create');
    
    // Material management
    Route::resource('materials', MaterialController::class);
    Route::get('courses/{course}/materials/create', [MaterialController::class, 'create'])
        ->name('courses.materials.create');
    Route::get('materials/{material}/download', [MaterialController::class, 'downloadFile'])
        ->name('materials.download');
    Route::get('materials/{material}/file', [MaterialController::class, 'serveFile'])
        ->name('materials.file');
    
    // AI Course Generation
    Route::post('courses/{course}/generate-from-material', [MaterialController::class, 'generateCourseFromMaterial'])
        ->name('courses.generate');
    
    // AI Course Generation from Content
    Route::get('courses/ai/create', [InstructorCourseController::class, 'createWithAI'])
        ->name('courses.ai.create');
    Route::post('courses/ai/generate', [InstructorCourseController::class, 'generateFromContent'])
        ->name('courses.ai.generate');
    Route::post('courses/ai/preview', [InstructorCourseController::class, 'previewGenerated'])
        ->name('courses.ai.preview');
});

// Course Routes (Available for instructors and admins)
Route::middleware(['auth', 'verified'])->group(function () {
    // Course CRUD routes
    Route::resource('courses', CourseController::class);

    // Additional course actions
    Route::post('courses/{course}/duplicate', [CourseController::class, 'duplicate'])->name('courses.duplicate');
    Route::post('courses/{course}/publish', [CourseController::class, 'publish'])->name('courses.publish');
    Route::post('courses/{course}/archive', [CourseController::class, 'archive'])->name('courses.archive');

    // AI Course Generation
    Route::post('courses/generate-ai', [CourseController::class, 'generateFromAI'])->name('courses.generate-ai');

    // Material Upload and Processing (Enhanced)
    Route::post('courses/{course}/upload-material', [CourseController::class, 'uploadMaterial'])->name('courses.upload-material');

    // Modern Material Upload Interface
    Route::get('courses/{course}/materials/upload', [App\Http\Controllers\MaterialUploadController::class, 'show'])->name('materials.upload.show');
    Route::post('courses/{course}/materials/upload', [App\Http\Controllers\MaterialUploadController::class, 'upload'])->name('materials.upload.store');
    Route::post('courses/{course}/materials/generate', [App\Http\Controllers\MaterialUploadController::class, 'generateActivities'])->name('materials.generate');
    Route::post('materials/validate', [App\Http\Controllers\MaterialUploadController::class, 'validateFile'])->name('materials.validate');
    Route::get('materials/{material}/preview', [App\Http\Controllers\MaterialUploadController::class, 'preview'])->name('materials.preview');
    Route::delete('materials/{material}', [App\Http\Controllers\MaterialUploadController::class, 'delete'])->name('materials.delete');
});

// Student Routes
Route::middleware(['auth', 'verified', 'temporary.password', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');
    Route::post('/enroll/{course}', [StudentDashboardController::class, 'enrollCourse'])->name('enroll');
    Route::get('/courses', [StudentDashboardController::class, 'courses'])->name('courses');
    Route::get('/courses/{course}', [StudentDashboardController::class, 'showCourse'])->name('courses.show');
    Route::get('/badges', [StudentDashboardController::class, 'badges'])->name('badges');
    Route::get('/leaderboard', [StudentDashboardController::class, 'leaderboard'])->name('leaderboard');

    // Desafio Final
    Route::prefix('courses/{course}/challenge')->name('challenge.')->group(function () {
        Route::get('/', [FinalChallengeController::class, 'show'])->name('show');
        Route::post('/start', [FinalChallengeController::class, 'start'])->name('start');
        Route::post('/submit', [FinalChallengeController::class, 'submit'])->name('submit');
        Route::post('/motivation/send', [FinalChallengeController::class, 'sendMotivation'])->name('motivation.send');
    });

    Route::post('/motivation/{motivation}/confirm', [FinalChallengeController::class, 'confirmMotivation'])->name('challenge.motivation.confirm');
});

// ROTAS DE TESTE REMOVIDAS POR SEGURANÇA
// Essas rotas permitiam bypass de autenticação e vazamento de dados entre tenants
// Removidas em: 2025-09-22 para correção definitiva do sistema multi-tenant



// Public store routes (for tenant sales pages) - APENAS PARA TENANTS
// NOTA: A rota '/' será adicionada apenas no tenant.php para não conflitar com central

// Progress and Unlock System Routes
Route::middleware(['auth', 'verified'])->prefix('progress')->name('progress.')->group(function () {
    // Check activity access
    Route::get('/activity/{activity}/check', [App\Http\Controllers\ProgressController::class, 'checkActivityAccess'])->name('activity.check');

    // Check course progression
    Route::get('/course/{course}', [App\Http\Controllers\ProgressController::class, 'checkCourseProgression'])->name('course.check');

    // Complete activity
    Route::post('/activity/{activity}/complete', [App\Http\Controllers\ProgressController::class, 'completeActivity'])->name('activity.complete');

    // User overall progress
    Route::get('/user/overall', [App\Http\Controllers\ProgressController::class, 'getUserOverallProgress'])->name('user.overall');
});

// Gamification System Routes
Route::middleware(['auth', 'verified'])->prefix('gamification')->name('gamification.')->group(function () {
    // Process gamification events
    Route::post('/activity/completed', [App\Http\Controllers\GameController::class, 'processActivityCompletion'])->name('activity.completed');
    Route::post('/course/enrolled', [App\Http\Controllers\GameController::class, 'processCourseEnrollment'])->name('course.enrolled');
    Route::post('/course/completed', [App\Http\Controllers\GameController::class, 'processCourseCompletion'])->name('course.completed');

    // User gamification status
    Route::get('/user/{user}/status', [App\Http\Controllers\GameController::class, 'getUserGamificationStatus'])->name('user.status');
    Route::post('/user/{user}/recalculate', [App\Http\Controllers\GameController::class, 'recalculateUserGamification'])->name('user.recalculate');

    // Leaderboard and rankings
    Route::get('/leaderboard', [App\Http\Controllers\GameController::class, 'getLeaderboard'])->name('leaderboard');
    Route::get('/user/{user}/rank', [App\Http\Controllers\GameController::class, 'getUserRank'])->name('user.rank');

    // Notifications
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'getUserNotifications'])->name('notifications.index');
    Route::post('/notifications/{notificationId}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::delete('/notifications', [App\Http\Controllers\NotificationController::class, 'clearAll'])->name('notifications.clear');
});

// Student Activity Routes with Progression Check
Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
    // Activity access with progression middleware
    Route::get('/activities/{activity}', [StudentDashboardController::class, 'showActivity'])
        ->middleware('progression.check')
        ->name('activities.show');

    // Quiz routes with progression check
    Route::get('/quiz/{activity}', [StudentDashboardController::class, 'showActivity'])
        ->middleware('progression.check')
        ->name('quiz.show');

    Route::post('/quiz/{activity}', [StudentDashboardController::class, 'submitQuiz'])
        ->middleware('progression.check')
        ->name('quiz.submit');

    // Activity list (no restriction)
    Route::get('/activities', [StudentDashboardController::class, 'activities'])->name('activities.index');
});

// Tenant Cancellation Routes (only available in tenant context)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/account/cancel', [App\Http\Controllers\TenantCancellationController::class, 'showCancellationForm'])->name('tenant.cancel.form');
    Route::post('/account/cancel', [App\Http\Controllers\TenantCancellationController::class, 'processCancellation'])->name('tenant.cancel.process');
    Route::post('/account/restore', [App\Http\Controllers\TenantCancellationController::class, 'restoreTenant'])->name('tenant.restore');
});







// Authentication routes for both central and tenant contexts
require __DIR__.'/auth.php';
