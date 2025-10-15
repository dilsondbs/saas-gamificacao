<?php

namespace App\Http\Middleware;

use App\Services\TenantManager;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class SetCurrentTenant
{
    protected $tenantManager;

    public function __construct(TenantManager $tenantManager)
    {
        $this->tenantManager = $tenantManager;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Não aplicar em rotas de logout para evitar problemas com CSRF
        if ($request->is('logout') || $request->is('central-logout')) {
            return $next($request);
        }

        // Configurar o tenant atual
        $this->setCurrentTenant($request);

        // Disponibilizar dados do tenant globalmente para as views
        $this->shareViewData();

        return $next($request);
    }

    /**
     * Configura o tenant atual
     */
    private function setCurrentTenant(Request $request)
    {
        // 1. Verificar se há troca de tenant via parâmetro
        if ($request->has('switch_tenant')) {
            $this->tenantManager->switch($request->get('switch_tenant'));
            return;
        }

        // 2. Se não há tenant na sessão, tenta carregar do usuário logado
        if (!$this->tenantManager->hasTenant()) {
            if (auth()->check() && auth()->user()->tenant_id) {
                $this->tenantManager->setTenant(auth()->user()->tenant_id);
            }
        }
    }

    /**
     * Compartilha dados do tenant com todas as views
     */
    private function shareViewData()
    {
        $currentTenant = $this->tenantManager->getTenant();
        $currentTenantId = $this->tenantManager->getTenantId();

        View::share([
            'currentTenant' => $currentTenant,
            'currentTenantId' => $currentTenantId,
            'isCentralDomain' => $this->tenantManager->isCentralDomain(),
            'tenantManager' => $this->tenantManager
        ]);
    }
}