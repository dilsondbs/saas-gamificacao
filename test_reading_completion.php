<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║   🧪 TESTE: Simular Conclusão de Leitura                    ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Fazer login como aluno
$aluno = \App\Models\User::where('email', 'aluno@vemcomigoja5.com')->first();

echo "👤 Aluno: {$aluno->name} (ID: {$aluno->id})\n\n";

// Buscar primeira atividade disponível do curso 6
$activity = DB::table('activities')
    ->where('course_id', 6)
    ->where('order', 2)  // Lição 2
    ->first();

if (!$activity) {
    echo "❌ Lição 2 do curso 6 não encontrada!\n";
    echo "Buscando qualquer atividade...\n";

    $activity = DB::table('activities')
        ->where('course_id', 6)
        ->orderBy('order')
        ->skip(1)
        ->first();
}

if (!$activity) {
    echo "❌ Nenhuma atividade encontrada no curso 6!\n";
    exit;
}

// Converter para model (sem global scope)
$activity = \App\Models\Activity::withoutGlobalScopes()->find($activity->id);

echo "📝 Atividade: {$activity->title} (ID: {$activity->id})\n";
echo "   Curso: {$activity->course_id}\n";
echo "   Tipo: {$activity->type}\n";
echo "   Order: {$activity->order}\n\n";

// Simular autenticação
\Auth::login($aluno);

echo "═══════════════════════════════════════════════════════════════\n";
echo "🔄 TESTE 1: Chamar submitQuiz diretamente\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

try {
    $controller = new \App\Http\Controllers\Student\DashboardController();

    // Criar request simulado
    $request = \Illuminate\Http\Request::create(
        route('student.quiz.submit', $activity->id),
        'POST',
        [
            'answers' => [],
            'reading_completed' => true,
            'time_spent' => 30
        ]
    );

    // Adicionar usuário ao request
    $request->setUserResolver(function() use ($aluno) {
        return $aluno;
    });

    echo "📤 Chamando submitQuiz...\n";

    $response = $controller->submitQuiz($request, $activity);

    echo "✅ Resposta recebida!\n";
    echo "   Tipo: " . get_class($response) . "\n";

    if ($response instanceof \Illuminate\Http\RedirectResponse) {
        echo "   Redirect para: " . $response->getTargetUrl() . "\n";

        $session = $response->getSession();
        if ($session && $session->has('success')) {
            echo "   Mensagem: " . $session->get('success') . "\n";
        }
    }

} catch (\Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
    echo "   Arquivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\n   Stack trace:\n";
    echo "   " . str_replace("\n", "\n   ", $e->getTraceAsString()) . "\n";
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "🔍 VERIFICAR: Atividade foi registrada?\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$userActivity = \App\Models\UserActivity::where('user_id', $aluno->id)
    ->where('activity_id', $activity->id)
    ->first();

if ($userActivity) {
    echo "✅ UserActivity encontrada!\n";
    echo "   ID: {$userActivity->id}\n";
    echo "   Completada: " . ($userActivity->completed_at ? "✅ SIM" : "❌ NÃO") . "\n";
    echo "   Score: " . ($userActivity->score ?? 'NULL') . "\n";
    echo "   Completada em: " . ($userActivity->completed_at ?? 'NULL') . "\n";
} else {
    echo "❌ UserActivity NÃO foi criada!\n";
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "📊 PONTOS DO ALUNO\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$alunoAtualizado = \App\Models\User::find($aluno->id);
echo "Pontos: {$alunoAtualizado->total_points}\n";
