<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║   🔥 LIMPEZA COMPLETA - ZERO ABSOLUTO                       ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

echo "⚠️  ISSO VAI DELETAR **TODOS** OS DADOS!\n";
echo "    Apenas estrutura do banco será mantida.\n\n";
echo "    Pressione ENTER para continuar ou CTRL+C para cancelar...\n";
fgets(STDIN);

echo "\n🔥 Deletando TODOS os dados...\n\n";

// Desabilitar foreign key checks
DB::statement('SET FOREIGN_KEY_CHECKS=0');

$tables = [
    'user_badges',
    'user_activities',
    'user_activities_new',
    'points',
    'course_enrollments',
    'activities',
    'courses',
    'badges',
    'tenant_contracts',
    'user_invitations',
    'users',
    'tenants',
    'domains'
];

foreach ($tables as $table) {
    try {
        $count = DB::table($table)->count();
        DB::table($table)->truncate();
        echo "✅ {$table} ({$count} registros deletados)\n";
    } catch (\Exception $e) {
        echo "⚠️  {$table} - " . $e->getMessage() . "\n";
    }
}

// Reabilitar foreign key checks
DB::statement('SET FOREIGN_KEY_CHECKS=1');

echo "\n✅ BANCO COMPLETAMENTE LIMPO!\n\n";

echo "═══════════════════════════════════════════════════════════════\n";
echo "📊 VERIFICAÇÃO FINAL\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

echo "Tenants: " . DB::table('tenants')->count() . "\n";
echo "Users: " . DB::table('users')->count() . "\n";
echo "Courses: " . DB::table('courses')->count() . "\n";
echo "Activities: " . DB::table('activities')->count() . "\n";
echo "Enrollments: " . DB::table('course_enrollments')->count() . "\n\n";

echo "✅ Sistema zerado e pronto para teste!\n\n";

echo "🎯 INICIE O TESTE EM:\n";
echo "   http://127.0.0.1:8000/central/signup\n\n";
