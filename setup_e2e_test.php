<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Tenant;
use App\Models\Course;
use App\Models\Activity;
use App\Models\Badge;
use Illuminate\Support\Facades\Hash;

echo "=== SETUP E2E TEST - FLUXO ADMIN→INSTRUCTOR→STUDENT ===\n";

// Verificar tenant existente
$tenant = Tenant::where('slug', 'empresa-teste')->first();

if (!$tenant) {
    echo "❌ Tenant 'empresa-teste' não encontrado!\n";
    exit;
}

echo "✅ Tenant: {$tenant->name} (ID: {$tenant->id})\n";
echo "✅ Domínio: " . $tenant->domains->first()?->domain . "\n";

// Inicializar contexto do tenant
tenancy()->initialize($tenant);

echo "\n=== VERIFICANDO ESTADO ATUAL DO TENANT ===\n";
echo "Usuários: " . User::count() . "\n";
echo "Cursos: " . Course::count() . "\n";
echo "Atividades: " . Activity::count() . "\n";
echo "Badges: " . Badge::count() . "\n";

// Limpar dados existentes para teste limpo
echo "\n=== LIMPANDO DADOS PARA TESTE LIMPO ===\n";

// Desabilitar verificação de chave estrangeira temporariamente
\Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');

try {
    // Limpar tabelas na ordem correta
    \Illuminate\Support\Facades\DB::table('user_activities')->truncate();
    \Illuminate\Support\Facades\DB::table('user_badges')->truncate();
    \Illuminate\Support\Facades\DB::table('course_enrollments')->truncate();
    \Illuminate\Support\Facades\DB::table('course_materials')->truncate();
    \Illuminate\Support\Facades\DB::table('points')->truncate();
    Activity::truncate();
    Course::truncate();
    Badge::truncate();
    
    // Manter apenas usuários admin
    User::where('role', '!=', 'admin')->delete();
    
} finally {
    // Reabilitar verificação de chave estrangeira
    \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');
}

echo "✅ Dados de teste limpos\n";

// Criar usuário instructor
$instructor = User::create([
    'name' => 'Professor João Silva',
    'email' => 'instructor@empresa-teste.com',
    'email_verified_at' => now(),
    'password' => Hash::make('instructor123'),
    'role' => 'instructor',
    'total_points' => 0,
]);

echo "✅ Instructor criado: {$instructor->name} ({$instructor->email})\n";
echo "   Senha: instructor123\n";

// Criar usuário student  
$student = User::create([
    'name' => 'Maria Aluna Santos',
    'email' => 'student@empresa-teste.com',
    'email_verified_at' => now(),
    'password' => Hash::make('student123'),
    'role' => 'student',
    'total_points' => 0,
]);

echo "✅ Student criado: {$student->name} ({$student->email})\n";
echo "   Senha: student123\n";

// Criar badges básicos do sistema
$badges = [
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
];

foreach ($badges as $badgeData) {
    Badge::create($badgeData);
}

echo "✅ " . count($badges) . " badges criados\n";

tenancy()->end();

echo "\n=== CENÁRIO DE TESTE PREPARADO ===\n";
echo "🏢 Tenant: empresa-teste.localhost:8080\n";
echo "👨‍💼 Admin: admin@empresa-teste.com / admin123\n";
echo "👨‍🏫 Instructor: instructor@empresa-teste.com / instructor123\n";
echo "👩‍🎓 Student: student@empresa-teste.com / student123\n";
echo "🏆 Badges: " . count($badges) . " badges configurados\n";

echo "\n🚀 CENÁRIO PRONTO PARA TESTE E2E!\n";