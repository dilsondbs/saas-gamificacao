<?php
namespace App\Http\Middleware;
use Closure;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CentralUserProvider
{
    public function handle(Request $request, Closure $next)
    {
        if (str_contains($request->path(), 'central/central')) {
            // Verificar se há usuário autenticado
            $user = auth()->user();

            if ($user && !$user->tenant_id) {
                // Usuário central real autenticado
                $centralUser = (object) [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => 'super-admin',
                    'tenant_id' => null,
                    'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toISOString() : now()->toISOString()
                ];
            } else {
                // Usuário fake para desenvolvimento (quando não autenticado)
                $centralUser = (object) [
                    'id' => 999,
                    'name' => 'Gerente SaaS',
                    'email' => 'gerente@saas.com',
                    'role' => 'super-admin',
                    'tenant_id' => null,
                    'email_verified_at' => now()->toISOString()
                ];
            }

            Inertia::share('auth', ['user' => $centralUser]);
        }
        return $next($request);
    }
}