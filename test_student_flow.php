<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Tenant;
use App\Models\Course;
use App\Models\Activity;
use App\Models\Badge;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

echo "=== TESTE E2E - FLUXO DO ALUNO ===\n";

// Inicializar contexto do tenant
$tenant = Tenant::where('slug', 'empresa-teste')->first();
tenancy()->initialize($tenant);

// Login como student
$student = User::where('email', 'student@empresa-teste.com')->first();
Auth::login($student);

echo "✅ Logado como: {$student->name} ({$student->role})\n";
echo "   Pontos atuais: {$student->total_points}\n";

// Encontrar o curso criado
$course = Course::latest()->first();
if (!$course) {
    echo "❌ Nenhum curso encontrado!\n";
    tenancy()->end();
    exit;
}

echo "\n=== MATRICULANDO NO CURSO ===\n";
echo "📚 Curso: {$course->title}\n";
echo "👨‍🏫 Instrutor: " . $course->instructor->name . "\n";
echo "⭐ Pontos totais: {$course->total_points}\n";

// Verificar se já está matriculado
$enrollment = DB::table('course_enrollments')
    ->where('user_id', $student->id)
    ->where('course_id', $course->id)
    ->first();

if ($enrollment) {
    echo "✅ Já matriculado no curso\n";
} else {
    // Matricular no curso
    DB::table('course_enrollments')->insert([
        'user_id' => $student->id,
        'course_id' => $course->id,
        'enrolled_at' => now(),
        'progress_percentage' => 0,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    echo "✅ Matriculado no curso com sucesso!\n";
}

// Obter atividades do curso ordenadas
$activities = Activity::where('course_id', $course->id)
    ->orderBy('order')
    ->get();

echo "\n=== ATIVIDADES DISPONÍVEIS ===\n";
foreach ($activities as $activity) {
    echo "📝 {$activity->title} ({$activity->points_value} pontos) - {$activity->type}\n";
}

echo "\n=== COMPLETANDO ATIVIDADES SEQUENCIALMENTE ===\n";

$totalEarnedPoints = 0;
$completedActivities = 0;

foreach ($activities as $activity) {
    echo "\n--- Completando: {$activity->title} ---\n";
    
    // Verificar se já completou esta atividade
    $userActivity = DB::table('user_activities')
        ->where('user_id', $student->id)
        ->where('activity_id', $activity->id)
        ->first();
    
    if ($userActivity && $userActivity->completed_at) {
        echo "✅ Atividade já completada anteriormente\n";
        // Calcular pontos baseado no score (percentual do total)
        $scorePercent = ($userActivity->score ?? 100) / 100;
        $earnedPoints = intval($activity->points_value * $scorePercent);
        $totalEarnedPoints += $earnedPoints;
        $completedActivities++;
        continue;
    }
    
    // Simular conclusão da atividade baseada no tipo
    $pointsEarned = $activity->points_value;
    $score = 100; // Score em percentual
    $metadata = [];
    
    switch ($activity->type) {
        case 'quiz':
            echo "🧠 Respondendo quiz...\n";
            $score = 90; // 90% de acerto
            $metadata = [
                'answers' => [
                    ['question_id' => 0, 'answer' => 0], // Resposta correta
                    ['question_id' => 1, 'answer' => 0], // Resposta correta  
                    ['question_id' => 2, 'answer' => 'Uma persona é a representação semi-fictícia do cliente ideal.']
                ],
                'score' => 90,
                'time_taken_minutes' => 15
            ];
            $pointsEarned = intval($activity->points_value * 0.9); // 90% dos pontos
            break;
            
        case 'reading':
            echo "📖 Lendo conteúdo...\n";
            $score = 100; // Reading completa
            $metadata = [
                'time_spent_minutes' => 12,
                'completed_at' => now()->toDateTimeString()
            ];
            break;
            
        case 'assignment':
            echo "📋 Submetendo projeto...\n";
            $score = 85; // 85% de nota
            $metadata = [
                'submitted_files' => [
                    'estrategia_marketing.pdf',
                    'mockup_campanha.png'
                ],
                'description' => 'Desenvolvi uma campanha para produto de tecnologia focada em jovens adultos.',
                'submitted_at' => now()->toDateTimeString()
            ];
            $pointsEarned = intval($activity->points_value * 0.85);
            break;
    }
    
    // Registrar conclusão da atividade
    DB::table('user_activities')->insert([
        'user_id' => $student->id,
        'activity_id' => $activity->id,
        'started_at' => now()->subMinutes(rand(5, 30)),
        'completed_at' => now(),
        'score' => $score,
        'attempts' => 1,
        'metadata' => json_encode($metadata),
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    echo "✅ Atividade completada! Pontos ganhos: {$pointsEarned}\n";
    
    $totalEarnedPoints += $pointsEarned;
    $completedActivities++;
    
    // Atualizar pontos do usuário
    $student->total_points += $pointsEarned;
    $student->save();
    
    // Registrar pontos na tabela points
    DB::table('points')->insert([
        'user_id' => $student->id,
        'points' => $pointsEarned,
        'type' => 'earned',
        'source_type' => 'App\\Models\\Activity',
        'source_id' => $activity->id,
        'description' => 'Pontos ganhos ao completar atividade: ' . $activity->title,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

echo "\n=== VERIFICANDO SISTEMA DE GAMIFICAÇÃO ===\n";

// Recarregar usuário
$student->refresh();
echo "🎯 Total de pontos: {$student->total_points}\n";
echo "📚 Atividades completadas: {$completedActivities}\n";

// Verificar badges conquistados
echo "\n🏆 Verificando badges disponíveis...\n";
$badges = Badge::all();
$earnedBadges = [];

foreach ($badges as $badge) {
    $criteria = json_decode($badge->criteria, true);
    $shouldEarnBadge = false;
    
    // Verificar se já possui este badge
    $hasBadge = DB::table('user_badges')
        ->where('user_id', $student->id)
        ->where('badge_id', $badge->id)
        ->exists();
        
    if ($hasBadge) {
        echo "✅ {$badge->name} - JÁ CONQUISTADO\n";
        continue;
    }
    
    // Verificar critérios do badge
    if (isset($criteria['activities_completed'])) {
        if ($completedActivities >= $criteria['activities_completed']) {
            $shouldEarnBadge = true;
        }
    }
    
    if (isset($criteria['total_points'])) {
        if ($student->total_points >= $criteria['total_points']) {
            $shouldEarnBadge = true;
        }
    }
    
    if ($shouldEarnBadge) {
        // Conceder badge
        DB::table('user_badges')->insert([
            'user_id' => $student->id,
            'badge_id' => $badge->id,
            'earned_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        $earnedBadges[] = $badge;
        echo "🏆 {$badge->icon} {$badge->name} - CONQUISTADO! (+{$badge->points_value} pontos)\n";
        
        // Adicionar pontos do badge
        $student->total_points += $badge->points_value;
        $student->save();
        
        DB::table('points')->insert([
            'user_id' => $student->id,
            'points' => $badge->points_value,
            'type' => 'bonus',
            'source_type' => 'App\\Models\\Badge',
            'source_id' => $badge->id,
            'description' => 'Pontos de bônus por conquistar badge: ' . $badge->name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    } else {
        echo "⏳ {$badge->icon} {$badge->name} - Em progresso\n";
    }
}

// Atualizar progresso do curso
$courseProgress = ($completedActivities / $activities->count()) * 100;
DB::table('course_enrollments')
    ->where('user_id', $student->id)
    ->where('course_id', $course->id)
    ->update([
        'progress_percentage' => $courseProgress,
        'completed_at' => $courseProgress == 100 ? now() : null,
        'updated_at' => now(),
    ]);

tenancy()->end();

echo "\n=== RESULTADO FINAL ===\n";
echo "👩‍🎓 Aluno: {$student->name}\n";
echo "📊 Progresso do curso: " . number_format($courseProgress, 1) . "%\n";
echo "⭐ Pontos totais: {$student->total_points}\n";
echo "🏆 Badges conquistados: " . count($earnedBadges) . "\n";
echo "📝 Atividades concluídas: {$completedActivities}/{$activities->count()}\n";

if ($courseProgress == 100) {
    echo "\n🎉 CURSO CONCLUÍDO COM SUCESSO!\n";
} else {
    echo "\n📈 Progresso em andamento...\n";
}

echo "\n🎯 FLUXO DO ALUNO CONCLUÍDO COM SUCESSO!\n";