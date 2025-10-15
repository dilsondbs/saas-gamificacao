<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║   🧹 RESET COMPLETO DO AMBIENTE - TESTE REAL                ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

echo "⚠️  ATENÇÃO: Isso vai DELETAR todos os dados de teste!\n";
echo "    Pressione ENTER para continuar ou CTRL+C para cancelar...\n";
fgets(STDIN);

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "1️⃣  LIMPANDO TENANTS DE TESTE\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

// Deletar tenants de teste
$testTenants = DB::table('tenants')
    ->where('slug', 'like', 'vemcomigoja%')
    ->orWhere('slug', 'like', 'teste%')
    ->get();

echo "Tenants encontrados: " . $testTenants->count() . "\n\n";

foreach ($testTenants as $tenant) {
    echo "🗑️  Deletando tenant: {$tenant->name} ({$tenant->slug})\n";

    $tenantId = $tenant->id;

    // Deletar dados relacionados
    DB::table('users')->where('tenant_id', $tenantId)->delete();
    DB::table('courses')->where('tenant_id', $tenantId)->delete();
    DB::table('activities')->where('tenant_id', $tenantId)->delete();
    DB::table('course_enrollments')->where('tenant_id', $tenantId)->delete();
    DB::table('user_activities')->where('tenant_id', $tenantId)->delete();
    DB::table('user_activities_new')->where('tenant_id', $tenantId)->delete();
    DB::table('badges')->where('tenant_id', $tenantId)->delete();
    DB::table('user_badges')->where('tenant_id', $tenantId)->delete();
    DB::table('points')->where('tenant_id', $tenantId)->delete();

    // Deletar tenant
    DB::table('tenants')->where('id', $tenantId)->delete();

    echo "   ✅ Deletado!\n\n";
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "2️⃣  LIMPANDO LOGS\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

file_put_contents(__DIR__ . '/storage/logs/laravel.log', '');
echo "✅ Log limpo\n\n";

echo "═══════════════════════════════════════════════════════════════\n";
echo "3️⃣  VERIFICANDO CONFIGURAÇÕES\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

// Verificar .env
$envPath = __DIR__ . '/.env';
if (!file_exists($envPath)) {
    echo "❌ Arquivo .env não encontrado!\n";
    exit(1);
}

$envContent = file_get_contents($envPath);

// Verificar Gemini API Key
if (strpos($envContent, 'GEMINI_API_KEY=') === false || strpos($envContent, 'GEMINI_API_KEY=AIza') === false) {
    echo "⚠️  GEMINI_API_KEY não configurada no .env\n";
    echo "   Adicione: GEMINI_API_KEY=sua_chave_aqui\n\n";
} else {
    echo "✅ GEMINI_API_KEY configurada\n\n";
}

// Verificar APP_URL
if (strpos($envContent, 'APP_URL=http://127.0.0.1:8000') !== false) {
    echo "✅ APP_URL configurada (127.0.0.1:8000)\n\n";
} else {
    echo "⚠️  APP_URL pode não estar correta\n\n";
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "4️⃣  VERIFICANDO TABELAS NECESSÁRIAS\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$requiredTables = [
    'tenants',
    'users',
    'courses',
    'activities',
    'course_enrollments',
    'user_activities_new',
    'badges',
    'user_badges',
    'points',
    'plan_prices',
    'tenant_contracts'
];

foreach ($requiredTables as $table) {
    try {
        $count = DB::table($table)->count();
        echo "✅ {$table} ({$count} registros)\n";
    } catch (\Exception $e) {
        echo "❌ {$table} - ERRO: " . $e->getMessage() . "\n";
    }
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "5️⃣  VERIFICANDO PLANOS DISPONÍVEIS\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$plans = DB::table('plan_prices')->get();

if ($plans->count() == 0) {
    echo "⚠️  Nenhum plano cadastrado!\n";
    echo "   Criando plano TESTE...\n";

    DB::table('plan_prices')->insert([
        'name' => 'TESTE GRATUITO',
        'slug' => 'teste',
        'description' => 'Plano para testes - Grátis',
        'price' => 0.00,
        'billing_cycle' => 'monthly',
        'features' => json_encode([
            'users' => 10,
            'courses' => 5,
            'storage_gb' => 1
        ]),
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now()
    ]);

    echo "   ✅ Plano TESTE criado!\n\n";
} else {
    echo "Planos disponíveis:\n";
    foreach ($plans as $plan) {
        echo "   ✅ {$plan->name} - R$ {$plan->price}/{$plan->billing_cycle}\n";
    }
    echo "\n";
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "6️⃣  ROTAS CRÍTICAS\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$criticalRoutes = [
    'central.signup' => 'Cadastro de Tenant',
    'login' => 'Login',
    'student.courses' => 'Lista de Cursos (Aluno)',
    'student.quiz.submit' => 'Submeter Atividade',
    'eduai.upload' => 'Upload para IA'
];

foreach ($criticalRoutes as $routeName => $description) {
    try {
        $url = route($routeName, ['activity' => 1], false);
        echo "✅ {$description}\n";
        echo "   Rota: {$routeName}\n";
    } catch (\Exception $e) {
        echo "❌ {$description} - Rota não existe!\n";
    }
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "✅ AMBIENTE PREPARADO PARA TESTE REAL!\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

echo "🎯 PRÓXIMOS PASSOS:\n\n";

echo "1️⃣  CRIAR TENANT:\n";
echo "   URL: http://127.0.0.1:8000/central/signup\n";
echo "   Preencha os dados e escolha plano TESTE\n\n";

echo "2️⃣  LOGIN COMO ADMIN:\n";
echo "   URL: http://[seu-tenant].saas-gamificacao.local:8000/login\n";
echo "   Use as credenciais que recebeu no cadastro\n\n";

echo "3️⃣  CADASTRAR PROFESSOR:\n";
echo "   Vá em: Admin → Usuários → Criar Usuário\n";
echo "   Role: Instructor (Professor)\n\n";

echo "4️⃣  CADASTRAR ALUNO:\n";
echo "   Vá em: Admin → Usuários → Criar Usuário\n";
echo "   Role: Student (Aluno)\n\n";

echo "5️⃣  LOGIN COMO PROFESSOR:\n";
echo "   Acesse: EduAI → Gerar Curso\n";
echo "   Faça upload de PDF/TXT\n\n";

echo "6️⃣  LOGIN COMO ALUNO:\n";
echo "   Vá em: Cursos\n";
echo "   Matricule-se e faça as atividades\n\n";

echo "7️⃣  VERIFICAR RESULTADOS:\n";
echo "   - Pontos do aluno\n";
echo "   - Badges conquistados\n";
echo "   - Ranking\n\n";

echo "═══════════════════════════════════════════════════════════════\n";
echo "⚠️  IMPORTANTE:\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

echo "• Servidor deve estar rodando: php artisan serve\n";
echo "• Vite deve estar rodando: npm run dev\n";
echo "• Gemini API Key deve estar configurada\n";
echo "• Hosts configurados (Windows):\n";
echo "  127.0.0.1 saas-gamificacao.local\n";
echo "  127.0.0.1 *.saas-gamificacao.local\n\n";

echo "🚀 BOA SORTE NO TESTE FINAL!\n\n";
