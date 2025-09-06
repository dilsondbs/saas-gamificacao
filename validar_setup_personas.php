<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Tenant;
use App\Models\User;
use App\Models\Course;
use App\Models\Badge;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

echo "\n=== VALIDAÇÃO DO SETUP PARA TESTES DE PERSONAS ===\n";
echo "Data: " . date('d/m/Y H:i:s') . "\n";
echo "====================================================\n\n";

// Função para verificar status
function checkStatus($condition, $message) {
    echo ($condition ? "✅" : "❌") . " " . $message . "\n";
    return $condition;
}

$allGood = true;

// 1. Verificar Central Database
echo "📊 VERIFICANDO BANCO CENTRAL:\n";
try {
    $centralConnection = DB::connection('central');
    $centralConnection->getPdo();
    checkStatus(true, "Conexão com banco central estabelecida");
    
    $tenantsCount = $centralConnection->table('tenants')->count();
    checkStatus($tenantsCount >= 0, "Tabela tenants acessível ({$tenantsCount} registros)");
    
} catch (Exception $e) {
    checkStatus(false, "Erro no banco central: " . $e->getMessage());
    $allGood = false;
}

// 2. Verificar/Criar Tenant de Teste
echo "\n🏢 VERIFICANDO TENANT DE TESTE:\n";
try {
    $testTenant = Tenant::where('slug', 'escola-exemplo')->first();
    
    if (!$testTenant) {
        echo "⚠️  Tenant 'escola-exemplo' não existe. Criando...\n";
        
        $testTenant = Tenant::create([
            'id' => 'escola-exemplo',
            'name' => 'Escola Exemplo Ltda',
            'slug' => 'escola-exemplo',
        ]);
        
        // Criar domínio
        $testTenant->domains()->create([
            'domain' => 'escola-exemplo.saas-gamificacao.local',
            'is_primary' => true,
        ]);
        
        checkStatus(true, "Tenant 'escola-exemplo' criado com sucesso");
    } else {
        checkStatus(true, "Tenant 'escola-exemplo' já existe");
    }
    
} catch (Exception $e) {
    checkStatus(false, "Erro ao criar/verificar tenant: " . $e->getMessage());
    $allGood = false;
}

// 3. Inicializar contexto do tenant e verificar banco
if ($testTenant) {
    echo "\n🔄 INICIALIZANDO CONTEXTO DO TENANT:\n";
    try {
        tenancy()->initialize($testTenant);
        checkStatus(true, "Contexto do tenant inicializado");
        
        // Verificar conexão tenant
        $tenantConnection = DB::connection('mysql');
        $tenantConnection->getPdo();
        checkStatus(true, "Conexão com banco do tenant estabelecida");
        
        // Verificar tabelas principais
        $tables = ['users', 'courses', 'activities', 'badges', 'points'];
        foreach ($tables as $table) {
            try {
                $count = DB::table($table)->count();
                checkStatus(true, "Tabela '{$table}' acessível ({$count} registros)");
            } catch (Exception $e) {
                checkStatus(false, "Erro na tabela '{$table}': " . $e->getMessage());
                $allGood = false;
            }
        }
        
    } catch (Exception $e) {
        checkStatus(false, "Erro ao inicializar tenant: " . $e->getMessage());
        $allGood = false;
    }
}

// 4. Verificar/Criar Usuários de Teste
echo "\n👥 VERIFICANDO USUÁRIOS DE TESTE:\n";

$testUsers = [
    [
        'name' => 'Admin Tenant',
        'email' => 'admin@escola-exemplo.com',
        'role' => 'admin',
        'password' => 'admin123'
    ],
    [
        'name' => 'Professor João Santos',
        'email' => 'joao@escola-exemplo.com', 
        'role' => 'instructor',
        'password' => 'professor123'
    ],
    [
        'name' => 'Ana Silva',
        'email' => 'ana@escola-exemplo.com',
        'role' => 'student',
        'password' => 'aluno123'
    ],
    [
        'name' => 'Pedro Costa',
        'email' => 'pedro@escola-exemplo.com',
        'role' => 'student', 
        'password' => 'aluno123'
    ],
    [
        'name' => 'Carla Lima',
        'email' => 'carla@escola-exemplo.com',
        'role' => 'student',
        'password' => 'aluno123'
    ]
];

foreach ($testUsers as $userData) {
    try {
        $existingUser = User::where('email', $userData['email'])->first();
        
        if (!$existingUser) {
            User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'email_verified_at' => now(),
                'password' => Hash::make($userData['password']),
                'role' => $userData['role'],
                'total_points' => 0,
            ]);
            checkStatus(true, "Usuário {$userData['role']} criado: {$userData['email']}");
        } else {
            checkStatus(true, "Usuário {$userData['role']} já existe: {$userData['email']}");
        }
    } catch (Exception $e) {
        checkStatus(false, "Erro ao criar usuário {$userData['email']}: " . $e->getMessage());
        $allGood = false;
    }
}

