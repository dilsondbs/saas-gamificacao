<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Central App Routes
|--------------------------------------------------------------------------
|
| Here are routes for the central application (landlord).
| These routes handle tenant management, billing, and public pages.
|
*/

// ROTAS DE DEBUG REMOVIDAS POR SEGURANÇA
// Rotas de teste que expunham dados sensíveis removidas em: 2025-09-22
// Incluindo: debug-central, test-central-login, debug-central-users, debug-auth-test


// Central login page
Route::middleware(['central', 'guest'])->get('/central-login', function () {
    return Inertia::render('Auth/Login', [
        'status' => session('status'),
        'canResetPassword' => Route::has('password.request'),
        'isCentral' => true,
    ]);
})->name('central.login.form');

// Central login processing
Route::middleware(['central', 'guest'])->post('/central-login', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'email' => 'required|string|email',
        'password' => 'required|string',
    ]);

    // Check user in central database
    $admin = \DB::connection('central')->table('users')
              ->where('email', $request->email)
              ->first();
    
    if ($admin && \Hash::check($request->password, $admin->password)) {
        // Create Laravel auth user from central DB
        $user = new \App\Models\User();
        $user->forceFill([
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => $admin->role,
        ]);
        $user->exists = true;
        
        \Auth::login($user);
        
        // Force redirect to central dashboard (not intended route)
        return redirect('/central/dashboard');
    }
    
    return back()->withErrors([
        'email' => 'Credenciais inválidas para o sistema central.',
    ]);
});

// Central logout (handled by AuthenticatedSessionController at line 145)

// Quick access route (development) - redirects to login
Route::middleware(['central'])->get('/central-access', function () {
    return redirect('/central-login')->with('status', 'Faça login para acessar o painel central.');
});

// Landing page moved to web.php to handle both central and tenant contexts

// Favicon route with central middleware
Route::middleware('central')->get('/favicon.ico', function () {
    return response()->file(public_path('favicon.ico'));
});

// Authentication routes for central context only
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;

// COMMENTED OUT: These routes are already defined in routes/auth.php
// Defining them here with 'central' middleware blocks tenant access
// Keep only central-specific routes like /central-login

// Route::middleware(['central', 'guest'])->group(function () {
//     Route::get('login', [AuthenticatedSessionController::class, 'create'])
//                 ->name('central.login');
//     Route::post('login', [AuthenticatedSessionController::class, 'store'])
//                 ->name('central.login.store');
//
//     Route::get('register', [RegisteredUserController::class, 'create'])
//                 ->name('central.register.page');
//     Route::post('register', [RegisteredUserController::class, 'store'])
//                 ->name('central.register.store');
//
//     Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
//                 ->name('central.password.request');
//     Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
//                 ->name('central.password.email');
//
//     Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
//                 ->name('central.password.reset');
//     Route::post('reset-password', [NewPasswordController::class, 'store'])
//                 ->name('central.password.store');
// });

Route::middleware(['central', 'auth'])->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
                ->name('central.logout');
});

// Development help - show available routes
Route::get('/help', function () {
    return response()->json([
        'message' => 'Rotas disponíveis no sistema',
        'central_routes' => [
            'login' => 'http://127.0.0.1:8000/login',
            'register' => 'http://127.0.0.1:8000/register',
            'central_dashboard' => 'http://127.0.0.1:8000/central/dashboard',
            'tenants_info' => 'http://127.0.0.1:8000/tenants-dev'
        ],
        'tenant_routes_need_hosts_config' => [
            'tenant_login' => 'http://escola-teste.saas-gamificacao.local:8000/login',
            'student_dashboard' => 'http://escola-teste.saas-gamificacao.local:8000/student/dashboard',
            'admin_dashboard' => 'http://escola-teste.saas-gamificacao.local:8000/admin/dashboard'
        ],
        'error_404_means' => 'Você está tentando acessar rota de tenant no contexto central, ou vice-versa'
    ]);
});

// Development - List all tenants for easy access
Route::get('/tenants-dev', function () {
    $tenants = \App\Models\Tenant::get(['id', 'name', 'slug', 'plan']);

    $tenantsWithUrls = $tenants->map(function ($tenant) {
        // Criar domínio baseado no slug
        $domain = "{$tenant->slug}.saas-gamificacao.local";

        return [
            'id' => $tenant->id,
            'name' => $tenant->name,
            'slug' => $tenant->slug,
            'plan' => $tenant->plan,
            'domain' => $domain,
            // URLs para teste com curl
            'curl_login' => "curl -H \"Host: {$domain}\" http://127.0.0.1:8000/login",
            'curl_dashboard' => "curl -H \"Host: {$domain}\" http://127.0.0.1:8000/student/dashboard",
            // Instruções para hosts
            'hosts_entry' => "127.0.0.1 {$domain}",
            'browser_url' => "http://{$domain}:8000",
        ];
    });
    
    return response()->json([
        'message' => 'Tenants disponíveis para desenvolvimento',
        'instructions' => [
            '1. OPÇÃO HOSTS: Adicione as entradas abaixo no arquivo C:\\Windows\\System32\\drivers\\etc\\hosts',
            '2. OPÇÃO CURL: Use os comandos curl para testar',
            '3. Usuários de teste: admin@saas-gamificacao.com, joao@saas-gamificacao.com, aluno1@saas-gamificacao.com (senha: password)'
        ],
        'tenants' => $tenantsWithUrls
    ]);
});

