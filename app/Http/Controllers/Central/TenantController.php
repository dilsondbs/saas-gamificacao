<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Tenant;
use App\Models\PlanPrice;
use App\Models\TenantContract;
use App\Models\Domain;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    public function index()
    {
        \Log::info('TenantController index called');
        \Log::warning('ACESSO SEM AUTENTICAÇÃO - Apenas para testes de desenvolvimento');
        $tenants = Tenant::latest()->paginate(10);

        return Inertia::render('Central/Tenants/Index', [
            'tenants' => $tenants
        ]);
    }

    public function create()
    {
        // Buscar preços de catálogo atualizados
        $catalogPrices = PlanPrice::pluck('price', 'plan_name')->toArray();
        
        // Definir planos com preços dinâmicos
        $plans = [
            [
                'id' => 'teste',
                'name' => 'TESTE',
                'price' => $catalogPrices['teste'] ?? 0.00,
                'description' => '1 usuário, 1 curso, 50 MB storage, Sem IA',
                'max_users' => 1,
                'max_courses' => 1,
                'max_storage_mb' => 50,
                'features' => ['1 usuário', '1 curso', '50 MB storage', 'Sem IA de criação']
            ],
            [
                'id' => 'basic',
                'name' => 'Básico', 
                'price' => $catalogPrices['basic'] ?? 19.90,
                'description' => 'Até 50 usuários, 10 cursos, 1 GB storage, Sem IA',
                'max_users' => 50,
                'max_courses' => 10,
                'max_storage_mb' => 1024,
                'features' => ['50 usuários', '10 cursos', '1 GB storage', 'Sem auxílio de IA']
            ],
            [
                'id' => 'premium',
                'name' => 'Premium',
                'price' => $catalogPrices['premium'] ?? 49.90,
                'description' => 'Até 200 usuários, 50 cursos, 10 GB storage, IA inclusa',
                'max_users' => 200,
                'max_courses' => 50,
                'max_storage_mb' => 10240,
                'features' => ['200 usuários', '50 cursos', '10 GB storage', 'Criação de aulas com IA exclusivas']
            ],
            [
                'id' => 'enterprise',
                'name' => 'Enterprise',
                'price' => $catalogPrices['enterprise'] ?? 199.00,
                'description' => 'Usuários ilimitados, cursos ilimitados, 100 GB storage, IA completa',
                'max_users' => 999999,
                'max_courses' => 999999,
                'max_storage_mb' => 102400,
                'features' => ['Usuários ilimitados', 'Cursos ilimitados', '100 GB storage', 'IA completa para professores']
            ]
        ];
        
        return Inertia::render('Central/Tenants/Create', [
            'plans' => $plans
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tenants,slug',
            'description' => 'nullable|string',
            'plan' => 'required|in:teste,basic,premium,enterprise',
            'max_users' => 'required|integer|min:1',
            'max_courses' => 'required|integer|min:1',
            'max_storage_mb' => 'required|integer|min:1',
        ]);

        // Create tenant
        $tenant = Tenant::create([
            'name' => $request->name,
            'slug' => Str::slug($request->slug),
            'description' => $request->description,
            'plan' => $request->plan,
            'max_users' => $request->max_users,
            'max_courses' => $request->max_courses,
            'max_storage_mb' => $request->max_storage_mb,
            'is_active' => true,
            'trial_ends_at' => now()->addDays(30), // 30-day trial
        ]);

        // Create domain
        $domain = $tenant->domains()->create([
            'domain' => $request->slug . '.localhost'
        ]);

        // Buscar preço atual do catálogo para o plano selecionado
        $planPrice = PlanPrice::where('plan_name', $request->plan)->first();
        $contractedPrice = $planPrice ? $planPrice->price : ($request->plan === 'teste' ? 0.00 : 19.90);
        
        // Criar contrato automático com o preço do catálogo
        $contract = TenantContract::create([
            'tenant_id' => $tenant->id,
            'plan_name' => $request->plan,
            'contracted_price' => $contractedPrice,
            'contract_start' => now(),
            'contract_end' => now()->addYear(), // 1 ano de contrato
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'discount_percentage' => 0,
            'notes' => "Contrato criado automaticamente em " . now()->format('d/m/Y H:i') . " com preço de catálogo R$ " . number_format($contractedPrice, 2, ',', '.')
        ]);

        // Log da criação do tenant para Business Intelligence
        \App\Models\TenantActivity::logTenantCreation(
            $tenant, 
            $contract, 
            auth()->user() ? auth()->user()->name : 'Sistema'
        );

        return redirect()->route('central.tenants.index')
            ->with('success', 'Tenant criado com sucesso! Contrato ativo por 1 ano com preço atual do catálogo.');
    }

    public function show(Tenant $tenant)
    {
        
        // Get tenant statistics
        $stats = [
            'users_count' => 0,
            'courses_count' => 0,
            'activities_count' => 0,
            'storage_used_mb' => 0,
        ];

        // Get tenant statistics using tenant_id filtering (single database system)
        try {
            $stats = [
                'users_count' => \App\Models\User::where('tenant_id', $tenant->id)->count(),
                'courses_count' => \App\Models\Course::where('tenant_id', $tenant->id)->count(),
                'activities_count' => \App\Models\Activity::where('tenant_id', $tenant->id)->count(),
                'storage_used_mb' => round(\App\Models\CourseMaterial::where('tenant_id', $tenant->id)->sum('file_size') / 1024 / 1024, 2),
            ];
        } catch (\Exception $e) {
            // If tenant has issues, use default stats (already set)
        }

        return Inertia::render('Central/Tenants/Show', [
            'tenant' => $tenant,
            'stats' => $stats
        ]);
    }

    public function edit(Tenant $tenant)
    {
        return Inertia::render('Central/Tenants/Edit', [
            'tenant' => $tenant
        ]);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tenants,slug,' . $tenant->id,
            'description' => 'nullable|string',
            'plan' => 'required|in:teste,basic,premium,enterprise',
            'max_users' => 'required|integer|min:1',
            'max_courses' => 'required|integer|min:1',
            'max_storage_mb' => 'required|integer|min:1',
            'is_active' => 'required|boolean',
        ]);

        $tenant->update([
            'name' => $request->name,
            'slug' => Str::slug($request->slug),
            'description' => $request->description,
            'plan' => $request->plan,
            'max_users' => $request->max_users,
            'max_courses' => $request->max_courses,
            'max_storage_mb' => $request->max_storage_mb,
            'is_active' => $request->is_active,
        ]);

        return redirect()->route('central.tenants.show', $tenant)
            ->with('success', 'Tenant atualizado com sucesso!');
    }

    public function destroy(Tenant $tenant)
    {
        // Get contract information before deletion for activity logging
        $contract = \App\Models\TenantContract::where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->first();
        
        // Log the tenant deletion activity with financial impact
        \App\Models\TenantActivity::logTenantDeletion(
            $tenant, 
            $contract, 
            auth()->user() ? auth()->user()->name : 'Sistema'
        );
        
        // This will trigger the tenant deletion events
        // which will delete the database and all associated data
        $tenant->delete();

        return redirect()->route('central.tenants.index')
            ->with('success', 'Tenant excluído com sucesso! O impacto financeiro foi registrado no sistema.');
    }

    public function toggleStatus(Tenant $tenant)
    {
        $tenant->update([
            'is_active' => !$tenant->is_active
        ]);

        $status = $tenant->is_active ? 'ativado' : 'desativado';
        
        return redirect()->back()
            ->with('success', "Tenant {$status} com sucesso!");
    }

    public function impersonate(Tenant $tenant)
    {
        \Log::info('Impersonate started for tenant: ' . $tenant->id);

        try {
            // Find first admin user in tenant (single database system)
            $adminUser = \App\Models\User::where('tenant_id', $tenant->id)
                                         ->where('role', 'admin')
                                         ->first();
            \Log::info('Admin user found: ' . ($adminUser ? $adminUser->id : 'none'));

            if (!$adminUser) {
                \Log::error('No admin user found in tenant: ' . $tenant->id);
                return redirect()->back()
                    ->with('error', 'Nenhum usuário admin encontrado neste tenant.');
            }

            // Generate secure impersonation token
            $token = \Str::random(60);
            $expiry = now()->addMinutes(10); // Token expires in 10 minutes

            // Store token in cache with user info (using file cache to ensure persistence)
            \Cache::store('file')->put("impersonate_token_{$token}", [
                'tenant_id' => $tenant->id,
                'user_id' => $adminUser->id,
                'created_at' => now(),
            ], $expiry);

            // Log impersonation token creation for audit
            \Log::warning('Impersonation token created', [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'target_user_id' => $adminUser->id,
                'target_user_email' => $adminUser->email,
                'token' => substr($token, 0, 8) . '...',
                'created_by' => auth()->check() ? auth()->user()->email : 'system',
                'expires_at' => $expiry,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            // Use subdomain system based on tenant slug
            $subdomain = $tenant->slug . '.app';
            \Log::info('Subdomain for tenant: ' . $subdomain);

            // Get the current request info for development environment
            $port = request()->getPort();
            $scheme = request()->getScheme();

            // Build URL with impersonation token - redirect to admin dashboard
            $tenantUrl = $scheme . '://' . request()->getHost();
            if ($port && $port != 80 && $port != 443) {
                $tenantUrl .= ':' . $port;
            }
            $tenantUrl .= '/impersonate/' . $token;

            \Log::info('Redirecting to: ' . $tenantUrl);

            return redirect($tenantUrl)
                ->with('success', 'Redirecionando para o tenant...');

        } catch (\Exception $e) {
            \Log::error('Impersonate error: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Erro ao acessar tenant: ' . $e->getMessage());
        }
    }
}
