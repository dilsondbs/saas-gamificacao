<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "═══════════════════════════════════════════════════════════════\n";
echo "📊 CURSOS NO BANCO (via DB direto, sem global scope)\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$tenantId = '366c34dc-f74a-40a0-906e-290572ea19c3';

$courses = DB::table('courses')
    ->where('tenant_id', $tenantId)
    ->get(['id', 'title', 'status', 'tenant_id', 'instructor_id']);

echo "Total: " . $courses->count() . " cursos\n\n";

foreach ($courses as $course) {
    echo "ID: {$course->id}\n";
    echo "Título: {$course->title}\n";
    echo "Status: {$course->status}\n";
    echo "Tenant ID: {$course->tenant_id}\n";
    echo "Instructor ID: {$course->instructor_id}\n";

    // Contar atividades
    $activitiesCount = DB::table('activities')
        ->where('course_id', $course->id)
        ->count();
    echo "Atividades: {$activitiesCount}\n";
    echo "\n";
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "📝 ATIVIDADES DO CURSO 5\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$activities = DB::table('activities')
    ->where('course_id', 5)
    ->orderBy('order')
    ->get(['id', 'title', 'type', 'order', 'tenant_id']);

if ($activities->count() == 0) {
    echo "❌ Curso 5 não tem atividades!\n";
} else {
    foreach ($activities as $act) {
        echo "ID: {$act->id} | {$act->title} | Tipo: {$act->type} | Order: {$act->order} | Tenant: {$act->tenant_id}\n";
    }
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "🎯 MATRÍCULAS DO ALUNO 24\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$enrollments = DB::table('course_enrollments')
    ->where('user_id', 24)
    ->get();

echo "Total: " . $enrollments->count() . " matrículas\n\n";

foreach ($enrollments as $enroll) {
    $courseName = DB::table('courses')->where('id', $enroll->course_id)->value('title');
    echo "Curso ID: {$enroll->course_id} ({$courseName})\n";
    echo "Data: {$enroll->enrolled_at}\n";
    echo "Progresso: {$enroll->progress_percentage}%\n";
    echo "\n";
}