// Central dashboard route without prefix (for direct /dashboard access)
Route::middleware(['central', 'auth', 'verified'])->get('/dashboard', function () {
    return redirect('/central/dashboard');
})->name('central.dashboard.redirect');

// Profile management routes for central users
Route::middleware(['central', 'auth', 'verified'])->group(function () {
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('central.profile.edit');
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('central.profile.update');
    Route::delete('/profile', [\App\Http\Controllers\ProfileController::class, 'destroy'])->name('central.profile.destroy');
});

// Tenant management routes (for super admins)
// TODO: TEMPORÁRIO - Remover bypass após corrigir autenticação central
// Route::middleware(['central', 'auth', 'verified'])->prefix('central')->name('central.')->group(function () {
Route::middleware(['central', 'central.user'])->prefix('central')->name('central.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Central\DashboardController::class, 'index'])
        ->name('dashboard');
    
    // Tenant CRUD routes
    Route::resource('tenants', \App\Http\Controllers\Central\TenantController::class);
    Route::post('tenants/{tenant}/toggle-status', [\App\Http\Controllers\Central\TenantController::class, 'toggleStatus'])
        ->name('tenants.toggle-status');
    Route::post('tenants/{tenant}/impersonate', [\App\Http\Controllers\Central\TenantController::class, 'impersonate'])
        ->name('tenants.impersonate');
    
    // Billing routes
    Route::get('/billing', [\App\Http\Controllers\Central\BillingController::class, 'index'])
        ->name('billing');
    Route::post('/billing/update-plan-price', [\App\Http\Controllers\Central\BillingController::class, 'updatePlanPrice'])
        ->name('billing.update-plan-price');
    Route::post('/billing/contracts/{contract}/update-price', [\App\Http\Controllers\Central\BillingController::class, 'updateContractPrice'])
        ->name('billing.update-contract-price');

    // AI Usage Reports
    Route::get('/ai-usage', [\App\Http\Controllers\Central\AiUsageReportController::class, 'index'])
        ->name('ai-usage');
});

// Registration routes (public - no auth required)
Route::middleware(['central'])->group(function () {
    // Registration flow routes
    Route::get('/signup', [\App\Http\Controllers\Central\RegistrationController::class, 'create'])
        ->name('central.register');
    Route::post('/signup/step1', [\App\Http\Controllers\Central\RegistrationController::class, 'storeStep1'])
        ->name('central.register.step1');
    Route::get('/signup/step2', [\App\Http\Controllers\Central\RegistrationController::class, 'showStep2'])
        ->name('central.register.step2');
    Route::post('/signup/step2', [\App\Http\Controllers\Central\RegistrationController::class, 'storeStep2'])
        ->name('central.register.step2.store');
    Route::get('/signup/step3', [\App\Http\Controllers\Central\RegistrationController::class, 'showStep3'])
        ->name('central.register.step3');
    Route::post('/signup/step3', [\App\Http\Controllers\Central\RegistrationController::class, 'processStep3'])
        ->name('central.register.step3.process');
    Route::get('/signup/step4', [\App\Http\Controllers\Central\RegistrationController::class, 'showStep4'])
        ->name('central.register.step4');
    Route::post('/signup/complete', [\App\Http\Controllers\Central\RegistrationController::class, 'complete'])
        ->name('central.register.complete');

    // API routes for registration (non-async)
    Route::get('/api/check-slug', [\App\Http\Controllers\Central\RegistrationController::class, 'checkSlug'])
        ->name('central.api.check-slug');

    Route::post('/signup/start-creation', [\App\Http\Controllers\Central\RegistrationController::class, 'startCreation'])
        ->name('central.register.start-creation');
});

// Async API endpoints (no Inertia middleware)
Route::middleware(['central'])->withoutMiddleware([\App\Http\Middleware\HandleInertiaRequests::class, \App\Http\Middleware\VerifyCsrfToken::class])->group(function () {

    Route::get('/signup/creation-status/{creationId}', [\App\Http\Controllers\Central\RegistrationController::class, 'checkCreationStatus'])
        ->name('central.register.check-status');

    Route::get('/api/tenant-creation-result/{creationId}', [\App\Http\Controllers\Central\RegistrationController::class, 'getCreationResult'])
        ->name('central.register.get-result');
});

// Test routes for development (REMOVE IN PRODUCTION)
Route::middleware('central')->get('/test-login-admin', function() {
    $admin = \App\Models\User::where('role', 'admin')->first();
    if (!$admin) {
        return response('Admin não encontrado', 404);
    }
    \Illuminate\Support\Facades\Auth::login($admin);
    return redirect('/admin/dashboard');
});

Route::middleware('central')->get('/test-login-student', function() {
    $student = \App\Models\User::where('role', 'student')->first();
    if (!$student) {
        return response('Estudante não encontrado', 404);
    }
    \Illuminate\Support\Facades\Auth::login($student);
    return redirect('/student/courses');
});

// Temporary development login route for testing admin interface
Route::get('/dev-login-admin', function() {
    $admin = \App\Models\User::where('role', 'admin')->first();
    if (!$admin) {
        return response('Admin não encontrado', 404);
    }
    \Illuminate\Support\Facades\Auth::login($admin);
    return redirect('/central/dashboard')->with('success', 'Login realizado como admin!');
});

// Authentication routes removed from here to avoid duplicates
// They are loaded in RouteServiceProvider via web.php