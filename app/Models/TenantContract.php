<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantContract extends Model
{
    use HasFactory;

    protected $connection = 'central';
    protected $fillable = [
        'tenant_id', 'plan_name', 'contracted_price', 'contract_start', 
        'contract_end', 'status', 'billing_cycle', 'discount_percentage', 'notes'
    ];
    
    protected $casts = [
        'contracted_price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'contract_start' => 'date',
        'contract_end' => 'date'
    ];
    
    // Relacionamento com tenant
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }
    
    // Scopes para consultas comuns
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
    
    public function scopeExpiring($query, $days = 30)
    {
        return $query->where('contract_end', '<=', now()->addDays($days));
    }
    
    // Calcular preço com desconto
    public function getFinalPriceAttribute()
    {
        return $this->contracted_price * (1 - $this->discount_percentage / 100);
    }
    
    // Verificar se está próximo do vencimento
    public function isExpiringSoon($days = 30)
    {
        return $this->contract_end <= now()->addDays($days);
    }
}
