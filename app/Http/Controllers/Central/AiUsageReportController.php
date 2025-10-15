<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\AiUsageLog;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AiUsageReportController extends Controller
{
    public function index(Request $request)
    {
        // Filtros
        $tenantId = $request->input('tenant_id');
        $action = $request->input('action');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Query base
        $query = AiUsageLog::with(['tenant', 'user']);

        // Aplicar filtros
        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        if ($action) {
            $query->where('action', $action);
        }

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        // Buscar logs com paginação
        $logs = $query->latest()->paginate(50);

        // Estatísticas gerais
        $stats = [
            'total_calls' => AiUsageLog::count(),
            'total_cost' => AiUsageLog::sum('cost_usd'),
            'total_input_tokens' => AiUsageLog::sum('input_tokens'),
            'total_output_tokens' => AiUsageLog::sum('output_tokens'),
            'total_tokens' => AiUsageLog::sum(DB::raw('input_tokens + output_tokens')),
        ];

        // Estatísticas por ação
        $statsByAction = AiUsageLog::select(
            'action',
            DB::raw('COUNT(*) as calls'),
            DB::raw('SUM(cost_usd) as total_cost'),
            DB::raw('SUM(input_tokens) as input_tokens'),
            DB::raw('SUM(output_tokens) as output_tokens')
        )
        ->groupBy('action')
        ->get();

        // Estatísticas por tenant (top 10)
        $statsByTenant = AiUsageLog::select(
            'tenant_id',
            DB::raw('COUNT(*) as calls'),
            DB::raw('SUM(cost_usd) as total_cost'),
            DB::raw('SUM(input_tokens + output_tokens) as total_tokens')
        )
        ->with('tenant:id,name')
        ->groupBy('tenant_id')
        ->orderByDesc('total_cost')
        ->limit(10)
        ->get();

        // Últimos 30 dias - uso por dia
        $dailyUsage = AiUsageLog::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as calls'),
            DB::raw('SUM(cost_usd) as cost'),
            DB::raw('SUM(input_tokens + output_tokens) as tokens')
        )
        ->where('created_at', '>=', now()->subDays(30))
        ->groupBy(DB::raw('DATE(created_at)'))
        ->orderBy('date')
        ->get();

        // Lista de tenants para filtro
        $tenants = Tenant::select('id', 'name')->orderBy('name')->get();

        // Lista de ações disponíveis
        $actions = AiUsageLog::select('action')
            ->distinct()
            ->pluck('action')
            ->sort()
            ->values();

        return Inertia::render('Central/AiUsage/Index', [
            'logs' => $logs,
            'stats' => $stats,
            'statsByAction' => $statsByAction,
            'statsByTenant' => $statsByTenant,
            'dailyUsage' => $dailyUsage,
            'tenants' => $tenants,
            'actions' => $actions,
            'filters' => [
                'tenant_id' => $tenantId,
                'action' => $action,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
}
