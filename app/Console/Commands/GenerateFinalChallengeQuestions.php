<?php

namespace App\Console\Commands;

use App\Models\Course;
use App\Models\FinalChallenge;
use App\Services\PythonAIService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GenerateFinalChallengeQuestions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'final-challenge:generate {course_id : ID do curso}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gera 30 questões do Desafio Final para um curso usando IA (10 easy, 10 medium, 10 hard)';

    protected PythonAIService $pythonService;

    public function __construct(PythonAIService $pythonService)
    {
        parent::__construct();
        $this->pythonService = $pythonService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $courseId = $this->argument('course_id');

        $this->info("🎯 Gerando questões do Desafio Final para o curso ID: {$courseId}");

        // Buscar o curso com seus módulos e atividades
        $course = Course::with(['modules.activities'])->find($courseId);

        if (!$course) {
            $this->error("❌ Curso não encontrado!");
            return 1;
        }

        $this->info("📚 Curso encontrado: {$course->title}");
        $this->info("📊 Módulos: {$course->modules->count()}");

        // Preparar conteúdo do curso
        $courseContent = $this->prepareCourseContent($course);
        $courseModules = $this->prepareCourseModules($course);

        $this->info("🤖 Chamando serviço de IA...");

        try {
            // Gerar questões usando o serviço Python
            $response = $this->pythonService->generateFinalChallengeQuestions(
                $course->id,
                $course->title,
                $courseContent,
                $courseModules
            );

            if (!$response['success']) {
                $this->error("❌ Erro ao gerar questões!");
                return 1;
            }

            $easyQuestions = $response['easy_questions'];
            $mediumQuestions = $response['medium_questions'];
            $hardQuestions = $response['hard_questions'];

            $this->info("✅ Questões geradas:");
            $this->line("   🟢 Fáceis: " . count($easyQuestions));
            $this->line("   🟡 Médias: " . count($mediumQuestions));
            $this->line("   🔴 Difíceis: " . count($hardQuestions));

            // Criar/atualizar os registros FinalChallenge
            $this->info("💾 Salvando questões no banco de dados...");

            // Easy level
            $this->createOrUpdateChallenge($course, 'easy', $easyQuestions);

            // Medium level
            $this->createOrUpdateChallenge($course, 'medium', $mediumQuestions);

            // Hard level
            $this->createOrUpdateChallenge($course, 'hard', $hardQuestions);

            $this->info("✅ Desafio Final criado com sucesso para o curso '{$course->title}'!");
            $this->line("🎉 Total de questões: " . (count($easyQuestions) + count($mediumQuestions) + count($hardQuestions)));

            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Erro ao gerar questões: {$e->getMessage()}");
            Log::error('GenerateFinalChallengeQuestions failed', [
                'course_id' => $courseId,
                'error' => $e->getMessage()
            ]);
            return 1;
        }
    }

    /**
     * Prepara o conteúdo do curso para enviar à IA
     */
    private function prepareCourseContent(Course $course): string
    {
        $content = "# {$course->title}\n\n";
        $content .= "{$course->description}\n\n";

        foreach ($course->modules as $module) {
            $content .= "## {$module->title}\n";
            $content .= "{$module->description}\n\n";

            foreach ($module->activities as $activity) {
                if ($activity->type === 'lesson') {
                    $content .= "### {$activity->title}\n";
                    // Remove HTML tags for cleaner content
                    $content .= strip_tags($activity->content) . "\n\n";
                }
            }
        }

        return $content;
    }

    /**
     * Prepara os módulos do curso em formato array
     */
    private function prepareCourseModules(Course $course): array
    {
        return $course->modules->map(function ($module) {
            return [
                'title' => $module->title,
                'description' => $module->description,
                'activities' => $module->activities->map(function ($activity) {
                    return [
                        'title' => $activity->title,
                        'type' => $activity->type,
                        'content' => $activity->content ?? ''
                    ];
                })->toArray()
            ];
        })->toArray();
    }

    /**
     * Cria ou atualiza um FinalChallenge com as questões
     */
    private function createOrUpdateChallenge(Course $course, string $level, array $questions): void
    {
        // Buscar ou criar o desafio para este nível
        $challenge = FinalChallenge::firstOrCreate(
            [
                'course_id' => $course->id,
                'difficulty_level' => $level,
                'tenant_id' => $course->tenant_id
            ],
            [
                'title' => "Desafio Final - Nível " . ucfirst($level),
                'time_limit_minutes' => 20,
                'min_score_percentage' => $level === 'easy' ? 60 : ($level === 'medium' ? 70 : 80),
                'content' => json_encode(['questions' => $questions])
            ]
        );

        // Se já existe, atualizar as questões
        if (!$challenge->wasRecentlyCreated) {
            $challenge->update([
                'content' => json_encode(['questions' => $questions])
            ]);
            $this->line("   ↻ {$level}: Atualizado");
        } else {
            $this->line("   ✓ {$level}: Criado");
        }
    }
}
