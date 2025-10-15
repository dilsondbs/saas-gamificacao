<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use App\Services\TenantContextService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        // Check if we're in central context
        $host = request()->getHost();
        $centralDomains = config('tenancy.central_domains');
        $isCentral = in_array($host, $centralDomains);
        
        return Inertia::render('Auth/Register', [
            'isCentral' => $isCentral,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // CRÍTICO: Obter tenant_id do contexto atual
        $tenantContextService = app(TenantContextService::class);
        $tenantId = $tenantContextService->getCurrentTenantId();

        // SEGURANÇA: Impedir criação de usuários órfãos
        if (!$tenantId) {
            throw new \Exception('Não é possível registrar usuário sem contexto de tenant definido.');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'student',
            'total_points' => 0,
            'tenant_id' => $tenantId, // CORREÇÃO CRÍTICA: Sempre incluir tenant_id
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(RouteServiceProvider::HOME);
    }
}
