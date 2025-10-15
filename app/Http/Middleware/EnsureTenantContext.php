<?php

namespace App\Http\Middleware;

use App\Services\TenantContextService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureTenantContext
{
    public function handle(Request $request, Closure $next)
    {
        $tenantContextService = app(TenantContextService::class);

        // Se já temos tenant_id no contexto, prosseguir
        if ($tenantContextService->getCurrentTenantId()) {
            return $next($request);
        }

        // Tentar detectar tenant do usuário autenticado
        if (Auth::check() && Auth::user()->tenant_id) {
            $tenantContextService->setCurrentTenant(Auth::user()->tenant_id);
            return $next($request);
        }

        // Se estamos em contexto central, permitir
        if ($tenantContextService->isCentralContext()) {
            return $next($request);
        }

        // Se chegou aqui sem tenant_id e não é central, há problema
        // Para segurança, redirecionar para login
        return redirect()->route('login')
            ->with('error', 'Contexto de tenant não identificado. Faça login novamente.');
    }
}