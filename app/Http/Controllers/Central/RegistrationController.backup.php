<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\PlanPrice;
use App\Models\TenantContract;
use App\Models\TenantActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Stancl\Tenancy\Database\Models\Domain;

class RegistrationController extends Controller
{
    /**
     * Get plan details with current pricing
     */
    private function getPlanDetails()
    {
        // Get current pricing
        $catalogPrices = PlanPrice::pluck('price', 'plan_name')->toArray();
        
        return [
            'teste' => [
                'name' => 'TESTE',
                'tagline' => 'Experimente grátis',
                'price' => $catalogPrices['teste'] ?? 0,
                'period' => '7 dias grátis',
                'description' => 'Perfeito para testar todas as funcionalidades',
                'features' => [
                    '1 usuário',
                    '1 curso', 
                    '50MB de armazenamento',
                    'Suporte básico',
                    'Dashboard completo',
                    'Gamificação básica'
                ],
                'limits' => [
                    'max_users' => 1,
                    'max_courses' => 1,
                    'max_storage_mb' => 50
                ]
            ],
            'basic' => [
                'name' => 'BÁSICO',
                'tagline' => 'Para pequenas instituições',
                'price' => $catalogPrices['basic'] ?? 19.90,
                'period' => '/mês',
                'description' => 'Ideal para escolas e cursos pequenos',
                'features' => [
                    'Até 50 usuários',
                    'Até 10 cursos',
                    '1GB de armazenamento', 
                    'Suporte por email',
                    'Dashboard completo',
                    'Gamificação básica',
                    'Relatórios básicos'
                ],
                'limits' => [
                    'max_users' => 50,
                    'max_courses' => 10,
                    'max_storage_mb' => 1024
                ]
            ],
            'premium' => [
                'name' => 'PREMIUM',
                'tagline' => 'Para instituições em crescimento',
                'price' => $catalogPrices['premium'] ?? 49.90,
                'period' => '/mês',
                'description' => 'Para instituições em crescimento',
                'features' => [
                    'Até 200 usuários',
                    'Até 50 cursos',
                    '10GB de armazenamento',
                    'BI Analytics completo',
                    'API personalizada',
                    'Integração com IA',
                    'Suporte prioritário'
                ],
                'limits' => [
                    'max_users' => 200,
                    'max_courses' => 50,
                    'max_storage_mb' => 10240
                ]
            ],
            'enterprise' => [
                'name' => 'ENTERPRISE',
                'tagline' => 'Para grandes organizações',
                'price' => $catalogPrices['enterprise'] ?? 199.00,
                'period' => '/mês',
                'description' => 'Solução completa para grandes instituições',
                'features' => [
                    'Usuários ilimitados',
                    'Cursos ilimitados',
                    '100GB de armazenamento',
                    'IA completa para professores',
                    'Integrações avançadas',
                    'Suporte 24/7',
                    'Onboarding dedicado'
                ],
                'limits' => [
                    'max_users' => 999999,
                    'max_courses' => 999999,
                    'max_storage_mb' => 102400
                ]
            ]
        ];
    }

    /**
     * Display the multi-step registration form
     */
    public function create(Request $request)
    {
        $selectedPlan = $request->get('plan', 'premium');
        
        // Get current pricing
        $catalogPrices = PlanPrice::pluck('price', 'plan_name')->toArray();
        
        $planDetails = [
            'teste' => [
                'name' => 'TESTE',
                'tagline' => 'Experimente grátis',
                'price' => $catalogPrices['teste'] ?? 0,
                'period' => '7 dias grátis',
                'description' => 'Perfeito para testar todas as funcionalidades',
                'features' => [
                    '1 usuário',
                    '1 curso', 
                    '50MB de armazenamento',
                    'Suporte básico',
                    'Dashboard completo',
                    'Gamificação básica'
                ],
                'limits' => [
                    'max_users' => 1,
                    'max_courses' => 1,
                    'max_storage_mb' => 50
                ]
            ],
            'basic' => [
                'name' => 'BÁSICO',
                'tagline' => 'Para pequenas instituições',
                'price' => $catalogPrices['basic'] ?? 297,
                'period' => '/mês',
                'description' => 'Ideal para escolas e cursos pequenos',
                'features' => [
                    'Até 50 usuários',
                    'Até 10 cursos',
                    '1GB de armazenamento',
                    'Suporte por email',
                    'Dashboard avançado',
                    'Gamificação completa',
                    'Relatórios básicos',
                    'Certificados digitais'
                ],
                'limits' => [
                    'max_users' => 50,
                    'max_courses' => 10,
                    'max_storage_mb' => 1024
                ]
            ],
            'premium' => [
                'name' => 'PREMIUM',
                'tagline' => 'Mais popular',
                'price' => $catalogPrices['premium'] ?? 497,
                'period' => '/mês',
                'description' => 'Para instituições em crescimento',
                'features' => [
                    'Até 200 usuários',
                    'Até 50 cursos',
                    '10GB de armazenamento',
                    'Suporte prioritário',
                    'Dashboard premium',
                    'Gamificação avançada',
                    'Relatórios detalhados',
                    'Certificados personalizados',
                    'API personalizada',
                    'Integração com LMS'
                ],
                'limits' => [
                    'max_users' => 200,
                    'max_courses' => 50,
                    'max_storage_mb' => 10240
                ]
            ],
            'enterprise' => [
                'name' => 'ENTERPRISE',
                'tagline' => 'Para grandes organizações',
                'price' => $catalogPrices['enterprise'] ?? 997,
                'period' => '/mês',
                'description' => 'Solução completa para grandes instituições',
                'features' => [
                    'Usuários ilimitados',
                    'Cursos ilimitados',
                    '100GB de armazenamento',
                    'Suporte 24/7',
                    'Dashboard enterprise',
                    'Gamificação personalizada',
                    'BI Analytics completo',
                    'White-label completo',
                    'API completa',
                    'Integração personalizada',
                    'Gerente dedicado',
                    'Treinamento incluído'
                ],
                'limits' => [
                    'max_users' => 999999,
                    'max_courses' => 999999,
                    'max_storage_mb' => 102400
                ]
            ]
        ];

        return Inertia::render('Central/Registration/Create', [
            'selectedPlan' => $selectedPlan,
            'planDetails' => $planDetails,
            'allPlans' => array_keys($planDetails),
            'step' => 1
        ]);
    }

