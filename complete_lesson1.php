<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "═══════════════════════════════════════════════════════════════\n";
echo "🎯 COMPLETAR LIÇÃO 1 DO CURSO 6 MANUALMENTE\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$aluno = \App\Models\User::where('email', 'aluno@vemcomigoja5.com')->first();
$tenant = \App\Models\Tenant::where('slug', 'vemcomigoja5')->first();

// Buscar a primeira atividade do curso 6 (order = 1)
$firstActivity = DB::table('activities')
    ->where('course_id', 6)
    ->where('order', 1)
    ->first();

if (!$firstActivity) {
    echo "❌ Lição 1 do curso 6 não encontrada!\n";
    exit;
}

echo "📝 Atividade encontrada:\n";
echo "   ID: {$firstActivity->id}\n";
echo "   Título: {$firstActivity->title}\n";
echo "   Order: {$firstActivity->order}\n\n";

// Verificar se já existe UserActivity
$existingUA = DB::table('user_activities')
    ->where('user_id', $aluno->id)
    ->where('activity_id', $firstActivity->id)
    ->first();

if ($existingUA) {
    echo "ℹ️  UserActivity já existe (ID: {$existingUA->id})\n";

    // Atualizar para completada
    DB::table('user_activities')
        ->where('id', $existingUA->id)
        ->update([
            'completed_at' => now(),
            'score' => 100,
            'attempts' => 1,
            'metadata' => json_encode([
                'reading_completed' => true,
                'points_earned' => 10
            ]),
            'updated_at' => now()
        ]);

    echo "✅ UserActivity atualizada para completada!\n";
} else {
    echo "➕ Criando nova UserActivity...\n";

    // Criar UserActivity completada
    $userActivityId = DB::table('user_activities')->insertGetId([
        'user_id' => $aluno->id,
        'activity_id' => $firstActivity->id,
        'tenant_id' => $tenant->id,
        'started_at' => now(),
        'completed_at' => now(),
        'score' => 100,
        'attempts' => 1,
        'metadata' => json_encode([
            'reading_completed' => true,
            'points_earned' => 10
        ]),
        'created_at' => now(),
        'updated_at' => now()
    ]);

    echo "✅ UserActivity criada (ID: {$userActivityId})!\n";
}

// Dar pontos ao aluno
DB::table('users')
    ->where('id', $aluno->id)
    ->increment('total_points', 10);

echo "\n✅ +10 pontos adicionados ao aluno!\n";

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "🔍 VERIFICAR: Agora tente acessar a Lição 2\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

echo "URL: http://vemcomigoja5.saas-gamificacao.local:8000/student/courses/6\n";
echo "Clique na Lição 2 e veja se consegue acessar!\n";
