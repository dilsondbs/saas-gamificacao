<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use App\Services\TenantManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        try {
            \Log::info('LOGIN: Iniciando processo de login');

            $request->authenticate();
            \Log::info('LOGIN: Autenticação bem-sucedida');

            $request->session()->regenerate();
            \Log::info('LOGIN: Sessão regenerada');

            // Definir tenant na sessão baseado no usuário logado
            $user = Auth::user();
            \Log::info('LOGIN: Usuário obtido: ' . $user->email . ' (tenant_id: ' . $user->tenant_id . ')');

            // Registrar login
            $user->recordLogin();
            \Log::info('LOGIN: Login registrado');

            // Configurar tenant se existir
            if ($user->tenant_id) {
                try {
                    $tenantManager = app(TenantManager::class);
                    $tenantManager->setTenant($user->tenant_id);
                    \Log::info('LOGIN: Tenant configurado: ' . $user->tenant_id);
                } catch (\Exception $e) {
                    \Log::error('Erro ao configurar tenant no login: ' . $e->getMessage());
                    // Continua mesmo se houver erro no tenant
                }
            }

            // Redirecionar baseado no role do usuário
            \Log::info('LOGIN: Redirecionando usuário role: ' . $user->role);
            return $this->redirectUserByRole($user);
        } catch (\Exception $e) {
            \Log::error('ERRO FATAL NO LOGIN: ' . $e->getMessage());
            \Log::error('STACK TRACE: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Redireciona usuário baseado no seu role
     */
    private function redirectUserByRole($user): RedirectResponse
    {
        // Se usuário não tem tenant_id, é administrador central
        if (!$user->tenant_id) {
            return redirect('/central/dashboard');
        }

        // Usuários com tenant_id vão para seus respectivos dashboards
        switch ($user->role) {
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

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
