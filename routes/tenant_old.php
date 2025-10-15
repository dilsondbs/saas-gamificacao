<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use App\Http\Controllers\Public\StoreController;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    // Impersonation route (must be before other auth routes)
    Route::get('/impersonate/{token}', [App\Http\Controllers\ImpersonateController::class, 'loginWithToken'])
        ->name('impersonate.login');

    // Import only auth routes (avoid dashboard conflicts)
    require base_path('routes/auth.php');

    // CREATING NEW TEST ROUTE BECAUSE DASHBOARD CACHE ISSUE
    Route::get('/test-dashboard-json', function() {
        return response()->json([
            'message' => 'Test Dashboard working!',
            'user' => auth()->user()->name ?? 'Not logged',
            'authenticated' => auth()->check(),
            'tenant' => tenant('id') ?? 'No tenant',
            'time' => now()->toString()
        ]);
    })->name('test.dashboard');

    // Main dashboard route for tenants - REDIRECT BASED ON USER ROLE
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

    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin Routes for tenants (admin tenant management) - TEMPORARILY REMOVED temporary.password middleware
    Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/stats', [App\Http\Controllers\AdminDashboardController::class, 'getStats'])->name('stats');

        // User management routes
        Route::resource('users', App\Http\Controllers\Admin\UserController::class);

        // Course management routes
        Route::resource('courses', App\Http\Controllers\Admin\CourseController::class);

        // Badge management routes
        Route::resource('badges', App\Http\Controllers\Admin\BadgeController::class);

        // Activity management routes
        Route::resource('activities', App\Http\Controllers\Admin\ActivityController::class);
    });

    // Student Routes for tenants (explicit definition to ensure they work) - TEMPORARILY REMOVED temporary.password middleware
    Route::middleware(['auth'])->prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Student\DashboardController::class, 'index'])->name('dashboard');
        Route::post('/enroll/{course}', [App\Http\Controllers\Student\DashboardController::class, 'enrollCourse'])->name('enroll');

        // Course routes
        Route::get('/courses', [App\Http\Controllers\Student\DashboardController::class, 'courses'])->name('courses');
        Route::get('/courses/{id}', [App\Http\Controllers\Student\DashboardController::class, 'showCourseById'])->name('courses.show');

        // Activity routes
        Route::get('/activities/{id}', [App\Http\Controllers\Student\DashboardController::class, 'showActivityById'])->name('activities.show');
        Route::get('/quiz/{id}', [App\Http\Controllers\Student\DashboardController::class, 'showActivityById'])->name('quiz.show');
        Route::post('/quiz/{id}', [App\Http\Controllers\Student\DashboardController::class, 'submitQuizById'])->name('quiz.submit');

        // Other student routes
        Route::get('/badges', [App\Http\Controllers\Student\DashboardController::class, 'badges'])->name('badges');
        Route::get('/leaderboard', [App\Http\Controllers\Student\DashboardController::class, 'leaderboard'])->name('leaderboard');

        // TEST ROUTES - Remove after fixing
        Route::get('/test', function() {
            return response()->json(['message' => 'Student routes working!', 'user' => auth()->user()->name ?? 'Not logged']);
        })->name('test');

        Route::get('/test-course/{id}', function($id) {
            return response()->json(['message' => 'Course ID received', 'course_id' => $id]);
        })->name('test-course');
    });

    // EduAI Routes for tenants (ONLY admin and instructor) - TEMPORARILY REMOVED temporary.password middleware
    Route::middleware(['auth', 'verified', 'eduai.access'])->prefix('eduai')->name('eduai.')->group(function () {
        Route::get('/', [App\Http\Controllers\EduAIController::class, 'index'])->name('dashboard');
        Route::get('/generate-complete', [App\Http\Controllers\EduAIController::class, 'generateComplete'])->name('generate-complete');
        Route::get('/canvas/{canvasId?}', [App\Http\Controllers\EduAIController::class, 'showCanvas'])->name('canvas');

        // API endpoints for AI generation
        Route::post('/generate-course', [App\Http\Controllers\EduAIController::class, 'generateCourse'])->name('generate-course');
        Route::post('/generate-course-from-file', [App\Http\Controllers\EduAIController::class, 'generateCourseFromFile'])->name('generate-course-from-file');
        Route::post('/generate-activities', [App\Http\Controllers\EduAIController::class, 'generateActivities'])->name('generate-activities');
        Route::post('/generate-badges', [App\Http\Controllers\EduAIController::class, 'generateBadges'])->name('generate-badges');
        Route::post('/generate-canvas', [App\Http\Controllers\EduAIController::class, 'generateCanvas'])->name('generate-canvas');
        Route::post('/generate-complete-package', [App\Http\Controllers\EduAIController::class, 'generateCompletePackage'])->name('generate-complete-package');
        Route::post('/save-course', [App\Http\Controllers\EduAIController::class, 'saveCourse'])->name('save-course');
        Route::post('/save-canvas', [App\Http\Controllers\EduAIController::class, 'saveCanvas'])->name('save-canvas');
    });

    // Fix: Rota de matrícula direta para resolver problema do Ziggy
    Route::post('/enroll/{course}', [App\Http\Controllers\Student\DashboardController::class, 'enrollCourse'])
        ->name('enroll')
        ->middleware('auth');

    // Invitation routes for admins and instructors - TEMPORARILY REMOVED temporary.password middleware
    Route::middleware(['auth', 'role:admin,instructor'])->group(function () {
        Route::get('/invitations', [App\Http\Controllers\UserInvitationController::class, 'index'])->name('invitations.index');
        Route::get('/invitations/create', [App\Http\Controllers\UserInvitationController::class, 'create'])->name('invitations.create');
        Route::post('/invitations', [App\Http\Controllers\UserInvitationController::class, 'store'])->name('invitations.store');
        Route::post('/invitations/{invitation}/cancel', [App\Http\Controllers\UserInvitationController::class, 'cancel'])->name('invitations.cancel');
        Route::post('/invitations/{invitation}/resend', [App\Http\Controllers\UserInvitationController::class, 'resend'])->name('invitations.resend');
    });

    // Public invitation acceptance routes (no auth required)
    Route::get('/accept-invitation/{token}', [App\Http\Controllers\UserInvitationController::class, 'show'])->name('invitations.show');
    Route::post('/accept-invitation/{token}', [App\Http\Controllers\UserInvitationController::class, 'accept'])->name('invitations.accept');

    // Public store routes (APENAS para tenants - vendas de cursos)
    Route::get('/', [StoreController::class, 'homepage'])->name('public.homepage');
    Route::get('/cursos', [StoreController::class, 'catalog'])->name('public.catalog');
    Route::get('/curso/{slug}', [StoreController::class, 'course'])->name('public.course');
    Route::post('/matricular/{course}', [StoreController::class, 'enroll'])->name('public.enroll')->middleware('auth');
});
