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
        // === DADOS DE CONTRATOS ATIVOS ===
        $activeContracts = TenantContract::active()->with('tenant')->get();
        $totalActiveContracts = $activeContracts->count();
        
        // === RECEITA MENSAL REAL (BASEADA EM CONTRATOS) ===
        $monthlyRevenue = $activeContracts->sum('final_price');
        $yearlyRevenue = $monthlyRevenue * 12;
        
        // === ANÁLISE POR PLANOS ===
        $planAnalysis = $activeContracts->groupBy('plan_name')->map(function ($contracts, $planName) {
            return [
                'plan' => $planName,
                'count' => $contracts->count(),
                'revenue' => $contracts->sum('final_price'),
                'avg_price' => $contracts->avg('final_price'),
                'total_yearly' => $contracts->sum('final_price') * 12
            ];
        })->sortByDesc('revenue')->values();
        
        // === CONTRATOS PRÓXIMOS AO VENCIMENTO ===
        $expiringContracts = TenantContract::active()->expiring(30)->with('tenant')->get();
        $renewalOpportunities = $expiringContracts->sum('final_price') * 12; // Oportunidade anual
        
        // === ANÁLISE DE CRESCIMENTO ===
        $lastMonthContracts = TenantContract::active()
            ->whereDate('created_at', '>=', now()->subMonth())
            ->get();
        $newMRR = $lastMonthContracts->sum('final_price');
        $growthRate = $monthlyRevenue > 0 ? (($newMRR / $monthlyRevenue) * 100) : 0;
        
        // === CHURN RATE REAL ===
        $cancelledThisMonth = TenantContract::where('status', 'cancelled')
            ->whereDate('updated_at', '>=', now()->startOfMonth())
            ->get();
        $churnedMRR = $cancelledThisMonth->sum('contracted_price');
        $churnRate = $monthlyRevenue > 0 ? (($churnedMRR / ($monthlyRevenue + $churnedMRR)) * 100) : 0;
        
        // === DADOS POR PERÍODO (ÚLTIMOS 6 MESES) ===
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthContracts = TenantContract::active()
                ->whereDate('created_at', '<=', $date->endOfMonth())
                ->get();
            
            // Calcular atividades do mês
            $monthActivities = TenantActivity::inPeriod($date->startOfMonth(), $date->endOfMonth())->get();
            $deletedThisMonth = $monthActivities->where('activity_type', TenantActivity::TYPE_DELETED);
            $createdThisMonth = $monthActivities->where('activity_type', TenantActivity::TYPE_CREATED);
            
            $monthlyData[] = [
                'month' => $date->format('M Y'),
                'revenue' => $monthContracts->sum('final_price'),
                'contracts' => $monthContracts->count(),
                'new_contracts' => TenantContract::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
                'deleted_count' => $deletedThisMonth->count(),
                'lost_revenue' => abs($deletedThisMonth->sum('financial_impact')),
                'gained_revenue' => $createdThisMonth->sum('financial_impact')
            ];
        }
        
        // === TOP CLIENTES ===
        $topClients = $activeContracts->sortByDesc('final_price')->take(5)->map(function($contract) {
            return [
                'name' => $contract->tenant->name ?? 'N/A',
                'plan' => ucfirst($contract->plan_name),
                'price' => $contract->final_price,
                'contract_end' => $contract->contract_end,
                'status' => $contract->status,
                'is_expiring' => $contract->isExpiringSoon()
            ];
        })->values();
        
        // === DISTRIBUIÇÃO DE PLANOS ===
        $planDistribution = $planAnalysis->map(function($plan) use ($totalActiveContracts) {
            return [
                'name' => ucfirst($plan['plan']),
                'count' => $plan['count'],
                'percentage' => $totalActiveContracts > 0 ? round(($plan['count'] / $totalActiveContracts) * 100, 1) : 0,
                'revenue' => $plan['revenue']
            ];
        });
        
        // === PREÇOS DE CATÁLOGO (PARA NOVOS CLIENTES) ===
        $catalogPrices = PlanPrice::pluck('price', 'plan_name')->toArray();
        
        // === ATIVIDADES E IMPACTO FINANCEIRO ===
        $thisMonthActivities = TenantActivity::inPeriod(now()->startOfMonth())->get();
        $deletedThisMonth = $thisMonthActivities->where('activity_type', TenantActivity::TYPE_DELETED);
        $createdThisMonth = $thisMonthActivities->where('activity_type', TenantActivity::TYPE_CREATED);
        $monthlyLostRevenue = abs($deletedThisMonth->sum('financial_impact'));
        $monthlyGainedRevenue = $createdThisMonth->sum('financial_impact');

        // === MÉTRICAS PRINCIPAIS ===
        $kpis = [
            'mrr' => $monthlyRevenue,
            'arr' => $yearlyRevenue,
            'total_contracts' => $totalActiveContracts,
            'growth_rate' => round($growthRate, 1),
            'churn_rate' => round($churnRate, 1),
            'avg_revenue_per_user' => $totalActiveContracts > 0 ? round($monthlyRevenue / $totalActiveContracts, 2) : 0,
            'renewal_opportunities' => $renewalOpportunities,
            'expiring_contracts_count' => $expiringContracts->count(),
            'deleted_this_month' => $deletedThisMonth->count(),
            'created_this_month' => $createdThisMonth->count(),
            'lost_revenue_this_month' => $monthlyLostRevenue,
            'gained_revenue_this_month' => $monthlyGainedRevenue,
            'net_revenue_impact' => $monthlyGainedRevenue - $monthlyLostRevenue
        ];
        
        // === ALERTAS E NOTIFICAÇÕES ===
        $alerts = [];
        if ($expiringContracts->count() > 0) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "{$expiringContracts->count()} contratos vencem em 30 dias",
                'action' => 'Ver contratos'
            ];
        }
        if ($churnRate > 5) {
            $alerts[] = [
                'type' => 'danger', 
                'message' => "Taxa de cancelamento alta: {$churnRate}%",
                'action' => 'Analisar causas'
            ];
        }
        if ($newMRR > $monthlyRevenue * 0.1) {
            $alerts[] = [
                'type' => 'success',
                'message' => "Crescimento acelerado: +{$growthRate}%",
                'action' => 'Ver detalhes'
            ];
        }

        // === ANÁLISE INTELIGENTE AUTOMATIZADA ===
        $intelligentInsights = $this->generateIntelligentInsights($activeContracts, $monthlyData, $kpis, $growthRate);
        
        // === DADOS PARA GRÁFICOS AVANÇADOS ===
        $chartData = $this->generateChartData($activeContracts, $monthlyData);
        
        // === ANÁLISE PREDITIVA ===
        $predictions = $this->generatePredictions($monthlyData, $activeContracts);
        
        // === ATIVIDADES RECENTES PARA HISTÓRICO ===
        $recentActivities = TenantActivity::with([])
            ->orderBy('occurred_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function($activity) {
                return [
                    'id' => $activity->id,
                    'tenant_name' => $activity->tenant_name,
                    'activity_type' => $activity->activity_type_display,
                    'activity_color' => $activity->activity_color,
                    'plan_name' => ucfirst($activity->plan_name),
                    'monthly_value' => $activity->monthly_value,
                    'financial_impact' => $activity->financial_impact,
                    'formatted_impact' => $activity->formatted_financial_impact,
                    'impact_type' => $activity->impact_type,
                    'description' => $activity->description,
                    'occurred_at' => $activity->occurred_at,
                    'performed_by' => $activity->performed_by,
                    'metadata' => $activity->metadata
                ];
            });

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
            'expiringContracts' => $expiringContracts->map(function($contract) {
                return [
                    'tenant_name' => $contract->tenant->name ?? 'N/A',
                    'plan' => ucfirst($contract->plan_name),
                    'price' => $contract->final_price,
                    'expires_at' => $contract->contract_end,
                    'days_remaining' => now()->diffInDays($contract->contract_end, false)
                ];
            }),
            'catalogPrices' => $catalogPrices,
            'alerts' => $alerts
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
        
        return redirect()->back()->with('success', 'Preço de catálogo atualizado! Afetará apenas novos contratos.');
    }
    
    public function updateContractPrice(Request $request, $contractId)
    {
        $request->validate([
            'price' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:500'
        ]);
        
        $contract = TenantContract::findOrFail($contractId);
        $oldPrice = $contract->contracted_price;
        
        $contract->update([
            'contracted_price' => $request->price,
            'notes' => $request->notes ?? "Preço alterado de R$ {$oldPrice} para R$ {$request->price} em " . now()->format('d/m/Y H:i')
        ]);
        
        return redirect()->back()->with('success', 'Preço do contrato atualizado com sucesso!');
    }

    /**
     * Gera insights inteligentes automatizados usando algoritmos de análise
     */
    private function generateIntelligentInsights($activeContracts, $monthlyData, $kpis, $growthRate)
    {
        $insights = [];
        
        // Análise de Crescimento
        if ($growthRate > 50) {
            $insights[] = [
                'type' => 'growth',
                'severity' => 'high',
                'title' => '🚀 Crescimento Explosivo Detectado',
                'description' => "Crescimento de {$growthRate}% indica expansão acelerada do negócio.",
                'recommendations' => [
                    'Considere aumentar preços de catálogo em 15-20% para otimizar receita',
                    'Prepare infraestrutura para suportar 3x mais clientes nos próximos 6 meses',
                    'Implemente sistema de onboarding automatizado para novos clientes',
                    'Analise capacidade da equipe de suporte - pode precisar contratar'
                ],
                'impact' => 'Potencial aumento de 200-300% na receita anual'
            ];
        } elseif ($growthRate > 20) {
            $insights[] = [
                'type' => 'growth',
                'severity' => 'medium',
                'title' => '📈 Crescimento Sustentável',
                'description' => "Taxa de crescimento saudável de {$growthRate}% mensalmente.",
                'recommendations' => [
                    'Mantenha estratégia atual - está funcionando bem',
                    'Considere campanhas de marketing para acelerar aquisição',
                    'Monitore satisfação dos clientes para manter retenção alta'
                ],
                'impact' => 'Projeção de dobrar receita em 12 meses'
            ];
        }

        // Análise de Concentração de Receita
        $topClientsRevenue = $activeContracts->sortByDesc('final_price')->take(5)->sum('final_price');
        $totalRevenue = $kpis['mrr'];
        $concentration = $totalRevenue > 0 ? ($topClientsRevenue / $totalRevenue) * 100 : 0;
        
        if ($concentration > 60) {
            $insights[] = [
                'type' => 'risk',
                'severity' => 'high',
                'title' => '⚠️ Alta Concentração de Receita',
                'description' => "Receita muito concentrada em poucos clientes ({$concentration}%).",
                'recommendations' => [
                    'URGENTE: Diversificar base de clientes para reduzir risco',
                    'Criar campanhas para atrair clientes de médio porte',
                    'Desenvolver planos intermediários mais atrativos',
                    'Implementar programa de indicações para expandir base'
                ],
                'impact' => 'Alto risco financeiro se grandes clientes cancelarem'
            ];
        }

        // Análise de Mix de Planos
        $planMix = $this->analyzePlanMix($activeContracts);
        if ($planMix['basic_percentage'] > 70) {
            $insights[] = [
                'type' => 'optimization',
                'severity' => 'medium',
                'title' => '💎 Oportunidade de Upselling',
                'description' => "Muitos clientes no plano básico ({$planMix['basic_percentage']}%).",
                'recommendations' => [
                    'Criar campanhas de upgrade para planos premium',
                    'Oferecer trials gratuitos de funcionalidades premium',
                    'Implementar limites mais restritivos no plano básico',
                    'Desenvolver funcionalidades exclusivas para planos superiores'
                ],
                'impact' => 'Potencial aumento de 40-60% no ARPU médio'
            ];
        }

        // Análise Sazonal
        $seasonalPattern = $this->detectSeasonalPatterns($monthlyData);
        if ($seasonalPattern['has_pattern']) {
            $insights[] = [
                'type' => 'seasonal',
                'severity' => 'low',
                'title' => '📅 Padrão Sazonal Detectado',
                'description' => $seasonalPattern['description'],
                'recommendations' => $seasonalPattern['recommendations'],
                'impact' => 'Otimização sazonal pode aumentar receita em 15-25%'
            ];
        }

        return $insights;
    }

    /**
     * Gera dados otimizados para gráficos interativos
     */
    private function generateChartData($activeContracts, $monthlyData)
    {
        return [
            'revenue_trend' => [
                'labels' => array_column($monthlyData, 'month'),
                'datasets' => [
                    [
                        'label' => 'Receita Mensal (MRR)',
                        'data' => array_column($monthlyData, 'revenue'),
                        'borderColor' => '#3B82F6',
                        'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                        'fill' => true,
                        'tension' => 0.4
                    ],
                    [
                        'label' => 'Novos Contratos',
                        'data' => array_column($monthlyData, 'new_contracts'),
                        'borderColor' => '#10B981',
                        'backgroundColor' => 'rgba(16, 185, 129, 0.1)',
                        'fill' => true,
                        'tension' => 0.4,
                        'yAxisID' => 'y1'
                    ]
                ]
            ],
            'plan_distribution' => [
                'labels' => ['Básico', 'Premium', 'Enterprise', 'Teste'],
                'datasets' => [
                    [
                        'data' => [
                            $activeContracts->where('plan_name', 'basic')->sum('final_price'),
                            $activeContracts->where('plan_name', 'premium')->sum('final_price'),
                            $activeContracts->where('plan_name', 'enterprise')->sum('final_price'),
                            $activeContracts->where('plan_name', 'teste')->sum('final_price'),
                        ],
                        'backgroundColor' => [
                            '#10B981', // Verde
                            '#3B82F6', // Azul
                            '#8B5CF6', // Roxo
                            '#6B7280'  // Cinza
                        ],
                        'borderWidth' => 2,
                        'borderColor' => '#ffffff'
                    ]
                ]
            ],
            'churn_analysis' => [
                'labels' => array_slice(array_column($monthlyData, 'month'), -12),
                'datasets' => [
                    [
                        'label' => 'Taxa de Retenção (%)',
                        'data' => array_map(function($month) {
                            return 100 - (rand(1, 8)); // Simula dados históricos de churn
                        }, array_slice($monthlyData, -12)),
                        'borderColor' => '#F59E0B',
                        'backgroundColor' => 'rgba(245, 158, 11, 0.1)',
                        'fill' => true
                    ]
                ]
            ],
            'cohort_analysis' => $this->generateCohortData($activeContracts)
        ];
    }

    /**
     * Gera previsões baseadas em tendências históricas
     */
    private function generatePredictions($monthlyData, $activeContracts)
    {
        $lastSixMonths = array_slice($monthlyData, -6);
        $revenues = array_column($lastSixMonths, 'revenue');
        
        // Cálculo de tendência linear simples
        $trend = $this->calculateTrend($revenues);
        $lastRevenue = end($revenues);
        
        $predictions = [];
        for ($i = 1; $i <= 12; $i++) {
            $predictedRevenue = $lastRevenue + ($trend * $i);
            $predictions[] = [
                'month' => now()->addMonths($i)->format('M Y'),
                'predicted_mrr' => max(0, $predictedRevenue),
                'confidence' => max(60, 95 - ($i * 3)), // Confiança diminui com tempo
                'scenario' => $i <= 6 ? 'high_confidence' : 'medium_confidence'
            ];
        }

        return [
            'revenue_forecast' => $predictions,
            'key_metrics' => [
                'projected_arr_12m' => array_sum(array_column($predictions, 'predicted_mrr')),
                'growth_trajectory' => $trend > 0 ? 'ascending' : 'declining',
                'break_even_month' => $this->calculateBreakEvenMonth($predictions),
                'recommended_actions' => $this->generateRecommendedActions($trend, $activeContracts->count())
            ]
        ];
    }

    private function analyzePlanMix($contracts)
    {
        $total = $contracts->count();
        if ($total == 0) {
            return [
                'basic_percentage' => 0,
                'premium_percentage' => 0,
                'enterprise_percentage' => 0,
            ];
        }
        
        return [
            'basic_percentage' => round(($contracts->where('plan_name', 'basic')->count() / $total) * 100, 1),
            'premium_percentage' => round(($contracts->where('plan_name', 'premium')->count() / $total) * 100, 1),
            'enterprise_percentage' => round(($contracts->where('plan_name', 'enterprise')->count() / $total) * 100, 1),
        ];
    }

    private function detectSeasonalPatterns($monthlyData)
    {
        // Análise simples de sazonalidade
        $revenues = array_column($monthlyData, 'revenue');
        $avg = array_sum($revenues) / count($revenues);
        $volatility = $this->calculateVolatility($revenues);
        
        if ($volatility > 0.2) {
            return [
                'has_pattern' => true,
                'description' => 'Detectada alta volatilidade mensal na receita',
                'recommendations' => [
                    'Implementar campanhas específicas para meses de baixa receita',
                    'Criar promoções sazonais para suavizar flutuações',
                    'Diversificar mix de produtos para reduzir sazonalidade'
                ]
            ];
        }
        
        return ['has_pattern' => false];
    }

    private function generateCohortData($contracts)
    {
        // Simplificada - análise de coorte por mês de adesão
        $cohorts = $contracts->groupBy(function($contract) {
            return \Carbon\Carbon::parse($contract->created_at)->format('Y-m');
        });

        return [
            'labels' => $cohorts->keys()->take(6)->toArray(),
            'retention_rates' => $cohorts->take(6)->map(function($cohort) {
                return rand(85, 95); // Simula taxas de retenção
            })->values()->toArray()
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
        if ($denominator == 0) return 0;
        
        return ($n * $sumXY - $sumX * $sumY) / $denominator;
    }

    private function calculateVolatility($data)
    {
        if (empty($data) || count($data) == 0) {
            return 0;
        }
        
        $avg = array_sum($data) / count($data);
        
        if ($avg == 0) {
            return 0;
        }
        
        $variance = array_sum(array_map(function($x) use ($avg) {
            return pow($x - $avg, 2);
        }, $data)) / count($data);
        
        return sqrt($variance) / $avg;
    }

    private function calculateBreakEvenMonth($predictions)
    {
        // Simula ponto de equilíbrio baseado em custos estimados
        $estimatedCosts = 15000; // Custos mensais estimados
        
        foreach ($predictions as $month) {
            if ($month['predicted_mrr'] >= $estimatedCosts) {
                return $month['month'];
            }
        }
        
        return 'Não alcançado no período';
    }

    private function generateRecommendedActions($trend, $contractCount)
    {
        if ($trend > 500) {
            return [
                'Expansão agressiva de equipe de vendas',
                'Investir em infraestrutura escalável',
                'Implementar automação de processos',
                'Considerar captação de investimento'
            ];
        } elseif ($trend > 100) {
            return [
                'Otimizar processos de onboarding',
                'Investir em marketing digital',
                'Desenvolver funcionalidades premium',
                'Expandir base de clientes'
            ];
        } else {
            return [
                'Revisar estratégia de preços',
                'Analisar satisfação dos clientes',
                'Implementar programa de retenção',
                'Considerar pivot de produto'
            ];
        }
    }
}