<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\PlanPrice;
use App\Models\TenantContract;
use App\Models\TenantActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BillingController extends Controller
{
    public function index()
    {
        // === DADOS DOS TENANTS REAIS ===
        $realTenants = Tenant::all();
        $totalTenants = $realTenants->count();
        
        // === PREÇOS DE CATÁLOGO ===
        $catalogPrices = PlanPrice::pluck('price', 'plan_name')->toArray();
        $defaultPrices = ['teste' => 0.00, 'basic' => 19.90, 'premium' => 49.90, 'enterprise' => 199.00];
        $prices = array_merge($defaultPrices, $catalogPrices);
        
        // === RECEITA MENSAL BASEADA NOS TENANTS REAIS ===
        $monthlyRevenue = 0;
        foreach ($realTenants as $tenant) {
            $monthlyRevenue += $prices[$tenant->plan] ?? 0;
        }
        $yearlyRevenue = $monthlyRevenue * 12;
        
        // === ANÁLISE POR PLANOS ===
        $planAnalysis = collect([]);
        if ($totalTenants > 0) {
            $planAnalysis = $realTenants->groupBy('plan')->map(function ($tenants, $planName) use ($prices) {
                $planPrice = $prices[$planName] ?? 0;
                return [
                    'plan' => $planName,
                    'count' => $tenants->count(),
                    'revenue' => $tenants->count() * $planPrice,
                    'avg_price' => $planPrice,
                    'total_yearly' => $tenants->count() * $planPrice * 12
                ];
            })->sortByDesc('revenue')->values();
        } else {
            // Dados de fallback para Analytics quando não há tenants
            $planAnalysis = collect([
                [
                    'plan' => 'basic',
                    'count' => 0,
                    'revenue' => 0.00,
                    'avg_price' => $prices['basic'] ?? 19.90,
                    'total_yearly' => 0.00
                ],
                [
                    'plan' => 'premium',
                    'count' => 0,
                    'revenue' => 0.00,
                    'avg_price' => $prices['premium'] ?? 49.90,
                    'total_yearly' => 0.00
                ],
                [
                    'plan' => 'enterprise',
                    'count' => 0,
                    'revenue' => 0.00,
                    'avg_price' => $prices['enterprise'] ?? 199.00,
                    'total_yearly' => 0.00
                ]
            ]);
        }
        
        // === DISTRIBUIÇÃO DE PLANOS ===
        $planDistribution = $planAnalysis->map(function($plan) use ($totalTenants) {
            return [
                'name' => ucfirst($plan['plan']),
                'count' => $plan['count'],
                'percentage' => $totalTenants > 0 ? round(($plan['count'] / $totalTenants) * 100, 1) : 0,
                'revenue' => $plan['revenue']
            ];
        });
        
        // === ANÁLISE DE CRESCIMENTO CORRIGIDA ===
        $newTenants = $realTenants->filter(function($tenant) {
            return $tenant->created_at >= now()->subMonth();
        });
        $newMRR = 0;
        foreach ($newTenants as $tenant) {
            $newMRR += $prices[$tenant->plan] ?? 0;
        }

        // Calcular receita do mês anterior (MRR atual - novos contratos)
        $previousMonthMRR = $monthlyRevenue - $newMRR;

        // Fórmula correta de crescimento: ((Atual - Anterior) / Anterior) * 100
        $growthRate = 0;
        if ($previousMonthMRR > 0) {
            $growthRate = (($monthlyRevenue - $previousMonthMRR) / $previousMonthMRR) * 100;
        } elseif ($monthlyRevenue > 0) {
            // Se não havia receita anterior mas há atual = 100% crescimento (não infinito)
            $growthRate = 100;
        }
        
        // === DADOS MENSAIS DOS ÚLTIMOS 6 MESES ===
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);

            // Tenants que existiam neste mês
            $tenantsAtDate = Tenant::whereDate('created_at', '<=', $date->endOfMonth())->get();
            $revenueAtDate = 0;

            foreach ($tenantsAtDate as $tenant) {
                $revenueAtDate += $prices[$tenant->plan] ?? 0;
            }

            // Novos tenants no mês
            $newTenantsThisMonth = Tenant::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();

            $monthlyData[] = [
                'month' => $date->format('M Y'),
                'revenue' => $revenueAtDate,
                'contracts' => $tenantsAtDate->count(),
                'new_contracts' => $newTenantsThisMonth,
                'deleted_count' => 0, // Implementar quando houver exclusões
                'lost_revenue' => 0,
                'gained_revenue' => $newTenantsThisMonth * ($prices['basic'] ?? 19.90)
            ];
        }

        // === RECALCULAR CRESCIMENTO COM BASE NOS DADOS HISTÓRICOS ===
        if (count($monthlyData) >= 2) {
            $currentMonth = end($monthlyData);
            $previousMonth = $monthlyData[count($monthlyData) - 2];

            if ($previousMonth['revenue'] > 0) {
                $growthRate = (($currentMonth['revenue'] - $previousMonth['revenue']) / $previousMonth['revenue']) * 100;
            } elseif ($currentMonth['revenue'] > 0) {
                $growthRate = 100; // Crescimento máximo quando não havia receita anterior
            } else {
                $growthRate = 0;
            }
        }
        
        // === TOP CLIENTES ===
        $topClients = $realTenants->sortBy(function($tenant) use ($prices) {
            return -($prices[$tenant->plan] ?? 0);
        })->take(5)->map(function($tenant) use ($prices) {
            return [
                'name' => $tenant->name,
                'plan' => ucfirst($tenant->plan),
                'price' => $prices[$tenant->plan] ?? 0,
                'contract_end' => null,
                'status' => 'active',
                'is_expiring' => false,
                'created_at' => $tenant->created_at,
                'domains' => $tenant->slug . '.app' // Sistema de subdomínio único
            ];
        })->values();
        
        // === MÉTRICAS PRINCIPAIS ===
        $kpis = [
            'mrr' => $monthlyRevenue,
            'arr' => $yearlyRevenue,
            'total_contracts' => $totalTenants,
            'total_tenants' => $totalTenants,
            'growth_rate' => round(min(max($growthRate, -100), 500), 1), // Limitar entre -100% e +500%
            'churn_rate' => 0, // Implementar sistema de churn
            'avg_revenue_per_user' => $totalTenants > 0 ? round($monthlyRevenue / $totalTenants, 2) : 0,
            'renewal_opportunities' => 0,
            'expiring_contracts_count' => 0,
            'deleted_this_month' => 0,
            'created_this_month' => $newTenants->count(),
            'lost_revenue_this_month' => 0,
            'gained_revenue_this_month' => $newMRR,
            'net_revenue_impact' => $newMRR
        ];
        
        // === ALERTAS ===
        $alerts = [];
        if ($totalTenants == 0) {
            $alerts[] = [
                'type' => 'info',
                'message' => 'Sistema limpo - Nenhum tenant cadastrado. Cadastre o primeiro cliente para ver métricas reais.',
                'action' => 'Cadastrar tenant'
            ];
        } elseif ($growthRate > 20) {
            $alerts[] = [
                'type' => 'success',
                'message' => "Crescimento acelerado: +" . round($growthRate, 1) . "%",
                'action' => 'Ver detalhes'
            ];
        } elseif ($growthRate > 5) {
            $alerts[] = [
                'type' => 'success',
                'message' => "Crescimento saudável: +" . round($growthRate, 1) . "%",
                'action' => 'Ver detalhes'
            ];
        } elseif ($growthRate < -5) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "Queda na receita: " . round($growthRate, 1) . "%",
                'action' => 'Analisar causas'
            ];
        }
        
        // === INSIGHTS INTELIGENTES ===
        $intelligentInsights = $this->generateIntelligentInsights($realTenants, $kpis, $growthRate);
        
        // === DADOS PARA GRÁFICOS ===
        $chartData = $this->generateChartData($realTenants, $monthlyData);
        
        // === PREVISÕES ===
        $predictions = $this->generatePredictions($monthlyData, $totalTenants);
        
        // === ATIVIDADES RECENTES (SIMULADAS POR ENQUANTO) ===
        $recentActivities = $realTenants->sortByDesc('created_at')->take(10)->map(function($tenant) use ($prices) {
            return [
                'id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'activity_type' => 'Tenant Criado',
                'activity_color' => 'green',
                'plan_name' => ucfirst($tenant->plan),
                'monthly_value' => $prices[$tenant->plan] ?? 0,
                'financial_impact' => $prices[$tenant->plan] ?? 0,
                'formatted_impact' => $this->formatCurrency($prices[$tenant->plan] ?? 0),
                'impact_type' => 'positive',
                'description' => "Tenant {$tenant->name} foi criado no plano {$tenant->plan}",
                'occurred_at' => $tenant->created_at,
                'performed_by' => 'Sistema',
                'metadata' => []
            ];
        })->values();

        return Inertia::render('Central/Billing', [
            'kpis' => $kpis,
            'planAnalysis' => $planAnalysis,
            'planDistribution' => $planDistribution,
            'monthlyData' => $monthlyData,
            'topClients' => $topClients,
            'intelligentInsights' => $intelligentInsights,
            'chartData' => $chartData,
            'predictions' => $predictions,
            'recentActivities' => $recentActivities,
            'expiringContracts' => [], // Vazio por enquanto
            'catalogPrices' => $prices,
            'alerts' => $alerts,
            'realTenants' => $realTenants->map(function($tenant) use ($prices) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'plan' => $tenant->plan,
                    'monthly_value' => $prices[$tenant->plan] ?? 0,
                    'status' => 'active',
                    'created_at' => $tenant->created_at,
                    'domains' => [$tenant->slug . '.app'] // Sistema de subdomínio único
                ];
            })
        ]);
    }
    
    public function updatePlanPrice(Request $request)
    {
        $request->validate([
            'plan' => 'required|string|in:teste,basic,premium,enterprise',
            'price' => 'required|numeric|min:0'
        ]);
        
        PlanPrice::updateOrCreate(
            ['plan_name' => $request->plan],
            ['price' => $request->price]
        );
        
        return redirect()->back()->with('success', 'Preço de catálogo atualizado! Afetará novos tenants e renovações.');
    }

    // === MÉTODOS AUXILIARES ===
    
    private function generateIntelligentInsights($realTenants, $kpis, $growthRate)
    {
        $insights = [];
        
        if ($realTenants->count() == 0) {
            $insights[] = [
                'type' => 'getting_started',
                'severity' => 'info',
                'title' => '🚀 Pronto para Começar',
                'description' => 'Sistema SaaS configurado e funcionando. Cadastre seus primeiros clientes!',
                'recommendations' => [
                    'Acesse /central/tenants para cadastrar um tenant de teste',
                    'Configure preços de catálogo adequados ao seu mercado',
                    'Teste o fluxo de registro público em /signup',
                    'Explore o painel de cada tenant criado'
                ],
                'impact' => 'Base para crescimento sustentável do negócio'
            ];
            return $insights;
        }
        
        // Análise de crescimento
        if ($growthRate > 50) {
            $insights[] = [
                'type' => 'growth',
                'severity' => 'high',
                'title' => '🚀 Crescimento Explosivo',
                'description' => "Crescimento de {$growthRate}% indica expansão acelerada.",
                'recommendations' => [
                    'Considere aumentar preços em 15-20%',
                    'Prepare infraestrutura para 3x mais clientes',
                    'Automatize onboarding de novos clientes'
                ],
                'impact' => 'Potencial aumento de 200-300% na receita'
            ];
        } elseif ($growthRate > 20) {
            $insights[] = [
                'type' => 'growth',
                'severity' => 'medium',
                'title' => '📈 Crescimento Sustentável',
                'description' => "Taxa de crescimento saudável de {$growthRate}% mensalmente.",
                'recommendations' => [
                    'Mantenha estratégia atual - está funcionando bem',
                    'Considere campanhas para acelerar aquisição',
                    'Monitore satisfação dos clientes'
                ],
                'impact' => 'Projeção de dobrar receita em 12 meses'
            ];
        }
        
        // Análise de mix de planos
        $basicCount = $realTenants->where('plan', 'basic')->count();
        $totalTenants = $realTenants->count();
        
        if ($totalTenants > 0 && ($basicCount / $totalTenants) > 0.7) {
            $insights[] = [
                'type' => 'optimization',
                'severity' => 'medium',
                'title' => '💎 Oportunidade de Upselling',
                'description' => "Muitos clientes no plano básico (" . round(($basicCount/$totalTenants)*100, 1) . "%).",
                'recommendations' => [
                    'Crie campanhas de upgrade para premium',
                    'Ofereça trials de funcionalidades avançadas',
                    'Implemente limites no plano básico'
                ],
                'impact' => 'Potencial aumento de 40-60% no ARPU'
            ];
        }
        
        return $insights;
    }
    
    private function generateChartData($realTenants, $monthlyData)
    {
        $planCounts = $realTenants->groupBy('plan')->map->count();

        // Garantir que sempre temos dados de meses, mesmo que seja zerado
        $months = count($monthlyData) > 0 ? $monthlyData : [
            ['month' => 'Jan', 'revenue' => 0],
            ['month' => 'Fev', 'revenue' => 0],
            ['month' => 'Mar', 'revenue' => 0],
            ['month' => 'Abr', 'revenue' => 0],
            ['month' => 'Mai', 'revenue' => 0],
            ['month' => 'Jun', 'revenue' => 0]
        ];

        return [
            'revenue_trend' => [
                'labels' => array_column($months, 'month'),
                'datasets' => [
                    [
                        'label' => 'Receita Mensal (MRR)',
                        'data' => array_column($months, 'revenue'),
                        'borderColor' => '#3B82F6',
                        'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                        'fill' => true,
                        'tension' => 0.4
                    ]
                ]
            ],
            'plan_distribution' => [
                'labels' => ['Básico', 'Premium', 'Enterprise', 'Teste'],
                'datasets' => [
                    [
                        'data' => [
                            $planCounts['basic'] ?? 0,
                            $planCounts['premium'] ?? 0,
                            $planCounts['enterprise'] ?? 0,
                            $planCounts['teste'] ?? 0,
                        ],
                        'backgroundColor' => ['#10B981', '#3B82F6', '#8B5CF6', '#6B7280'],
                        'borderWidth' => 2,
                        'borderColor' => '#ffffff'
                    ]
                ]
            ],
            'churn_analysis' => [
                'labels' => array_column($months, 'month'),
                'datasets' => [
                    [
                        'label' => 'Taxa de Retenção (%)',
                        'data' => [95, 97, 94, 96, 98, 95], // Dados simulados
                        'backgroundColor' => 'rgba(16, 185, 129, 0.8)',
                        'borderColor' => '#10B981',
                        'borderWidth' => 2
                    ]
                ]
            ]
        ];
    }
    
    private function generatePredictions($monthlyData, $totalTenants)
    {
        $lastSixMonths = array_slice($monthlyData, -6);
        $revenues = array_column($lastSixMonths, 'revenue');
        
        $trend = $this->calculateTrend($revenues);
        $lastRevenue = end($revenues) ?: 0;
        
        $predictions = [];
        for ($i = 1; $i <= 12; $i++) {
            $predictedRevenue = max(0, $lastRevenue + ($trend * $i));
            $predictions[] = [
                'month' => now()->addMonths($i)->format('M Y'),
                'predicted_mrr' => $predictedRevenue,
                'confidence' => max(60, 95 - ($i * 3)),
                'scenario' => $i <= 6 ? 'high_confidence' : 'medium_confidence'
            ];
        }

        return [
            'revenue_forecast' => $predictions,
            'key_metrics' => [
                'projected_arr_12m' => array_sum(array_column($predictions, 'predicted_mrr')),
                'growth_trajectory' => $trend > 0 ? 'ascending' : 'stable',
                'recommended_actions' => $this->generateRecommendedActions($trend, $totalTenants)
            ]
        ];
    }
    
    private function calculateTrend($data)
    {
        $n = count($data);
        if ($n < 2) return 0;
        
        $sumX = array_sum(range(1, $n));
        $sumY = array_sum($data);
        $sumXY = 0;
        $sumXX = 0;
        
        for ($i = 0; $i < $n; $i++) {
            $sumXY += ($i + 1) * $data[$i];
            $sumXX += ($i + 1) * ($i + 1);
        }
        
        $denominator = ($n * $sumXX - $sumX * $sumX);
        return $denominator == 0 ? 0 : ($n * $sumXY - $sumX * $sumY) / $denominator;
    }
    
    private function generateRecommendedActions($trend, $tenantCount)
    {
        if ($tenantCount == 0) {
            return [
                'Cadastre o primeiro tenant em /central/tenants',
                'Configure preços de catálogo',
                'Teste o fluxo de registro público',
                'Explore funcionalidades do sistema'
            ];
        }
        
        if ($trend > 100) {
            return [
                'Expandir equipe de suporte',
                'Automatizar processos',
                'Investir em marketing digital',
                'Considerar levantamento de capital'
            ];
        }
        
        return [
            'Otimizar conversão de leads',
            'Implementar programa de indicações',
            'Analisar feedback dos clientes',
            'Desenvolver novas funcionalidades'
        ];
    }
    
    private function formatCurrency($value)
    {
        return 'R$ ' . number_format($value, 2, ',', '.');
    }
}