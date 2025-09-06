<?php

declare(strict_types=1);

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\ActivityController as AdminActivityController;
use App\Http\Controllers\Admin\BadgeController as AdminBadgeController;
use App\Http\Controllers\Instructor\MaterialController;
use App\Http\Controllers\Instructor\CourseController;
use App\Http\Controllers\InstructorDashboardController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
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

// This file now contains tenant-specific routes
// NOTE: Root route (/) is handled in central.php for central domains

// Test route to debug auth issues
Route::get('/test-auth-route', function() {
    return 'Auth routes are loading!';
});
// For tenant domains, we can add a tenant-specific root route if needed

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        // Debug logging
        \Log::info('Dashboard route accessed', [
            'host' => request()->getHost(),
            'user' => auth()->user()?->email,
            'user_role' => auth()->user()?->role,
        ]);
        
        // Check if we're in central context (domain-based check)
        $host = request()->getHost();
        $centralDomains = config('tenancy.central_domains');
        
        if (in_array($host, $centralDomains)) {
            // Central context - redirect to central dashboard
            \Log::info('Redirecting to central dashboard');
            return redirect('/central/dashboard');
        }
        
        // Tenant context - redirect based on user role
        $user = auth()->user();
        
        \Log::info('Tenant context, user role: ' . $user?->role);
        
        return match ($user->role) {
            'admin' => redirect('/admin/dashboard'),
            'instructor' => redirect('/instructor/dashboard'),
            'student' => redirect('/student/dashboard'),
            default => Inertia::render('Dashboard')
        };
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
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






// Instructor Routes
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
    Route::get('courses/ai/create', [CourseController::class, 'createWithAI'])
        ->name('courses.ai.create');
    Route::post('courses/ai/generate', [CourseController::class, 'generateFromContent'])
        ->name('courses.ai.generate');
    Route::post('courses/ai/preview', [CourseController::class, 'previewGenerated'])
        ->name('courses.ai.preview');
});

// Student Routes (middleware temporariamente removido para teste)
Route::middleware(['auth', 'verified'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');
    Route::post('/enroll/{course}', [StudentDashboardController::class, 'enrollCourse'])->name('enroll');
    
    // Additional student routes
    Route::get('/courses', [StudentDashboardController::class, 'courses'])->name('courses');
    Route::get('/courses/{course}', [StudentDashboardController::class, 'showCourse'])->name('courses.show');
    Route::get('/activities/{activity}', [StudentDashboardController::class, 'showActivity'])->name('activities.show');
    Route::get('/quiz/{activity}', [StudentDashboardController::class, 'showActivity'])->name('quiz.show'); // Manter compatibilidade
    Route::post('/quiz/{activity}', [StudentDashboardController::class, 'submitQuiz'])->name('quiz.submit');
    
    Route::get('/progress', function () {
        return Inertia::render('Student/Progress');
    })->name('progress');
    
    Route::get('/badges', [StudentDashboardController::class, 'badges'])->name('badges');
    Route::get('/leaderboard', [StudentDashboardController::class, 'leaderboard'])->name('leaderboard');
});

// Rota de teste sem middleware
Route::get('/teste-dashboard', function() {
    return Inertia::render('Student/Dashboard');
});

// Rota de teste para arquivo
Route::get('/test-file', function() {
    $firstFile = '7DbDVqrcn8D3gidFm5FRo9sSSgqbtpLjR5n4GlJE.pdf';
    $path = storage_path('app/public/course_materials/' . $firstFile);
    
    if (!file_exists($path)) {
        return response('Arquivo não encontrado', 404);
    }
    
    return response()->file($path, [
        'Content-Type' => 'application/pdf',
        'Content-Disposition' => 'inline; filename="' . $firstFile . '"'
    ]);
});

// Test routes for development (REMOVE IN PRODUCTION)
Route::get('/test-login-admin', function() {
    $admin = \App\Models\User::where('role', 'admin')->first();
    if (!$admin) {
        return response('Admin não encontrado', 404);
    }
    \Illuminate\Support\Facades\Auth::login($admin);
    return redirect('/admin/dashboard');
});

Route::get('/test-login-student', function() {
    $student = \App\Models\User::where('role', 'student')->first();
    if (!$student) {
        return response('Estudante não encontrado', 404);
    }
    \Illuminate\Support\Facades\Auth::login($student);
    return redirect('/student/courses');
});

// Authentication routes for both central and tenant contexts
require __DIR__.'/auth.php';
