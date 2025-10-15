<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class TenantActivity extends Model
{
    use HasFactory;

    protected $connection = 'central';
    
    protected $fillable = [
        'tenant_id',
        'tenant_name',
        'activity_type',
        'plan_name',
        'monthly_value',
        'financial_impact',
        'description',
        'metadata',
        'occurred_at',
        'performed_by'
    ];

    protected $casts = [
        'metadata' => 'array',
        'occurred_at' => 'datetime',
        'monthly_value' => 'decimal:2',
        'financial_impact' => 'decimal:2'
    ];

    // Activity types constants
    const TYPE_CREATED = 'created';
    const TYPE_DELETED = 'deleted';
    const TYPE_SUSPENDED = 'suspended';
    const TYPE_REACTIVATED = 'reactivated';
    const TYPE_UPGRADED = 'upgraded';
    const TYPE_DOWNGRADED = 'downgraded';
    
    // Cancellation system types
    const TYPE_SCHEDULED_DELETION = 'scheduled_deletion';
    const TYPE_RESTORED = 'restored';
    const TYPE_DATA_CLEANUP = 'data_cleanup';
    const TYPE_FINAL_DELETION = 'final_deletion';
    const TYPE_BILLING_CANCELLED = 'billing_cancelled';

    public static function logTenantDeletion($tenant, $contract = null, $performedBy = null)
    {
        $monthlyValue = $contract ? $contract->final_price : 0;
        
        return static::create([
            'tenant_id' => $tenant->id,
            'tenant_name' => $tenant->name,
            'activity_type' => static::TYPE_DELETED,
            'plan_name' => $contract ? $contract->plan_name : ($tenant->plan ?? 'unknown'),
            'monthly_value' => $monthlyValue,
            'financial_impact' => -$monthlyValue, // Impacto negativo
            'description' => "Tenant '{$tenant->name}' foi excluído permanentemente",
            'metadata' => [
                'tenant_data' => [
                    'slug' => $tenant->slug ?? null,
                    'description' => $tenant->description ?? null,
                    'created_at' => $tenant->created_at,
                    'deleted_at' => now(),
                    'days_active' => $tenant->created_at ? now()->diffInDays($tenant->created_at) : 0
                ],
                'contract_data' => $contract ? [
                    'contract_id' => $contract->id,
                    'contracted_price' => $contract->contracted_price,
                    'final_price' => $contract->final_price,
                    'contract_start' => $contract->contract_start,
                    'contract_end' => $contract->contract_end,
                    'status' => $contract->status
                ] : null,
                'lost_revenue_projection' => [
                    'monthly' => $monthlyValue,
                    'annual' => $monthlyValue * 12,
                    'remaining_contract' => $contract && $contract->contract_end ? 
                        $monthlyValue * max(0, now()->diffInMonths($contract->contract_end, false)) : 0
                ]
            ],
            'occurred_at' => now(),
            'performed_by' => $performedBy
        ]);
    }

    public static function logTenantCreation($tenant, $contract = null, $performedBy = null)
    {
        $monthlyValue = $contract ? $contract->final_price : 0;
        
        return static::create([
            'tenant_id' => $tenant->id,
            'tenant_name' => $tenant->name,
            'activity_type' => static::TYPE_CREATED,
            'plan_name' => $contract ? $contract->plan_name : ($tenant->plan ?? 'unknown'),
            'monthly_value' => $monthlyValue,
            'financial_impact' => $monthlyValue, // Impacto positivo
            'description' => "Novo tenant '{$tenant->name}' foi criado",
            'metadata' => [
                'tenant_data' => [
                    'slug' => $tenant->slug ?? null,
                    'description' => $tenant->description ?? null,
                    'plan' => $tenant->plan ?? null
                ],
                'revenue_projection' => [
                    'monthly' => $monthlyValue,
                    'annual' => $monthlyValue * 12
                ]
            ],
            'occurred_at' => now(),
            'performed_by' => $performedBy
        ]);
    }

    // Scopes
    public function scopeDeleted($query)
    {
        return $query->where('activity_type', static::TYPE_DELETED);
    }

    public function scopeCreated($query)
    {
        return $query->where('activity_type', static::TYPE_CREATED);
    }

    public function scopeInPeriod($query, $startDate, $endDate = null)
    {
        $query->where('occurred_at', '>=', $startDate);
        if ($endDate) {
            $query->where('occurred_at', '<=', $endDate);
        }
        return $query;
    }

    public function scopeWithFinancialImpact($query)
    {
        return $query->where('financial_impact', '!=', 0);
    }

    // Accessors
    public function getImpactTypeAttribute()
    {
        return $this->financial_impact > 0 ? 'positive' : 'negative';
    }

    public function getFormattedFinancialImpactAttribute()
    {
        $prefix = $this->financial_impact > 0 ? '+R$ ' : '-R$ ';
        return $prefix . number_format(abs($this->financial_impact), 2, ',', '.');
    }

    public function getActivityTypeDisplayAttribute()
    {
        $types = [
            static::TYPE_CREATED => 'Criado',
            static::TYPE_DELETED => 'Excluído',
            static::TYPE_SUSPENDED => 'Suspenso',
            static::TYPE_REACTIVATED => 'Reativado',
            static::TYPE_UPGRADED => 'Upgrade',
            static::TYPE_DOWNGRADED => 'Downgrade',
            static::TYPE_SCHEDULED_DELETION => 'Agendado para Exclusão',
            static::TYPE_RESTORED => 'Restaurado',
            static::TYPE_DATA_CLEANUP => 'Limpeza de Dados',
            static::TYPE_FINAL_DELETION => 'Exclusão Final',
            static::TYPE_BILLING_CANCELLED => 'Cobrança Cancelada'
        ];

        return $types[$this->activity_type] ?? $this->activity_type;
    }

    public function getActivityColorAttribute()
    {
        $colors = [
            static::TYPE_CREATED => 'green',
            static::TYPE_DELETED => 'red',
            static::TYPE_SUSPENDED => 'orange',
            static::TYPE_REACTIVATED => 'blue',
            static::TYPE_UPGRADED => 'purple',
            static::TYPE_DOWNGRADED => 'yellow',
            static::TYPE_SCHEDULED_DELETION => 'red',
            static::TYPE_RESTORED => 'green',
            static::TYPE_DATA_CLEANUP => 'gray',
            static::TYPE_FINAL_DELETION => 'red',
            static::TYPE_BILLING_CANCELLED => 'orange'
        ];

        return $colors[$this->activity_type] ?? 'gray';
    }

    // Static methods for analytics
    public static function getFinancialImpactSummary($period = 'month')
    {
        $startDate = $period === 'month' ? now()->startOfMonth() : now()->startOfYear();
        
        return static::inPeriod($startDate)
            ->selectRaw('
                activity_type,
                COUNT(*) as count,
                SUM(financial_impact) as total_impact,
                AVG(monthly_value) as avg_monthly_value
            ')
            ->groupBy('activity_type')
            ->get();
    }

    public static function getLostRevenue($period = 'month')
    {
        $startDate = $period === 'month' ? now()->startOfMonth() : now()->startOfYear();
        
        return static::deleted()
            ->inPeriod($startDate)
            ->sum('monthly_value');
    }

    // MÉTODOS ESPECÍFICOS PARA SISTEMA DE CANCELAMENTO

    public static function getCancellationReport($startDate = null, $endDate = null)
    {
        $startDate = $startDate ?: now()->startOfMonth();
        $endDate = $endDate ?: now()->endOfMonth();

        $activities = static::whereIn('activity_type', [
                static::TYPE_SCHEDULED_DELETION,
                static::TYPE_RESTORED,
                static::TYPE_FINAL_DELETION
            ])
            ->inPeriod($startDate, $endDate)
            ->orderBy('occurred_at', 'desc')
            ->get();

        return [
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d')
            ],
            'summary' => [
                'scheduled_deletions' => $activities->where('activity_type', static::TYPE_SCHEDULED_DELETION)->count(),
                'restorations' => $activities->where('activity_type', static::TYPE_RESTORED)->count(),
                'final_deletions' => $activities->where('activity_type', static::TYPE_FINAL_DELETION)->count(),
                'churn_rate' => static::calculateChurnRate($startDate, $endDate),
                'revenue_at_risk' => $activities->where('activity_type', static::TYPE_SCHEDULED_DELETION)->sum('monthly_value'),
                'revenue_lost' => $activities->where('activity_type', static::TYPE_FINAL_DELETION)->sum('monthly_value'),
                'revenue_recovered' => $activities->where('activity_type', static::TYPE_RESTORED)->sum('monthly_value')
            ],
            'activities' => $activities,
            'cancellation_reasons' => static::getCancellationReasons($startDate, $endDate)
        ];
    }

    public static function calculateChurnRate($startDate, $endDate)
    {
        $finalDeletions = static::where('activity_type', static::TYPE_FINAL_DELETION)
            ->inPeriod($startDate, $endDate)
            ->count();

        $totalActiveAtStart = \App\Models\Tenant::where('created_at', '<', $startDate)
            ->where('status', 'active')
            ->count();

        return $totalActiveAtStart > 0 ? ($finalDeletions / $totalActiveAtStart) * 100 : 0;
    }

    public static function getCancellationReasons($startDate = null, $endDate = null)
    {
        $startDate = $startDate ?: now()->startOfMonth();
        $endDate = $endDate ?: now()->endOfMonth();

        return static::where('activity_type', static::TYPE_SCHEDULED_DELETION)
            ->inPeriod($startDate, $endDate)
            ->get()
            ->map(function ($activity) {
                $metadata = $activity->metadata;
                return [
                    'tenant_name' => $activity->tenant_name,
                    'reason' => $metadata['reason'] ?? 'Não informado',
                    'monthly_value' => $activity->monthly_value,
                    'occurred_at' => $activity->occurred_at
                ];
            })
            ->groupBy('reason')
            ->map(function ($group, $reason) {
                return [
                    'reason' => $reason,
                    'count' => $group->count(),
                    'total_value' => $group->sum('monthly_value'),
                    'percentage' => 0 // Will be calculated by the controller
                ];
            });
    }

    public static function getSecurityAuditLog($tenantId = null, $startDate = null, $endDate = null)
    {
        $query = static::whereIn('activity_type', [
            static::TYPE_SCHEDULED_DELETION,
            static::TYPE_RESTORED,
            static::TYPE_DATA_CLEANUP,
            static::TYPE_FINAL_DELETION,
            static::TYPE_BILLING_CANCELLED
        ]);

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        if ($startDate) {
            $query->where('occurred_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('occurred_at', '<=', $endDate);
        }

        return $query->orderBy('occurred_at', 'desc')
            ->get()
            ->map(function ($activity) {
                return [
                    'timestamp' => $activity->occurred_at->format('Y-m-d H:i:s'),
                    'tenant_id' => $activity->tenant_id,
                    'tenant_name' => $activity->tenant_name,
                    'action' => $activity->activity_type_display,
                    'performed_by' => $activity->performed_by,
                    'description' => $activity->description,
                    'metadata' => $activity->metadata,
                    'financial_impact' => $activity->financial_impact,
                    'security_level' => static::getSecurityLevel($activity->activity_type)
                ];
            });
    }

    public static function getSecurityLevel($activityType)
    {
        $securityLevels = [
            static::TYPE_SCHEDULED_DELETION => 'HIGH',
            static::TYPE_RESTORED => 'MEDIUM',
            static::TYPE_DATA_CLEANUP => 'HIGH',
            static::TYPE_FINAL_DELETION => 'CRITICAL',
            static::TYPE_BILLING_CANCELLED => 'HIGH'
        ];

        return $securityLevels[$activityType] ?? 'LOW';
    }

    // Scopes para os novos tipos
    public function scopeScheduledDeletions($query)
    {
        return $query->where('activity_type', static::TYPE_SCHEDULED_DELETION);
    }

    public function scopeRestored($query)
    {
        return $query->where('activity_type', static::TYPE_RESTORED);
    }

    public function scopeFinalDeletions($query)
    {
        return $query->where('activity_type', static::TYPE_FINAL_DELETION);
    }

    public function scopeCriticalActions($query)
    {
        return $query->whereIn('activity_type', [
            static::TYPE_FINAL_DELETION,
            static::TYPE_DATA_CLEANUP,
            static::TYPE_SCHEDULED_DELETION
        ]);
    }
}
