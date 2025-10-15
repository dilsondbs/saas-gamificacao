<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class TenantContextService
{
    /**
     * Obtém o tenant_id atual do contexto
     */
    public function getCurrentTenantId(): ?string
    {
        // Prioridade 1: Usuário autenticado
        if (Auth::check() && Auth::user()->tenant_id) {
            return Auth::user()->tenant_id;
        }

        // Prioridade 2: Sessão
        if (Session::has('current_tenant_id')) {
            return Session::get('current_tenant_id');
        }

        // Prioridade 3: TenantManager
        $tenantManager = app(TenantManager::class);
        if ($tenantManager->hasTenant()) {
            return $tenantManager->getTenantId();
        }

        return null;
    }

    /**
     * Define o tenant atual no contexto
     */
    public function setCurrentTenant(int $tenantId): void
    {
        Session::put('current_tenant_id', $tenantId);

        $tenantManager = app(TenantManager::class);
        $tenantManager->setTenant($tenantId);
    }

    /**
     * Verifica se está em contexto central (sem tenant)
     */
    public function isCentralContext(): bool
    {
        $host = request()->getHost();
        $centralDomains = ['127.0.0.1', 'localhost', 'saas-gamificacao.local'];

        return in_array($host, $centralDomains) && !$this->getCurrentTenantId();
    }

    /**
     * Limpa o contexto do tenant
     */
    public function clearTenantContext(): void
    {
        Session::forget('current_tenant_id');

        $tenantManager = app(TenantManager::class);
        $tenantManager->clear();
    }
}