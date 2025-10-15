<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$aluno = \App\Models\User::where('email', 'aluno@vemcomigoja5.com')->first();

if (!$aluno) {
    echo "Aluno não encontrado!\n";
    exit;
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "🔍 PROGRESSO DO ALUNO: {$aluno->name}\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$userActivities = \App\Models\UserActivity::where('user_id', $aluno->id)
    ->with('activity')
    ->orderBy('activity_id')
    ->get();

if ($userActivities->count() == 0) {
    echo "❌ Nenhuma atividade iniciada ainda.\n";
} else {
    foreach ($userActivities as $ua) {
        $activity = $ua->activity;
        echo "📝 {$activity->title} (ID: {$activity->id}, Order: {$activity->order})\n";
        echo "   Status: " . ($ua->completed_at ? "✅ Completada" : "⏳ Em progresso") . "\n";
        echo "   Score: " . ($ua->score ?? 'NULL') . "\n";
        echo "   Completada em: " . ($ua->completed_at ? $ua->completed_at->format('d/m/Y H:i:s') : 'NULL') . "\n";
        echo "   Tentativas: {$ua->attempts}\n";
        echo "\n";
    }
}

// Listar atividades do curso 6
echo "═══════════════════════════════════════════════════════════════\n";
echo "📚 ATIVIDADES DO CURSO 6:\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$activities = \App\Models\Activity::where('course_id', 6)
    ->orderBy('order')
    ->get();

foreach ($activities as $act) {
    echo "ID: {$act->id} | Título: {$act->title} | Tipo: {$act->type} | Order: {$act->order}\n";
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "🔓 VERIFICAÇÃO DE ACESSO:\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

foreach ($activities as $activity) {
    // Verificar se pode acessar
    $canAccess = true;

    if ($activity->order > 1) {
        // Buscar atividade anterior
        $previousActivity = \App\Models\Activity::where('course_id', 6)
            ->where('order', '<', $activity->order)
            ->orderBy('order', 'desc')
            ->first();

        if ($previousActivity) {
            $prevUserActivity = \App\Models\UserActivity::where('user_id', $aluno->id)
                ->where('activity_id', $previousActivity->id)
                ->whereNotNull('completed_at')
                ->first();

            $canAccess = !is_null($prevUserActivity);
        }
    }

    $icon = $canAccess ? "🔓" : "🔒";
    echo "{$icon} {$activity->title} (Order: {$activity->order}) - " . ($canAccess ? "PODE ACESSAR" : "BLOQUEADA") . "\n";
}
