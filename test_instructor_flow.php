<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Tenant;
use App\Models\Course;
use App\Models\Activity;
use App\Models\CourseMaterial;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

echo "=== TESTE E2E - FLUXO DO INSTRUTOR ===\n";

// Inicializar contexto do tenant
$tenant = Tenant::where('slug', 'empresa-teste')->first();
tenancy()->initialize($tenant);

// Login como instructor
$instructor = User::where('email', 'instructor@empresa-teste.com')->first();
Auth::login($instructor);

echo "✅ Logado como: {$instructor->name} ({$instructor->role})\n";

echo "\n=== CRIANDO CURSO ===\n";

// Criar curso
$courseData = [
    'title' => 'Introdução ao Marketing Digital',
    'description' => 'Curso completo sobre fundamentos do marketing digital, estratégias de SEO, redes sociais e métricas.',
    'objectives' => 'Ao final do curso, o aluno será capaz de criar campanhas de marketing digital eficazes.',
    'duration_hours' => 20,
    'difficulty_level' => 'beginner',
    'max_students' => 50,
    'is_active' => true,
];

$course = Course::create(array_merge($courseData, [
    'instructor_id' => $instructor->id,
    'slug' => Str::slug($courseData['title']),
]));

echo "✅ Curso criado: {$course->title} (ID: {$course->id})\n";

echo "\n=== ADICIONANDO MATERIAIS ===\n";

// Adicionar materiais do curso
$materials = [
    [
        'title' => 'Introdução ao Marketing Digital - Slides',
        'original_name' => 'intro_marketing_digital.pdf',
        'file_path' => 'courses/materials/' . $course->id . '/intro_marketing_digital.pdf',
        'file_type' => 'pdf',
        'file_size' => 2048576, // 2MB
        'mime_type' => 'application/pdf',
        'file_metadata' => json_encode(['pages' => 25, 'description' => 'Apresentação com conceitos fundamentais']),
    ],
    [
        'title' => 'Vídeo: Estratégias de SEO',
        'original_name' => 'seo_strategies.mp4',
        'file_path' => 'courses/materials/' . $course->id . '/seo_strategies.mp4',
        'file_type' => 'video',
        'file_size' => 15728640, // 15MB
        'mime_type' => 'video/mp4',
        'file_metadata' => json_encode(['duration_minutes' => 12, 'description' => 'Vídeo explicativo sobre técnicas de SEO']),
    ],
];

foreach ($materials as $materialData) {
    $material = CourseMaterial::create(array_merge($materialData, [
        'course_id' => $course->id,
        'instructor_id' => $instructor->id,
        'uploaded_by' => $instructor->id,
        'is_active' => true,
    ]));
    echo "✅ Material adicionado: {$material->title}\n";
}

echo "\n=== CRIANDO ATIVIDADES ===\n";

// Atividade 1: Quiz
$quizActivity = Activity::create([
    'course_id' => $course->id,
    'title' => 'Quiz: Fundamentos do Marketing Digital',
    'description' => 'Teste seus conhecimentos sobre os conceitos básicos',
    'type' => 'quiz',
    'content' => json_encode([
        'questions' => [
            [
                'question' => 'O que significa SEO?',
                'type' => 'multiple_choice',
                'options' => [
                    'Search Engine Optimization',
                    'Social Engine Optimization',
                    'Search Email Optimization',
                    'Social Email Organization'
                ],
                'correct_answer' => 0,
                'points' => 10
            ],
            [
                'question' => 'Quais são os principais benefícios do marketing digital?',
                'type' => 'multiple_choice',
                'options' => [
                    'Baixo custo e alta segmentação',
                    'Apenas baixo custo',
                    'Apenas alta segmentação',
                    'Nenhum benefício específico'
                ],
                'correct_answer' => 0,
                'points' => 10
            ],
            [
                'question' => 'Como você definiria uma persona de marketing?',
                'type' => 'text',
                'points' => 20
            ]
        ],
        'max_attempts' => 3,
        'time_limit_minutes' => 30
    ]),
    'points_value' => 40,
    'duration_minutes' => 30,
    'order' => 1,
    'is_required' => true,
]);

echo "✅ Quiz criado: {$quizActivity->title} (40 pontos)\n";

// Atividade 2: Reading
$readingActivity = Activity::create([
    'course_id' => $course->id,
    'title' => 'Leitura: Estratégias de Redes Sociais',
    'description' => 'Leia o artigo sobre as melhores práticas em redes sociais',
    'type' => 'reading',
    'content' => json_encode([
        'article_title' => 'As 10 Estratégias Mais Eficazes para Redes Sociais',
        'content' => 'Este artigo aborda as principais estratégias para maximizar o engajamento em redes sociais...',
        'estimated_time_minutes' => 15,
        'external_url' => 'https://exemplo.com/artigo-redes-sociais'
    ]),
    'points_value' => 20,
    'duration_minutes' => 15,
    'order' => 2,
    'is_required' => true,
]);

echo "✅ Reading criado: {$readingActivity->title} (20 pontos)\n";

// Atividade 3: Assignment
$assignmentActivity = Activity::create([
    'course_id' => $course->id,
    'title' => 'Projeto: Criar Campanha de Marketing',
    'description' => 'Desenvolva uma campanha completa de marketing digital para um produto à sua escolha',
    'type' => 'assignment',
    'content' => json_encode([
        'instructions' => 'Crie uma campanha de marketing digital completa incluindo: 1) Definição do público-alvo, 2) Estratégia de conteúdo, 3) Canais de distribuição, 4) Métricas de sucesso',
        'deliverables' => [
            'Documento PDF com a estratégia (máximo 5 páginas)',
            'Exemplos visuais da campanha (imagens/mockups)'
        ],
        'evaluation_criteria' => [
            'Clareza da estratégia (25%)',
            'Criatividade (25%)',
            'Viabilidade (25%)',
            'Apresentação (25%)'
        ],
        'max_file_size_mb' => 10,
        'due_date' => now()->addDays(7)->toDateTimeString()
    ]),
    'points_value' => 60,
    'duration_minutes' => 120, // 2 horas estimadas
    'order' => 3,
    'is_required' => true,
]);

echo "✅ Assignment criado: {$assignmentActivity->title} (60 pontos)\n";

// Verificar total de pontos do curso
$totalPoints = Activity::where('course_id', $course->id)->sum('points_value');
echo "\n📊 Total de pontos do curso: {$totalPoints}\n";

// Atualizar curso com total de pontos
$course->update(['total_points' => $totalPoints]);

tenancy()->end();

echo "\n=== RESUMO DO CURSO CRIADO ===\n";
echo "🎓 Curso: {$course->title}\n";
echo "👨‍🏫 Instrutor: {$instructor->name}\n";
echo "📚 Materiais: " . count($materials) . " arquivos\n";
echo "📝 Atividades: 3 (Quiz, Reading, Assignment)\n";
echo "⭐ Pontos totais: {$totalPoints}\n";
echo "🌐 URL do curso: http://empresa-teste.localhost:8080/instructor/courses/{$course->id}\n";

echo "\n🎯 FLUXO DO INSTRUTOR CONCLUÍDO COM SUCESSO!\n";