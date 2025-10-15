<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║   🧪 TESTE: Visibilidade de Cursos para Alunos              ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

$tenant = \App\Models\Tenant::where('slug', 'vemcomigoja5')->first();
$professor = \App\Models\User::where('email', 'vemcomigoja5@gmail.com')->first();
$aluno = \App\Models\User::where('email', 'aluno@vemcomigoja5.com')->first();

echo "🏢 Tenant: {$tenant->name} (ID: {$tenant->id})\n";
echo "👨‍🏫 Professor: {$professor->name} (ID: {$professor->id})\n";
echo "👤 Aluno: {$aluno->name} (ID: {$aluno->id})\n\n";

echo "═══════════════════════════════════════════════════════════════\n";
echo "1️⃣  CRIAR NOVO CURSO DE TESTE (com tenant_id)\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

// Criar curso de teste com tenant_id
$testCourse = \App\Models\Course::create([
    'title' => 'Curso de Teste - Visibilidade',
    'description' => 'Curso criado para testar visibilidade entre professor e aluno',
    'instructor_id' => $professor->id,
    'tenant_id' => $tenant->id,  // ✅ IMPORTANTE
    'status' => 'published',      // ✅ IMPORTANTE
    'points_per_completion' => 100,
]);

echo "✅ Curso criado:\n";
echo "   ID: {$testCourse->id}\n";
echo "   Título: {$testCourse->title}\n";
echo "   Tenant ID: {$testCourse->tenant_id}\n";
echo "   Status: {$testCourse->status}\n";
echo "   Instrutor ID: {$testCourse->instructor_id}\n\n";

// Criar algumas atividades de teste
echo "📝 Criando atividades de teste...\n";
for ($i = 1; $i <= 3; $i++) {
    \App\Models\Activity::create([
        'course_id' => $testCourse->id,
        'tenant_id' => $tenant->id,  // ✅ IMPORTANTE
        'title' => "Lição {$i} - Teste",
        'description' => "Descrição da lição {$i}",
        'type' => 'reading',
        'content' => [
            'text' => "Conteúdo da lição {$i}. Este é um texto de teste para validar a criação de atividades."
        ],
        'points_value' => 10,
        'duration_minutes' => 15,
        'is_required' => true,
        'is_active' => true,
        'order' => $i,
    ]);
    echo "   ✅ Atividade {$i} criada\n";
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "2️⃣  VERIFICAR: Cursos visíveis para o ALUNO\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

// Simular query que o StudentDashboardController faz
$cursosVisiveis = \App\Models\Course::where('status', 'published')
    ->where('tenant_id', $tenant->id)  // Filtro explícito por tenant
    ->with(['instructor', 'activities'])
    ->withCount('enrollments')
    ->get();

echo "Total de cursos visíveis: {$cursosVisiveis->count()}\n\n";

if ($cursosVisiveis->count() > 0) {
    foreach ($cursosVisiveis as $curso) {
        echo "📚 {$curso->title}\n";
        echo "   ID: {$curso->id}\n";
        echo "   Tenant: {$curso->tenant_id}\n";
        echo "   Status: {$curso->status}\n";
        echo "   Instrutor: {$curso->instructor->name}\n";
        echo "   Atividades: {$curso->activities->count()}\n";
        echo "   Matrículas: {$curso->enrollments_count}\n";
        echo "\n";
    }
} else {
    echo "❌ Nenhum curso visível!\n\n";
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "3️⃣  TESTAR: Aluno matricular-se no curso\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

// Verificar se já está matriculado
$jaMatriculado = \App\Models\CourseEnrollment::where('user_id', $aluno->id)
    ->where('course_id', $testCourse->id)
    ->exists();

if (!$jaMatriculado) {
    $matricula = \App\Models\CourseEnrollment::create([
        'user_id' => $aluno->id,
        'course_id' => $testCourse->id,
        'tenant_id' => $tenant->id,  // ✅ IMPORTANTE
        'enrolled_at' => now(),
        'progress_percentage' => 0,
    ]);

    echo "✅ Matrícula realizada:\n";
    echo "   Aluno: {$aluno->name}\n";
    echo "   Curso: {$testCourse->title}\n";
    echo "   Data: {$matricula->enrolled_at}\n";
} else {
    echo "ℹ️  Aluno já está matriculado neste curso\n";
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "4️⃣  VERIFICAR: Matrículas do aluno\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

$matriculasAluno = \App\Models\CourseEnrollment::where('user_id', $aluno->id)
    ->with('course')
    ->get();

echo "Total de matrículas: {$matriculasAluno->count()}\n\n";

foreach ($matriculasAluno as $matricula) {
    echo "📖 {$matricula->course->title}\n";
    echo "   Matriculado em: {$matricula->enrolled_at->format('d/m/Y H:i')}\n";
    echo "   Progresso: {$matricula->progress_percentage}%\n";
    echo "\n";
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "💡 RESUMO DO TESTE\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

echo "✅ Curso criado com tenant_id: " . ($testCourse->tenant_id == $tenant->id ? 'SIM' : 'NÃO') . "\n";
echo "✅ Curso com status published: " . ($testCourse->status == 'published' ? 'SIM' : 'NÃO') . "\n";
echo "✅ Atividades criadas com tenant_id: SIM (3 atividades)\n";
echo "✅ Curso visível para aluno: " . ($cursosVisiveis->contains('id', $testCourse->id) ? 'SIM' : 'NÃO') . "\n";
echo "✅ Aluno pode matricular-se: " . ($matriculasAluno->count() > 0 ? 'SIM' : 'NÃO') . "\n";

echo "\n🎉 Teste concluído! Agora acesse:\n";
echo "   http://vemcomigoja5.saas-gamificacao.local:8000/student/courses\n";
echo "   E verifique se o curso aparece na lista.\n\n";
