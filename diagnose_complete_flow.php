<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║   🔍 DIAGNÓSTICO COMPLETO: Fluxo de Curso → Conclusão       ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

$tenant = \App\Models\Tenant::where('slug', 'vemcomigoja5')->first();

echo "═══════════════════════════════════════════════════════════════\n";
echo "1️⃣  USUÁRIOS DO TENANT\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$users = DB::table('users')
    ->where('tenant_id', $tenant->id)
    ->get(['id', 'name', 'email', 'role']);

foreach ($users as $user) {
    echo "👤 {$user->name}\n";
    echo "   Email: {$user->email}\n";
    echo "   Role: {$user->role}\n";

    // Testar senha
    $userModel = \App\Models\User::find($user->id);
    $testeAluno123 = \Hash::check('aluno123', $userModel->password);
    $testeSenha123 = \Hash::check('senha123', $userModel->password);
    $testeTemporary123 = \Hash::check('temporary123', $userModel->password);

    echo "   Senha 'aluno123': " . ($testeAluno123 ? "✅ CORRETA" : "❌") . "\n";
    echo "   Senha 'senha123': " . ($testeSenha123 ? "✅ CORRETA" : "❌") . "\n";
    echo "   Senha 'temporary123': " . ($testeTemporary123 ? "✅ CORRETA" : "❌") . "\n";
    echo "\n";
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "2️⃣  CURSOS PUBLICADOS\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$courses = DB::table('courses')
    ->where('tenant_id', $tenant->id)
    ->where('status', 'published')
    ->get();

echo "Total: " . $courses->count() . " cursos publicados\n\n";

foreach ($courses as $course) {
    echo "📚 Curso ID: {$course->id} - {$course->title}\n";

    // Contar atividades
    $activities = DB::table('activities')
        ->where('course_id', $course->id)
        ->orderBy('order')
        ->get(['id', 'title', 'type', 'order', 'is_active']);

    echo "   Atividades: " . $activities->count() . "\n";

    foreach ($activities as $act) {
        $isActive = $act->is_active ? "✅" : "❌";
        echo "      {$isActive} [{$act->order}] {$act->title} ({$act->type}) - ID: {$act->id}\n";
    }

    echo "\n";
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "3️⃣  MATRÍCULAS DO ALUNO\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$aluno = DB::table('users')
    ->where('tenant_id', $tenant->id)
    ->where('email', 'aluno@vemcomigoja5.com')
    ->first();

if ($aluno) {
    $enrollments = DB::table('course_enrollments')
        ->where('user_id', $aluno->id)
        ->get();

    echo "Aluno: {$aluno->name} (ID: {$aluno->id})\n";
    echo "Total de matrículas: " . $enrollments->count() . "\n\n";

    foreach ($enrollments as $enroll) {
        $course = DB::table('courses')->where('id', $enroll->course_id)->first();
        echo "📖 Curso: {$course->title} (ID: {$course->id})\n";
        echo "   Progresso: {$enroll->progress_percentage}%\n";

        // Buscar atividades completadas
        $completedActivities = DB::table('user_activities')
            ->where('user_id', $aluno->id)
            ->whereNotNull('completed_at')
            ->whereIn('activity_id', function($query) use ($course) {
                $query->select('id')
                    ->from('activities')
                    ->where('course_id', $course->id);
            })
            ->count();

        $totalActivities = DB::table('activities')
            ->where('course_id', $course->id)
            ->count();

        echo "   Atividades completadas: {$completedActivities}/{$totalActivities}\n\n";
    }
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "4️⃣  ATIVIDADES DO ALUNO (user_activities)\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

if ($aluno) {
    $userActivities = DB::table('user_activities')
        ->where('user_id', $aluno->id)
        ->get();

    echo "Total: " . $userActivities->count() . " registros\n\n";

    foreach ($userActivities as $ua) {
        $activity = DB::table('activities')->where('id', $ua->activity_id)->first();
        $status = $ua->completed_at ? "✅ COMPLETADA" : "⏳ EM PROGRESSO";

        echo "{$status} - {$activity->title}\n";
        echo "   Activity ID: {$ua->activity_id}\n";
        echo "   Score: " . ($ua->score ?? 'NULL') . "\n";
        echo "   Completada em: " . ($ua->completed_at ?? 'NULL') . "\n";
        echo "   Tentativas: {$ua->attempts}\n";
        echo "\n";
    }
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "5️⃣  ROTAS CRÍTICAS (verificação)\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

echo "📍 Rotas student.quiz.submit existe? ";
try {
    $route = route('student.quiz.submit', 1);
    echo "✅ SIM\n";
    echo "   URL: {$route}\n";
} catch (\Exception $e) {
    echo "❌ NÃO\n";
    echo "   Erro: {$e->getMessage()}\n";
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "💡 DIAGNÓSTICO FINAL\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$problems = [];

// Verificar problemas
if ($courses->count() == 0) {
    $problems[] = "❌ Nenhum curso publicado no tenant";
}

if ($aluno) {
    $alunoModel = \App\Models\User::find($aluno->id);
    if (!\Hash::check('aluno123', $alunoModel->password)) {
        $problems[] = "❌ Senha do aluno não é 'aluno123'";
    }
}

foreach ($courses as $course) {
    $acts = DB::table('activities')->where('course_id', $course->id)->count();
    if ($acts == 0) {
        $problems[] = "❌ Curso '{$course->title}' sem atividades";
    }
}

if (empty($problems)) {
    echo "✅ Sistema aparenta estar configurado corretamente!\n\n";
    echo "🎯 PRÓXIMOS PASSOS:\n";
    echo "   1. Login: aluno@vemcomigoja5.com / aluno123\n";
    echo "   2. Acesse: http://vemcomigoja5.saas-gamificacao.local:8000/student/courses\n";
    echo "   3. Clique em um curso\n";
    echo "   4. Clique em 'Iniciar Leitura'\n";
    echo "   5. AGUARDE 20 segundos (barra de progresso)\n";
    echo "   6. Clique em 'Finalizar e Ganhar X Pontos'\n";
} else {
    echo "⚠️  PROBLEMAS ENCONTRADOS:\n\n";
    foreach ($problems as $problem) {
        echo "   {$problem}\n";
    }
}

echo "\n";
