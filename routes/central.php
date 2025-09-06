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

// Debug route to test middleware
Route::get('/debug-central', function () {
    return response()->json([
        'host' => request()->getHost(),
        'central_domains' => config('tenancy.central_domains'),
        'is_central' => in_array(request()->getHost(), config('tenancy.central_domains')),
        'tenant_bound' => app()->bound('tenant'),
    ]);
});

// Test login route specifically for central
Route::middleware(['central'])->get('/test-central-login', function () {
    return 'Central login test working!';
});

// Test dashboard detection without auth
Route::get('/test-dashboard-detection', function () {
    $host = request()->getHost();
    $centralDomains = config('tenancy.central_domains');
    $isCentral = in_array($host, $centralDomains);
    
    return response()->json([
        'host' => $host,
        'is_central' => $isCentral,
        'should_redirect_to' => $isCentral ? '/central/dashboard' : 'tenant dashboard'
    ]);
});

// Debug: Check central users
Route::middleware(['central'])->get('/debug-central-users', function () {
    try {
        $users = \DB::connection('central')->table('users')->get();
        return response()->json([
            'users_count' => $users->count(),
            'users' => $users->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'has_password' => !empty($user->password)
                ];
            })
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()]);
    }
});

// Debug: Test specific user authentication
Route::middleware(['central'])->post('/debug-auth-test', function (\Illuminate\Http\Request $request) {
    $email = $request->input('email', 'super@saas-gamificacao.com');
    $password = $request->input('password', 'password');
    
    $user = \DB::connection('central')->table('users')
              ->where('email', $email)
              ->first();
    
    if (!$user) {
        return response()->json(['error' => 'User not found', 'email' => $email]);
    }
    
    $passwordCheck = \Hash::check($password, $user->password);
    
    return response()->json([
        'user_found' => true,
        'email' => $user->email,
        'name' => $user->name,
        'password_hash_preview' => substr($user->password, 0, 20) . '...',
        'password_check_result' => $passwordCheck,
        'testing_password' => $password
    ]);
});


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

// Central logout
Route::middleware(['central', 'auth'])->post('/central-logout', function () {
    \Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    
    return redirect('/central-login');
})->name('central.logout');

// Quick access route (development) - redirects to login
Route::middleware(['central'])->get('/central-access', function () {
    return redirect('/central-login')->with('status', 'Faça login para acessar o painel central.');
});

// Public landing page with central middleware
Route::middleware('central')->get('/', function () {
    return Inertia::render('Landing', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// Favicon route with central middleware
Route::middleware('central')->get('/favicon.ico', function () {
    return response()->file(public_path('favicon.ico'));
});

// Authentication routes for central context
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;

Route::middleware(['central', 'guest'])->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
                ->name('central.login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])
                ->name('central.login.store');
    
    Route::get('register', [RegisteredUserController::class, 'create'])
                ->name('central.register');
    Route::post('register', [RegisteredUserController::class, 'store'])
                ->name('central.register.store');
    
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
                ->name('central.password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
                ->name('central.password.email');
    
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
                ->name('central.password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])
                ->name('central.password.store');
});

Route::middleware(['central', 'auth'])->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
                ->name('central.logout');
});

// Development help - show available routes
Route::get('/help', function () {
    return response()->json([
        'message' => 'Rotas disponíveis no sistema',
        'central_routes' => [
            'login' => 'http://127.0.0.1:8080/login',
            'register' => 'http://127.0.0.1:8080/register', 
            'central_dashboard' => 'http://127.0.0.1:8080/central/dashboard',
            'tenants_info' => 'http://127.0.0.1:8080/tenants-dev'
        ],
        'tenant_routes_need_hosts_config' => [
            'tenant_login' => 'http://escola-teste.saas-gamificacao.local:8080/login',
            'student_dashboard' => 'http://escola-teste.saas-gamificacao.local:8080/student/dashboard',
            'admin_dashboard' => 'http://escola-teste.saas-gamificacao.local:8080/admin/dashboard'
        ],
        'error_404_means' => 'Você está tentando acessar rota de tenant no contexto central, ou vice-versa'
    ]);
});

// Development - List all tenants for easy access
Route::get('/tenants-dev', function () {
    $tenants = \App\Models\Tenant::all(['id', 'name', 'slug', 'plan']);
    
    $tenantsWithUrls = $tenants->map(function ($tenant) {
        $domain = $tenant->domains->first();
        return [
            'id' => $tenant->id,
            'name' => $tenant->name,
            'slug' => $tenant->slug,
            'plan' => $tenant->plan,
            'domain' => $domain ? $domain->domain : null,
            // URLs para teste com curl
            'curl_login' => "curl -H \"Host: {$domain->domain}\" http://127.0.0.1:8080/login",
            'curl_dashboard' => "curl -H \"Host: {$domain->domain}\" http://127.0.0.1:8080/student/dashboard",
            // Instruções para hosts
            'hosts_entry' => "127.0.0.1 {$domain->domain}",
            'browser_url' => $domain ? "http://{$domain->domain}:8080" : null,
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

// Tenant management routes (for super admins)
Route::middleware(['central', 'auth', 'verified'])->prefix('central')->name('central.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Central/Dashboard');
    })->name('dashboard');
    
    // Tenant CRUD routes
    Route::resource('tenants', \App\Http\Controllers\Central\TenantController::class);
    Route::post('tenants/{tenant}/toggle-status', [\App\Http\Controllers\Central\TenantController::class, 'toggleStatus'])
        ->name('tenants.toggle-status');
    Route::post('tenants/{tenant}/impersonate', [\App\Http\Controllers\Central\TenantController::class, 'impersonate'])
        ->name('tenants.impersonate');
    
    // Billing routes
    Route::get('/billing', function () {
        return Inertia::render('Central/Billing');
    })->name('billing');
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