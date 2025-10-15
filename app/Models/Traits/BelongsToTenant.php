<?php

namespace App\Models\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    /**
     * Boot the trait.
     */
    protected static function bootBelongsToTenant(): void
    {
        // Global scope SEGURO para filtrar automaticamente por tenant_id
        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantContextService = app(\App\Services\TenantContextService::class);
            $tenantId = $tenantContextService->getCurrentTenantId();

            if ($tenantId) {
                $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenantId);
            } else {
                // SEGURANÇA: Em contextos sem tenant, retornar vazio por padrão
                // Evita vazamento de dados entre tenants
                $builder->where($builder->getModel()->getTable() . '.tenant_id', '=', -1);
            }
        });

        // Adicionar tenant_id automaticamente ao criar registro
        static::creating(function ($model) {
            if (!$model->tenant_id) {
                $tenantContextService = app(\App\Services\TenantContextService::class);
                $tenantId = $tenantContextService->getCurrentTenantId();

                if ($tenantId) {
                    $model->tenant_id = $tenantId;
                } else {
                    // CRÍTICO: Impedir criação de registros órfãos
                    throw new \Exception('Não é possível criar registro sem tenant_id. Contexto de tenant não definido.');
                }
            }
        });
    }

    /**
     * Relacionamento com o tenant.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope para buscar registros de um tenant específico.
     */
    public function scopeForTenant(Builder $query, int $tenantId): Builder
    {
        return $query->where('tenant_id', $tenantId);
    }

    /**
     * Scope para buscar registros sem tenant (globais).
     */
    public function scopeWithoutTenant(Builder $query): Builder
    {
        return $query->withoutGlobalScope('tenant');
    }

    /**
     * Scope para buscar registros incluindo os sem tenant.
     */
    public function scopeWithGlobal(Builder $query): Builder
    {
        return $query->withoutGlobalScope('tenant');
    }
}