    /**
     * Process step 1: Company information and plan selection
     */
    public function storeStep1(Request $request)
    {
        \Log::info('Step1 request received', $request->all());
        
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_email' => 'required|email|max:255',
            'admin_name' => 'required|string|max:255',
            'admin_phone' => 'nullable|string|max:20',
            'plan' => 'required|in:teste,basic,premium,enterprise',
            'industry' => 'nullable|string|max:100',
            'expected_users' => 'nullable|string|max:10'
        ]);

        // Store in session for multi-step process
        session(['registration_step1' => $validated]);

        \Log::info('Step1 completed successfully', $validated);

        // Redirect to step 2
        return redirect()->route('central.register.step2')->with('step1_completed', true);
    }

    /**
     * Display step 2: Tenant configuration
     */
    public function showStep2(Request $request)
    {
        $step1Data = session('registration_step1');
        
        if (!$step1Data) {
            return redirect()->route('central.register')->with('error', 'Sessão expirada. Reinicie o processo.');
        }

        // Generate suggested slug based on company name
        $suggestedSlug = Str::slug($step1Data['company_name']);
        $slugBase = $suggestedSlug;
        $counter = 1;
        
        // Ensure unique slug
        while (Tenant::where('slug', $suggestedSlug)->exists()) {
            $suggestedSlug = $slugBase . '-' . $counter;
            $counter++;
        }

        return Inertia::render('Central/Registration/Create', [
            'selectedPlan' => $step1Data['plan'],
            'planDetails' => $this->getPlanDetails()[$step1Data['plan']],
            'allPlans' => $this->getPlanDetails(),
            'step1_completed' => true,
            'step2_active' => true,
            'step1Data' => $step1Data,
            'suggestedSlug' => $suggestedSlug,
            'step' => 2
        ]);
    }

    /**
     * Process step 2: Tenant configuration
     */
    public function storeStep2(Request $request)
    {
        $validated = $request->validate([
            'tenant_name' => 'required|string|max:255',
            'tenant_slug' => 'required|string|max:100|unique:tenants,slug',
            'tenant_description' => 'nullable|string|max:500',
            'custom_domain' => 'nullable|string|max:255',
            'primary_color' => 'nullable|string|max:7',
            'logo_url' => 'nullable|url'
        ]);

        // Validate slug format
        if (!preg_match('/^[a-z0-9\-]+$/', $validated['tenant_slug'])) {
            throw ValidationException::withMessages([
                'tenant_slug' => 'Slug deve conter apenas letras minúsculas, números e hífens.'
            ]);
        }

        // Store in session
        session(['registration_step2' => $validated]);

        $step1Data = session('registration_step1');
        
        \Log::info('Step2 completed successfully', $validated);

        // For free plans, skip payment and go directly to confirmation
        if ($step1Data['plan'] === 'teste') {
            return redirect()->route('central.register.step4');
        }

        return redirect()->route('central.register.step3');
    }

    /**
     * Display step 3: Payment information (for paid plans)
     */
    public function showStep3(Request $request)
    {
        $step1Data = session('registration_step1');
        $step2Data = session('registration_step2');
        
        if (!$step1Data || !$step2Data) {
            return redirect()->route('central.register')->with('error', 'Sessão expirada. Reinicie o processo.');
        }

        // Skip payment for free plans
        if ($step1Data['plan'] === 'teste') {
            return $this->showStep4($request);
        }

        $planPrice = PlanPrice::where('plan_name', $step1Data['plan'])->first();
        $price = $planPrice ? $planPrice->price : 0;

        return Inertia::render('Central/Registration/Create', [
            'selectedPlan' => $step1Data['plan'],
            'planDetails' => $this->getPlanDetails()[$step1Data['plan']],
            'allPlans' => $this->getPlanDetails(),
            'step1_completed' => true,
            'step2_completed' => true,
            'step3_active' => true,
            'step1Data' => $step1Data,
            'step2Data' => $step2Data,
            'planPrice' => $price,
            'step' => 3,
            'stripePublishableKey' => config('cashier.key') // We'll configure Stripe later
        ]);
    }

    /**
     * Process step 3: Payment information
     */
    public function processStep3(Request $request)
    {
        $step1Data = session('registration_step1');
        $step2Data = session('registration_step2');

        if (!$step1Data || !$step2Data) {
            return \Inertia\Inertia::location(route('central.register'));
        }

        // For free plans, skip payment processing
        if ($step1Data['plan'] === 'teste') {
            return \Inertia\Inertia::location(route('central.register.step4'));
        }

        // Validate payment data (basic validation for now)
        $validated = $request->validate([
            'payment_method' => 'required|string',
            // Add more payment validation as needed
        ]);

        // Store payment data in session
        session(['registration_step3' => $validated]);

        // For now, we'll simulate successful payment processing
        // In production, integrate with payment gateway here

        \Log::info('Step3 payment processed', $validated);

        // Redirect to step 4 using Inertia
        return \Inertia\Inertia::location(route('central.register.step4'));
    }

    /**
     * Display step 4: Confirmation and review
     */
    public function showStep4(Request $request)
    {
        $step1Data = session('registration_step1');
        $step2Data = session('registration_step2');
        $step3Data = session('registration_step3', []);

        // Check if we have tenant_info from successful creation
        $tenantInfo = session('tenant_info');

        // Get creation_id from request parameter (when redirected from startCreation)
        $creationId = $request->get('creation_id');

        if (!$step1Data || !$step2Data) {
            return redirect()->route('central.register')->with('error', 'Sessão expirada. Reinicie o processo.');
        }

        $planPrice = PlanPrice::where('plan_name', $step1Data['plan'])->first();
        $price = $planPrice ? $planPrice->price : 0;

        // If tenant was just created, show Step4 success page
        if ($tenantInfo) {
            return Inertia::render('Central/Registration/Step4', [
                'step1Data' => $step1Data,
                'step2Data' => $step2Data,
                'step3Data' => $step3Data,
                'planPrice' => $price,
                'isFree' => $step1Data['plan'] === 'teste',
                'tenantInfo' => $tenantInfo,
                'creation_id' => $creationId
            ]);
        }

        // Otherwise show normal Step4 confirmation page
        return Inertia::render('Central/Registration/Step4', [
            'step1Data' => $step1Data,
            'step2Data' => $step2Data,
            'step3Data' => $step3Data,
            'planPrice' => $price,
            'isFree' => $step1Data['plan'] === 'teste',
            'creation_id' => $creationId
        ]);
    }

    /**
     * Start tenant creation process (async)
     */
    public function startCreation(Request $request)
    {
        // Get data from session
        $step1Data = session('registration_step1');
        $step2Data = session('registration_step2');

        if (!$step1Data || !$step2Data) {
            \Log::warning('🚫 CRIAÇÃO FALHOU: Sessão expirada', [
                'step1_exists' => !!$step1Data,
                'step2_exists' => !!$step2Data,
                'session_id' => session()->getId()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Sessão expirada. Reinicie o processo.'
            ], 400);
        }

        // Check if there's already a creation in progress for this session
        $tenantSlug = $step2Data['tenant_slug'];
        $existingCreationKey = "tenant_creation_by_slug_{$tenantSlug}";
        $existingCreation = cache()->get($existingCreationKey);

        if ($existingCreation && $existingCreation['status'] !== 'completed' && $existingCreation['status'] !== 'failed') {
            \Log::info('🔄 CRIAÇÃO JÁ EM PROGRESSO', [
                'existing_creation_id' => $existingCreation['creation_id'],
                'tenant_slug' => $tenantSlug,
                'status' => $existingCreation['status']
            ]);

            // Return existing creation_id with redirect
            return redirect()->route('central.register.step4', ['creation_id' => $existingCreation['creation_id']]);
        }

        // Generate creation job ID for tracking
        $creationId = Str::uuid();

        \Log::info('🚀 INICIANDO CRIAÇÃO TENANT', [
            'creation_id' => $creationId,
            'plan' => $step1Data['plan'],
            'tenant_name' => $step2Data['tenant_name'],
            'tenant_slug' => $step2Data['tenant_slug'],
            'company_email' => $step1Data['company_email'],
            'timestamp' => now()->toISOString()
        ]);

        // Store creation status in cache
        cache()->put("tenant_creation_{$creationId}", [
            'status' => 'started',
            'progress' => 0,
            'current_step' => 'initializing',
            'message' => 'Iniciando criação da plataforma...',
            'created_at' => now(),
            'started_at' => now()->toISOString(),
            'plan' => $step1Data['plan'],
            'tenant_slug' => $step2Data['tenant_slug']
        ], 300); // 5 minutes timeout

        // Also cache by slug to prevent duplicates
        cache()->put($existingCreationKey, [
            'creation_id' => $creationId,
            'status' => 'started',
            'tenant_slug' => $tenantSlug
        ], 300);

        // Dispatch job to create tenant asynchronously
        dispatch(function () use ($creationId, $step1Data, $step2Data) {
            $this->createTenantAsync($creationId, $step1Data, $step2Data);
        });

        return redirect()->route('central.register.step4', ['creation_id' => $creationId]);
    }

    /**
     * Check tenant creation status
     */
    public function checkCreationStatus($creationId)
    {
        $status = cache()->get("tenant_creation_{$creationId}");

        if (!$status) {
            return response()->json([
                'success' => false,
                'message' => 'Processo de criação não encontrado ou expirado'
            ], 404);
        }

        // If completed, also return final result if available
        if ($status['status'] === 'completed') {
            $result = cache()->get("tenant_creation_{$creationId}_result");
            if ($result) {
                $status['result'] = $result;
            }

            // Check if cleanup is scheduled and execute delayed cleanup
            if (cache()->get("cleanup_scheduled_{$creationId}")) {
                \Log::info('🧹 Executando limpeza de cache após leitura do frontend', ['creation_id' => $creationId]);

                // Schedule actual cleanup in 10 seconds
                cache()->put("cleanup_execute_{$creationId}", [
                    'timestamp' => time(),
                    'tenant_slug' => session('step2_data')['tenant_slug'] ?? null
                ], 15);

                // Remove the scheduled flag
                cache()->forget("cleanup_scheduled_{$creationId}");
            }

            // Execute cleanup if enough time has passed (10+ seconds since completion)
            $cleanupData = cache()->get("cleanup_execute_{$creationId}");
            if ($cleanupData && (time() - $cleanupData['timestamp']) >= 10) {
                \Log::info('🗑️ Executando limpeza final de cache', ['creation_id' => $creationId]);

                cache()->forget("tenant_creation_{$creationId}");
                cache()->forget("tenant_creation_{$creationId}_result");
                if ($cleanupData['tenant_slug']) {
                    cache()->forget("tenant_creation_by_slug_{$cleanupData['tenant_slug']}");
                }
                cache()->forget("cleanup_execute_{$creationId}");
            }
        }

        return response()->json([
            'success' => true,
            'status' => $status
        ]);
    }

    /**
     * Get tenant creation final result
     */
    public function getCreationResult($creationId)
    {
        $result = cache()->get("tenant_creation_{$creationId}_result");

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Resultado não encontrado ou expirado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'result' => $result
        ]);
    }

    /**
     * Process final registration and create tenant (original method - now async)
     */
    public function complete(Request $request)
    {
        // For backwards compatibility, redirect to async process
        return $this->startCreation($request);
    }

    /**
     * Create tenant asynchronously
     */
    private function createTenantAsync($creationId, $step1Data, $step2Data)
    {
        // IMMEDIATE logging to detect if method is called
        \Log::info('🚀 MÉTODO CREATETENANTASYNC CHAMADO!', [
            'creation_id' => $creationId,
            'timestamp' => now()->format('Y-m-d H:i:s')
        ]);

        try {
            \Log::info('🚀 INICIANDO CRIAÇÃO DA PLATAFORMA ASYNC', [
                'creation_id' => $creationId,
                'timestamp' => now()->format('Y-m-d H:i:s'),
                'step1_data' => $step1Data,
                'step2_data' => $step2Data
            ]);

        $updateStatus = function($status, $progress, $step, $message) use ($creationId) {
            cache()->put("tenant_creation_{$creationId}", [
                'status' => $status,
                'progress' => $progress,
                'current_step' => $step,
                'message' => $message,
                'updated_at' => now()
            ], 300);
        };

            // STEP 1/7: Validação inicial
            $updateStatus('running', 10, 'validating_data', 'Validando dados fornecidos...');
            sleep(1);
            \Log::info('✅ ETAPA 1/7: Dados validados');

            // STEP 2/7: Limpeza emergencial
            $updateStatus('running', 15, 'emergency_cleanup', 'Executando limpeza preventiva...');
            try {
                // 1. First, collect all tenant IDs with this slug BEFORE deletion
                $existingTenants = DB::connection('central')->select('SELECT id, slug FROM tenants WHERE slug = ? OR slug LIKE ?', [$step2Data['tenant_slug'], $step2Data['tenant_slug'] . '%']);

                // 2. Clean domains table FIRST (while tenants still exist)
                foreach ($existingTenants as $tenant) {
                    DB::connection('central')->statement('DELETE FROM domains WHERE tenant_id = ?', [$tenant->id]);
                }

                // 3. Drop ALL possible databases for these tenants
                $possibleDatabases = [
                    'tenant' . $step2Data['tenant_slug'],
                    $step2Data['tenant_slug'],
                ];

                foreach ($existingTenants as $tenant) {
                    $possibleDatabases[] = 'tenant' . $tenant->id;
                }

                foreach ($possibleDatabases as $dbName) {
                    try {
                        DB::connection('central')->statement('DROP DATABASE IF EXISTS `' . $dbName . '`');
                        \Log::info('🗑️ Database droppped', ['database' => $dbName]);
                    } catch (\Exception $dbError) {
                        \Log::warning('⚠️ Error dropping database (não crítico)', ['database' => $dbName, 'error' => $dbError->getMessage()]);
                    }
                }

                // 4. Delete tenant records LAST
                DB::connection('central')->statement('DELETE FROM tenants WHERE slug = ? OR slug LIKE ?', [$step2Data['tenant_slug'], $step2Data['tenant_slug'] . '%']);

                // 5. Force commit and clear any caches
                DB::connection('central')->statement('COMMIT');

                \Log::info('✅ ETAPA 2/7: Limpeza emergencial concluída', [
                    'slug' => $step2Data['tenant_slug'],
                    'tenants_found' => count($existingTenants),
                    'databases_dropped' => count($possibleDatabases)
                ]);

            } catch (\Exception $e) {
                \Log::warning('⚠️ Emergency cleanup error (continuing anyway)', ['error' => $e->getMessage()]);
            }

            // STEP 3/7: Criar tenant
            $updateStatus('running', 30, 'creating_tenant', 'Criando tenant na central...');
            sleep(1);

            // GARANTIR SLUG ÚNICO
            $originalSlug = $step2Data['tenant_slug'];
            $uniqueSlug = $this->generateUniqueSlug($originalSlug);
            if ($uniqueSlug !== $originalSlug) {
                \Log::warning("Slug alterado para garantir unicidade", [
                    'original' => $originalSlug,
                    'unique' => $uniqueSlug
                ]);
                $step2Data['tenant_slug'] = $uniqueSlug;
            }

            // Final verification: ensure slug is still unique after cleanup
            $existingSlugCount = DB::connection('central')->scalar('SELECT COUNT(*) FROM tenants WHERE slug = ?', [$step2Data['tenant_slug']]);
            if ($existingSlugCount > 0) {
                throw new \Exception("ERRO CRÍTICO: Slug '{$step2Data['tenant_slug']}' ainda existe após limpeza e geração única. Existe {$existingSlugCount} tenant(s) com este slug.");
            }

            // Generate tenant ID and aggressively clean any orphaned data first
            $tenantId = (string) Str::uuid();
            $tenantDbName = 'tenant' . $tenantId;

            // AGGRESSIVE DATABASE CLEANUP to prevent "database already exists" error
            try {
                // Clean up any possible database patterns
                $possibleDbNames = [
                    $tenantDbName,
                    'tenant' . str_replace('-', '', $tenantId), // Without hyphens
                    $step2Data['tenant_slug'],
                    'tenant_' . $step2Data['tenant_slug'],
                ];

                foreach ($possibleDbNames as $dbName) {
                    DB::connection('central')->statement('DROP DATABASE IF EXISTS `' . $dbName . '`');
                }

                // Also check and clean any databases that match pattern 'tenant%' and are orphaned
                $existingDatabases = DB::connection('central')->select("SHOW DATABASES LIKE 'tenant%'");
                foreach ($existingDatabases as $db) {
                    $dbName = array_values((array)$db)[0];
                    // Check if this database has a matching tenant record
                    $tenantExists = DB::connection('central')->table('tenants')
                        ->where('id', str_replace('tenant', '', $dbName))
                        ->exists();

                    if (!$tenantExists) {
                        DB::connection('central')->statement('DROP DATABASE IF EXISTS `' . $dbName . '`');
                        \Log::info('🧹 Removed orphaned database', ['database' => $dbName]);
                    }
                }

                \Log::info('🧹 Limpeza preventiva AGRESSIVA concluída', [
                    'tenant_id' => $tenantId,
                    'primary_db' => $tenantDbName,
                    'cleaned_patterns' => count($possibleDbNames)
                ]);
            } catch (\Exception $e) {
                \Log::warning('⚠️ Erro na limpeza preventiva (não crítico)', ['error' => $e->getMessage()]);
            }

            $tenant = Tenant::create([
                'id' => $tenantId,
                'name' => $step2Data['tenant_name'],
                'slug' => $step2Data['tenant_slug'],
                'description' => $step2Data['tenant_description'] ?? '',
                'plan' => $step1Data['plan'],
                'max_users' => $this->getPlanLimits($step1Data['plan'])['max_users'],
                'max_courses' => $this->getPlanLimits($step1Data['plan'])['max_courses'],
                'max_storage_mb' => $this->getPlanLimits($step1Data['plan'])['max_storage_mb'],
                'is_active' => true,
                'trial_ends_at' => $step1Data['plan'] === 'teste' ? now()->addDays(7) : null,
                'data' => [
                    'primary_color' => $step2Data['primary_color'] ?? '#3B82F6',
                    'logo_url' => $step2Data['logo_url'] ?? null,
                    'industry' => $step1Data['industry'] ?? null,
                    'expected_users' => $step1Data['expected_users'] ?? null
                ]
            ]);

            \Log::info('✅ ETAPA 3/7: TENANT CRIADO NA CENTRAL!', [
                'creation_id' => $creationId,
                'tenant_id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'plan' => $tenant->plan
            ]);

            // STEP 4/7: Configurar domínio
            $updateStatus('running', 50, 'configuring_domain', 'Configurando domínio...');
            sleep(1);

            $domainName = $step2Data['tenant_slug'] . '.saas-gamificacao.local';
            $tenant->domains()->create(['domain' => $domainName]);

            \Log::info('✅ ETAPA 4/7: DOMÍNIO CRIADO!', ['domain' => $domainName]);

            // STEP 5/7: Database creation and migrations (automatic via Stancl events)
            $updateStatus('running', 70, 'creating_database', 'Criando base de dados e executando migrações...');
            sleep(3); // Wait for automatic database creation to complete

            \Log::info('✅ ETAPA 5/7: DATABASE E MIGRATIONS PROCESSADOS!');

            // STEP 6/7: Create admin user
            $updateStatus('running', 85, 'creating_admin', 'Criando usuário administrador...');
            sleep(1);

            $adminCreated = false;
            $tenantSlug = $step2Data['tenant_slug']; // Define the variable before closure
            $tenant->run(function () use ($step1Data, $step2Data, $tenantSlug, &$adminCreated) {
                // CORREÇÃO: Fallback defensivo para admin_email
                $adminEmail = $step1Data['admin_email'] ??
                             $step1Data['company_email'] ??
                             $step2Data['admin_email'] ??
                             $step2Data['company_email'] ??
                             $step2Data['email'] ??
                             'admin@' . $tenantSlug . '.com';

                $adminName = $step1Data['admin_name'] ??
                            $step1Data['name'] ??
                            $step2Data['admin_name'] ??
                            'Administrador';

                $admin = \App\Models\User::create([
                    'name' => $adminName,
                    'email' => $adminEmail,
                    'password' => Hash::make('password123'),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                    'total_points' => 0,
                ]);

                // Test credentials
                $loginTest = \Auth::attempt([
                    'email' => $adminEmail,
                    'password' => 'password123'
                ]);

                if (!$loginTest) {
                    throw new \Exception('Credenciais do administrador não funcionam');
                }

                \Auth::logout();
                $adminCreated = true;
            });

            if (!$adminCreated) {
                throw new \Exception('Falha na criação do usuário administrador');
            }

            // Fix: Get admin email with fallback chain
            $adminEmail = $step1Data['admin_email'] ?? $step1Data['company_email'] ?? $step2Data['email'] ?? 'admin@' . $tenantSlug . '.com';

            \Log::info('✅ ETAPA 6/7: USUÁRIO ADMIN CRIADO E VALIDADO!', [
                'email' => $adminEmail,
                'tenant_id' => $tenant->id
            ]);

            // STEP 7/7: Finalização
            $updateStatus('running', 95, 'finalizing', 'Finalizando configuração da plataforma...');
            sleep(1);

            // Configurar dados iniciais (opcional)
            $tenant->run(function () {
                try {
                    \Artisan::call('db:seed', [
                        '--class' => 'TenantSeeder',
                        '--force' => true
                    ]);
                } catch (\Exception $e) {
                    \Log::warning('⚠️ Seeders falharam (não crítico)', ['error' => $e->getMessage()]);
                }
            });

            // Step 7: Health Check - Verify tenant integrity
            $updateStatus('running', 95, 'health_check', 'Validando integridade da plataforma...');
            sleep(1);

            $healthCheckPassed = $this->performTenantHealthCheck($tenant, $step1Data, $creationId);

            if (!$healthCheckPassed) {
                throw new \Exception('Falha na validação da integridade da plataforma criada');
            }

            // Step 8: Handle billing
            $planPrice = PlanPrice::where('plan_name', $step1Data['plan'])->first();
            $monthlyPrice = $planPrice ? $planPrice->price : 0;

            if ($monthlyPrice > 0) {
                TenantContract::create([
                    'tenant_id' => $tenant->id,
                    'plan_name' => $step1Data['plan'],
                    'contracted_price' => $monthlyPrice,
                    'contract_start' => now(),
                    'contract_end' => now()->addYear(),
                    'status' => 'active',
                    'billing_cycle' => 'monthly'
                ]);
            }

            // Step 9: Log activity
            try {
                TenantActivity::create([
                    'tenant_id' => $tenant->id,
                    'tenant_name' => $tenant->name,
                    'activity_type' => 'created',
                    'plan_name' => $step1Data['plan'],
                    'monthly_value' => $monthlyPrice,
                    'financial_impact' => $monthlyPrice,
                    'description' => "Tenant {$tenant->name} criado com sucesso no plano {$step1Data['plan']}",
                    'occurred_at' => now(),
                    'performed_by' => $step1Data['admin_name'],
                    'metadata' => json_encode([
                        'creation_id' => $creationId,
                        'registration_data' => [
                            'step1' => $step1Data,
                            'step2' => $step2Data
                        ]
                    ])
                ]);
            } catch (\Exception $e) {
                \Log::warning('⚠️ Falha ao registrar atividade', ['error' => $e->getMessage()]);
            }

            // ETAPA 7/7: CONCLUÍDO!
            $updateStatus('completed', 100, 'completed', '🎉 Plataforma criada com sucesso!');
            \Log::info('✅ ETAPA 7/7: TODAS AS ETAPAS CONCLUÍDAS COM SUCESSO!', [
                'creation_id' => $creationId,
                'tenant_id' => $tenant->id,
                'slug' => $tenant->slug,
                'domain' => $domainName,
                'total_duration' => now()->diffInSeconds($tenant->created_at) . 's'
            ]);

            // Store final tenant info in cache with longer expiration
            cache()->put("tenant_creation_{$creationId}_result", [
                'success' => true,
                'tenant' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'plan' => $tenant->plan,
                    'created_at' => $tenant->created_at
                ],
                'domain' => $domainName,
                'login_url' => "http://{$domainName}:8000/login",
                'admin_panel_url' => "http://{$domainName}:8000/admin/dashboard",
                'credentials' => [
                    'email' => $step1Data['company_email'],
                    'password' => 'password123'
                ],
                'plan_price' => $monthlyPrice,
                'is_free' => $step1Data['plan'] === 'teste',
                'next_steps' => [
                    '1. 🔑 Credenciais validadas - login garantido!',
                    '2. 🌐 Acesse sua plataforma usando as credenciais',
                    '3. 🔒 Altere sua senha no primeiro acesso',
                    '4. ⚙️ Configure sua escola/instituição',
                    '5. 📚 Crie seus primeiros cursos',
                    '6. 👥 Cadastre instrutores e alunos'
                ]
            ], 900); // 15 minutes

            \Log::info('🎉 PLATAFORMA CRIADA COM SUCESSO!', [
                'creation_id' => $creationId,
                'tenant_id' => $tenant->id,
                'domain' => $domainName,
                'admin_email' => $step1Data['company_email'],
                'plan' => $step1Data['plan']
            ]);

            // Delayed cache cleanup: Allow frontend to read the result first (10 seconds delay)
            \Log::info('⏰ Agendando limpeza de cache em 10 segundos para permitir leitura do frontend');
            cache()->put("cleanup_scheduled_{$creationId}", true, 15); // Mark for cleanup

        } catch (\Exception $e) {
            \Log::error('💥 ERRO CRÍTICO NA CRIAÇÃO DA PLATAFORMA', [
                'creation_id' => $creationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $updateStatus('failed', 0, 'error', 'Erro na criação: ' . $e->getMessage());

            // Clean up if tenant was created
            if (isset($tenant) && $tenant->exists) {
                try {
                    $tenant->domains()->delete();
                    $tenant->delete();
                    \Log::info('✅ Cleanup concluído para tenant com falha');
                } catch (\Exception $cleanupError) {
                    \Log::error('❌ Erro no cleanup', ['error' => $cleanupError->getMessage()]);
                }
            }
        }
    }

    /**
     * Check slug availability
     */
    public function checkSlug(Request $request)
    {
        $slug = $request->get('slug');
        
        if (!$slug) {
            return response()->json(['available' => false, 'message' => 'Slug é obrigatório']);
        }

        if (!preg_match('/^[a-z0-9\-]+$/', $slug)) {
            return response()->json([
                'available' => false, 
                'message' => 'Slug deve conter apenas letras minúsculas, números e hífens'
            ]);
        }

        $exists = Tenant::where('slug', $slug)->exists();
        
        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'Este slug já está em uso' : 'Slug disponível',
            'preview_url' => "http://{$slug}.saas-gamificacao.local:8000"
        ]);
    }

    /**
     * Get plan limits configuration
     */
    private function getPlanLimits($plan)
    {
        $limits = [
            'teste' => ['max_users' => 1, 'max_courses' => 1, 'max_storage_mb' => 50],
            'basic' => ['max_users' => 50, 'max_courses' => 10, 'max_storage_mb' => 1024],
            'premium' => ['max_users' => 200, 'max_courses' => 50, 'max_storage_mb' => 10240],
            'enterprise' => ['max_users' => 999999, 'max_courses' => 999999, 'max_storage_mb' => 102400]
        ];

        return $limits[$plan] ?? $limits['basic'];
    }

    /**
     * Perform comprehensive health check on newly created tenant
     */
    private function performTenantHealthCheck($tenant, $step1Data, $creationId)
    {
        try {
            \Log::info('🔍 INICIANDO HEALTH CHECK DA PLATAFORMA', [
                'creation_id' => $creationId,
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name
            ]);

            $healthChecks = [];

            // 1. Check tenant exists and is active
            $healthChecks['tenant_exists'] = $tenant->exists && $tenant->is_active;

            // 2. Check domain exists
            $domain = $tenant->domains()->first();
            $healthChecks['domain_exists'] = !is_null($domain);

            // 3. Check tenant database connectivity
            $healthChecks['database_connection'] = false;
            try {
                $tenant->run(function () use (&$healthChecks) {
                    // Try to query users table
                    $userCount = \DB::table('users')->count();
                    $healthChecks['database_connection'] = true;
                    $healthChecks['admin_user_exists'] = $userCount > 0;
                });
            } catch (\Exception $e) {
                \Log::error('❌ Health check - Database connection failed', ['error' => $e->getMessage()]);
            }

            // 4. Verify admin user can login
            $healthChecks['admin_login_test'] = false;
            try {
                $tenant->run(function () use ($step1Data, &$healthChecks) {
                    $loginTest = \Auth::attempt([
                        'email' => $step1Data['company_email'],
                        'password' => 'password123'
                    ]);

                    if ($loginTest) {
                        $healthChecks['admin_login_test'] = true;
                        \Auth::logout();
                    }
                });
            } catch (\Exception $e) {
                \Log::error('❌ Health check - Admin login test failed', ['error' => $e->getMessage()]);
            }

            // 5. Check essential tables exist
            $healthChecks['essential_tables'] = false;
            try {
                $tenant->run(function () use (&$healthChecks) {
                    $requiredTables = ['users', 'courses', 'activities', 'badges', 'user_progress'];
                    $existingTables = \DB::select('SHOW TABLES');
                    $existingTableNames = array_map(function($table) {
                        return array_values((array)$table)[0];
                    }, $existingTables);

                    $allTablesExist = true;
                    foreach ($requiredTables as $table) {
                        if (!in_array($table, $existingTableNames)) {
                            $allTablesExist = false;
                            break;
                        }
                    }

                    $healthChecks['essential_tables'] = $allTablesExist;
                });
            } catch (\Exception $e) {
                \Log::error('❌ Health check - Table verification failed', ['error' => $e->getMessage()]);
            }

            // 6. Check tenant configuration
            $healthChecks['tenant_config'] = (
                !empty($tenant->name) &&
                !empty($tenant->slug) &&
                !empty($tenant->plan) &&
                $tenant->max_users > 0
            );

            // Evaluate overall health
            $criticalChecks = [
                'tenant_exists',
                'domain_exists',
                'database_connection',
                'admin_user_exists',
                'admin_login_test'
            ];

            $criticalChecksPassed = 0;
            foreach ($criticalChecks as $check) {
                if ($healthChecks[$check] ?? false) {
                    $criticalChecksPassed++;
                }
            }

            $healthScore = ($criticalChecksPassed / count($criticalChecks)) * 100;
            $overallHealth = $healthScore >= 100; // All critical checks must pass

            \Log::info('📊 HEALTH CHECK RESULTS', [
                'creation_id' => $creationId,
                'tenant_id' => $tenant->id,
                'health_score' => $healthScore . '%',
                'overall_health' => $overallHealth ? 'PASSED' : 'FAILED',
                'checks' => $healthChecks
            ]);

            if ($overallHealth) {
                \Log::info('✅ HEALTH CHECK PASSED - PLATAFORMA SAUDÁVEL!', [
                    'creation_id' => $creationId,
                    'tenant_id' => $tenant->id,
                    'score' => $healthScore . '%'
                ]);
            } else {
                \Log::error('❌ HEALTH CHECK FAILED - PROBLEMAS ENCONTRADOS!', [
                    'creation_id' => $creationId,
                    'tenant_id' => $tenant->id,
                    'score' => $healthScore . '%',
                    'failed_checks' => array_filter($healthChecks, function($passed) { return !$passed; })
                ]);
            }

            return $overallHealth;

        } catch (\Exception $e) {
            \Log::error('💥 ERRO NO HEALTH CHECK', [
                'creation_id' => $creationId,
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }

    /**
     * Generate a unique slug for tenant creation with transaction safety
     */
    private function generateUniqueSlug($baseName)
    {
        return DB::connection('central')->transaction(function () use ($baseName) {
            // Remove any existing numbers at the end
            $cleanBaseName = preg_replace('/\d+$/', '', $baseName);
            $cleanBaseName = trim($cleanBaseName);

            // Check if base name is available (include soft deleted)
            $baseExists = DB::connection('central')->table('tenants')
                ->where('slug', $cleanBaseName)
                ->exists();

            if (!$baseExists) {
                return $cleanBaseName;
            }

            // Generate unique slug with incrementing number
            $counter = 1;
            do {
                $slug = $cleanBaseName . $counter;

                // Check both active and soft deleted tenants
                $exists = DB::connection('central')->table('tenants')
                    ->where('slug', $slug)
                    ->exists();

                if (!$exists) {
                    return $slug;
                }

                $counter++;
            } while ($counter <= 1000); // Increased limit

            // Fallback with timestamp and random component
            return $cleanBaseName . '_' . time() . '_' . rand(100, 999);
        });
    }
}
