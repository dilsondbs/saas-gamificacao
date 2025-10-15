<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Calcular estatísticas reais dos tenants
        $totalTenants = Tenant::count();
        // Usar campo is_active que existe na tabela
        $activeTenants = Tenant::where('is_active', true)->count();
        
        // Simular receita mensal baseada nos tenants ativos
        // Assumindo plano básico de R$ 99/mês por tenant
        $monthlyRevenue = $activeTenants * 99.00;
        
        $stats = [
            'total_tenants' => $totalTenants,
            'active_tenants' => $activeTenants,
            'monthly_revenue' => $monthlyRevenue,
        ];
        
        return Inertia::render('Central/Dashboard', [
            'stats' => $stats
        ]);
    }
}
