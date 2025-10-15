<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFICANDO QUIZ_QUESTIONS ===\n\n";

// Buscar todos os quizzes
$quizzes = App\Models\Quiz::with('questions')->get();

echo "Total de Quizzes: " . $quizzes->count() . "\n\n";

foreach ($quizzes as $quiz) {
    echo "Quiz ID: {$quiz->id}\n";
    echo "Title: {$quiz->title}\n";
    echo "Lesson ID: {$quiz->lesson_id}\n";
    echo "Questions Count: " . $quiz->questions->count() . "\n";

    if ($quiz->questions->count() > 0) {
        echo "  Questions:\n";
        foreach ($quiz->questions as $q) {
            echo "    - ID: {$q->id}, Question: " . substr($q->question, 0, 50) . "...\n";
        }
    }
    echo "\n";
}

// Verificar activities
echo "\n=== VERIFICANDO ACTIVITIES ===\n\n";
$activities = App\Models\Activity::all();
echo "Total Activities: " . $activities->count() . "\n";
foreach ($activities as $act) {
    echo "  - ID: {$act->id}, Type: {$act->type}, Title: {$act->title}\n";
}

echo "\n=== FIM DA VERIFICAÇÃO ===\n";
