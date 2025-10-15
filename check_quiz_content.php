<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFICANDO ESTRUTURA DE QUIZ ===\n\n";

// Buscar última activity do tipo quiz
$activity = App\Models\Activity::where('type', 'quiz')->latest()->first();

if ($activity) {
    echo "Activity ID: {$activity->id}\n";
    echo "Title: {$activity->title}\n";
    echo "Type: {$activity->type}\n";
    echo "\nContent Structure:\n";
    echo json_encode($activity->content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    echo "\n\n";

    // Verificar se tem questions
    if (isset($activity->content['questions'])) {
        echo "✅ TEM QUESTIONS NO CONTENT\n";
        echo "Total de questions: " . count($activity->content['questions']) . "\n";
    } else {
        echo "❌ NÃO TEM QUESTIONS NO CONTENT\n";
        echo "Keys disponíveis: " . implode(', ', array_keys($activity->content ?? [])) . "\n";
    }
} else {
    echo "❌ Nenhuma activity com type='quiz' encontrada\n";
}

echo "\n=== FIM DA VERIFICAÇÃO ===\n";
