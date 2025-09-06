<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Tenant;
use Stancl\Tenancy\Database\Models\Domain;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    public function index()
    {
        $tenants = Tenant::with('domains')->latest()->paginate(10);
        
        return Inertia::render('Central/Tenants/Index', [
            'tenants' => $tenants
        ]);
    }

    public function create()
    {
        return Inertia::render('Central/Tenants/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tenants,slug',
            'description' => 'nullable|string',
            'plan' => 'required|in:basic,premium,enterprise',
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

        return redirect()->route('central.tenants.index')
            ->with('success', 'Tenant criado com sucesso!');
    }

    public function show(Tenant $tenant)
    {
        $tenant->load('domains');
        
        // Get tenant statistics
        $stats = [
            'users_count' => 0,
            'courses_count' => 0,
            'activities_count' => 0,
            'storage_used_mb' => 0,
        ];

        // Run tenant-scoped queries to get statistics
        tenancy()->initialize($tenant);
        try {
            $stats = [
                'users_count' => \App\Models\User::count(),
                'courses_count' => \App\Models\Course::count(),
                'activities_count' => \App\Models\Activity::count(),
                'storage_used_mb' => round(\App\Models\CourseMaterial::sum('file_size') / 1024 / 1024, 2),
            ];
        } catch (\Exception $e) {
            // If tenant database doesn't exist or has issues, use default stats
        }
        tenancy()->end();

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
            'plan' => 'required|in:basic,premium,enterprise',
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
        // This will trigger the tenant deletion events
        // which will delete the database and all associated data
        $tenant->delete();

        return redirect()->route('central.tenants.index')
            ->with('success', 'Tenant excluído com sucesso!');
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
        // Initialize tenant context
        tenancy()->initialize($tenant);
        
        try {
            // Find first admin user in tenant
            $adminUser = \App\Models\User::where('role', 'admin')->first();
            
            if (!$adminUser) {
                tenancy()->end();
                return redirect()->back()
                    ->with('error', 'Nenhum usuário admin encontrado neste tenant.');
            }

            // Generate impersonation token (if using the feature)
            // For now, just redirect to tenant domain with login
            $domain = $tenant->domains()->first();
            
            tenancy()->end();
            
            if ($domain) {
                return redirect('http://' . $domain->domain)
                    ->with('success', 'Redirecionando para o tenant...');
            }
            
            return redirect()->back()
                ->with('error', 'Domínio não encontrado para este tenant.');
                
        } catch (\Exception $e) {
            tenancy()->end();
            return redirect()->back()
                ->with('error', 'Erro ao acessar tenant: ' . $e->getMessage());
        }
    }
}