// 5. Verificar/Criar Badges do Sistema
echo "\n🏆 VERIFICANDO BADGES DO SISTEMA:\n";

$systemBadges = [
    [
        'name' => 'Primeira Atividade',
        'description' => 'Complete sua primeira atividade',
        'icon' => '🎯',
        'color' => '#10B981',
        'type' => 'completion',
        'criteria' => json_encode(['activities_completed' => 1]),
        'points_value' => 10,
    ],
    [
        'name' => 'Estudante Dedicado',
        'description' => 'Complete 3 atividades',
        'icon' => '📚',
        'color' => '#3B82F6',
        'type' => 'completion',
        'criteria' => json_encode(['activities_completed' => 3]),
        'points_value' => 30,
    ],
    [
        'name' => 'Expert',
        'description' => 'Acumule 100 pontos',
        'icon' => '⭐',
        'color' => '#F59E0B',
        'type' => 'points',
        'criteria' => json_encode(['total_points' => 100]),
        'points_value' => 50,
    ],
    [
        'name' => 'Curso Completo',
        'description' => 'Complete 100% de um curso',
        'icon' => '🏆',
        'color' => '#8B5CF6',
        'type' => 'completion',
        'criteria' => json_encode(['course_completion' => 100]),
        'points_value' => 100,
    ]
];

foreach ($systemBadges as $badgeData) {
    try {
        $existingBadge = Badge::where('name', $badgeData['name'])->first();
        
        if (!$existingBadge) {
            Badge::create($badgeData);
            checkStatus(true, "Badge criado: {$badgeData['icon']} {$badgeData['name']}");
        } else {
            checkStatus(true, "Badge já existe: {$badgeData['icon']} {$badgeData['name']}");
        }
    } catch (Exception $e) {
        checkStatus(false, "Erro ao criar badge {$badgeData['name']}: " . $e->getMessage());
        $allGood = false;
    }
}

// 6. Gerar Resumo dos Dados
echo "\n📊 RESUMO DOS DADOS DISPONÍVEIS:\n";
try {
    $usersCount = User::count();
    $adminCount = User::where('role', 'admin')->count();
    $instructorCount = User::where('role', 'instructor')->count();  
    $studentCount = User::where('role', 'student')->count();
    $coursesCount = Course::count();
    $badgesCount = Badge::count();
    
    echo "• Usuários totais: {$usersCount}\n";
    echo "  - Admins: {$adminCount}\n";
    echo "  - Instructors: {$instructorCount}\n";
    echo "  - Students: {$studentCount}\n";
    echo "• Cursos: {$coursesCount}\n";
    echo "• Badges: {$badgesCount}\n";
    
} catch (Exception $e) {
    echo "❌ Erro ao gerar resumo: " . $e->getMessage() . "\n";
}

// 7. Informações de Acesso
echo "\n🔗 INFORMAÇÕES DE ACESSO PARA TESTES:\n";
echo "====================================================\n";
echo "Central Admin: http://127.0.0.1:8080\n";
echo "  Email: admin@saas-gamificacao.com\n";
echo "  Senha: admin123\n\n";

echo "Tenant: http://escola-exemplo.saas-gamificacao.local:8080\n";
echo "  Admin: admin@escola-exemplo.com / admin123\n";
echo "  Instructor: joao@escola-exemplo.com / professor123\n";
echo "  Student 1: ana@escola-exemplo.com / aluno123\n";
echo "  Student 2: pedro@escola-exemplo.com / aluno123\n";
echo "  Student 3: carla@escola-exemplo.com / aluno123\n\n";

// 8. Comandos Úteis
echo "🛠️  COMANDOS ÚTEIS:\n";
echo "====================================================\n";
echo "Iniciar servidor: php artisan serve --host=127.0.0.1 --port=8080\n";
echo "Executar testes: ./executar_testes_personas.bat\n";
echo "Avaliação UX: abrir avaliacao_ux_personas.html\n";
echo "Documentação: abrir ROTEIRO_TESTE_PERSONAS.md\n\n";

// 9. Status Final
if ($allGood) {
    echo "🎉 SETUP VALIDADO COM SUCESSO!\n";
    echo "O ambiente está pronto para os testes de personas.\n";
} else {
    echo "⚠️  PROBLEMAS ENCONTRADOS NO SETUP!\n";
    echo "Verifique os erros acima antes de executar os testes.\n";
}

tenancy()->end();

echo "\n====================================================\n";
echo "Validação concluída em " . date('d/m/Y H:i:s') . "\n";

?>