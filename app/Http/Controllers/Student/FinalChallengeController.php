<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Activity;
use App\Models\UserActivity;
use App\Models\FinalChallenge;
use App\Models\ChallengeAttempt;
use App\Models\ChallengeMotivation;
use App\Models\User;
use App\Services\BadgeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class FinalChallengeController extends Controller
{
    /**
     * Exibir página do Desafio Final
     */
    public function show(Course $course)
    {
        $user = auth()->user();

        // Verificar se o usuário está matriculado
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('student.courses')->with('error', 'Você precisa estar matriculado neste curso.');
        }

        // Verificar se completou 100% das atividades
        if (!$this->hasCompletedAllActivities($user, $course)) {
            return redirect()->route('student.courses.show', $course->id)
                ->with('error', 'Você precisa completar todas as atividades do curso antes de acessar o Desafio Final!');
        }

        // Buscar desafio final do curso
        $challenge = FinalChallenge::where('course_id', $course->id)
            ->active()
            ->first();

        if (!$challenge) {
            return redirect()->route('student.courses.show', $course->id)
                ->with('error', 'Este curso ainda não possui um Desafio Final configurado.');
        }

        // Buscar tentativas anteriores dos 3 níveis
        // Buscar TODOS os challenges do curso (easy, medium, hard)
        $allChallengeIds = FinalChallenge::where('course_id', $course->id)
            ->active()
            ->pluck('id');

        $attempts = ChallengeAttempt::where('user_id', $user->id)
            ->whereIn('challenge_id', $allChallengeIds)
            ->completed()
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('level');

        // Verificar status de cada nível
        $easyPassed = $attempts->get('easy', collect())->where('score', '>=', 60)->count() > 0;
        $mediumPassed = $attempts->get('medium', collect())->where('score', '>=', 70)->count() > 0;
        $hardPassed = $attempts->get('hard', collect())->where('score', '>=', 80)->count() > 0;

        $allLevelsPassed = $easyPassed && $mediumPassed && $hardPassed;

        // Buscar motivações recebidas e enviadas
        $receivedMotivations = ChallengeMotivation::receivedBy($user->id)
            ->where('course_id', $course->id)
            ->with('sender')
            ->get();

        $sentMotivations = ChallengeMotivation::sentBy($user->id)
            ->where('course_id', $course->id)
            ->with('receiver')
            ->get();

        // Buscar alunos elegíveis para enviar motivação (completaram o curso mas não o desafio)
        $eligibleStudents = [];
        if ($allLevelsPassed) {
            $eligibleStudents = User::where('role', 'student')
                ->where('id', '!=', $user->id)
                ->whereHas('enrollments', function($query) use ($course) {
                    $query->where('course_id', $course->id);
                })
                ->get(['id', 'name', 'email'])
                ->map(function($student) use ($course) {
                    $hasCompleted = $this->hasCompletedAllActivities($student, $course);
                    return [
                        'id' => $student->id,
                        'name' => $student->name,
                        'email' => $student->email,
                        'has_completed_activities' => $hasCompleted
                    ];
                })
                ->filter(function($student) {
                    return $student['has_completed_activities'];
                })
                ->values();
        }

        return Inertia::render('Student/FinalChallenge', [
            'auth' => ['user' => $user],
            'course' => $course,
            'challenge' => $challenge,
            'attempts' => [
                'easy' => $attempts->get('easy', collect())->values(),
                'medium' => $attempts->get('medium', collect())->values(),
                'hard' => $attempts->get('hard', collect())->values(),
            ],
            'progress' => [
                'easy_passed' => $easyPassed,
                'medium_passed' => $mediumPassed,
                'hard_passed' => $hardPassed,
                'all_levels_passed' => $allLevelsPassed,
            ],
            'receivedMotivations' => $receivedMotivations,
            'sentMotivations' => $sentMotivations,
            'eligibleStudents' => $eligibleStudents,
        ]);
    }

    /**
     * Iniciar tentativa de desafio
     */
    public function start(Request $request, Course $course)
    {
        try {
            $user = auth()->user();

            // Validar tenant_id do usuário
            if (!$user->tenant_id) {
                Log::error('❌ Usuário sem tenant_id', [
                    'user_id' => $user->id,
                    'method' => 'FinalChallengeController@start'
                ]);
                return response()->json([
                    'error' => 'Erro de configuração: tenant não identificado'
                ], 500);
            }

            // Validar se course pertence ao tenant
            if ($course->tenant_id !== $user->tenant_id) {
                Log::warning('⚠️ Tentativa de acesso cross-tenant', [
                    'user_id' => $user->id,
                    'user_tenant_id' => $user->tenant_id,
                    'course_id' => $course->id,
                    'course_tenant_id' => $course->tenant_id,
                    'method' => 'FinalChallengeController@start'
                ]);
                return response()->json([
                    'error' => 'Acesso negado'
                ], 403);
            }

            $request->validate([
                'level' => 'required|in:easy,medium,hard'
            ]);

            $level = $request->level;

            // Verificar se pode acessar este nível
            if (!$this->canAccessLevel($user, $course, $level)) {
                return response()->json([
                    'error' => 'Você precisa completar o nível anterior primeiro!'
                ], 403);
            }

            // Buscar desafio COM tenant_id e difficulty_level
            $challenge = FinalChallenge::where('course_id', $course->id)
                ->where('tenant_id', $user->tenant_id)
                ->where('difficulty_level', $level)
                ->active()
                ->first();

            if (!$challenge) {
                Log::warning('⚠️ Desafio não encontrado', [
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'tenant_id' => $user->tenant_id
                ]);
                return response()->json(['error' => 'Desafio não encontrado'], 404);
            }

            // Decodificar e validar content
            $content = $challenge->content;

            // Se content é string JSON, decodificar
            if (is_string($content)) {
                $content = json_decode($content, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::error('❌ Erro ao decodificar content do desafio', [
                        'challenge_id' => $challenge->id,
                        'json_error' => json_last_error_msg()
                    ]);
                    return response()->json([
                        'error' => 'Erro ao processar questões do desafio'
                    ], 500);
                }
            }

            // Garantir que content é array
            if (!is_array($content)) {
                Log::error('❌ Content do desafio não é array', [
                    'challenge_id' => $challenge->id,
                    'content_type' => gettype($content)
                ]);
                return response()->json([
                    'error' => 'Estrutura de questões inválida'
                ], 500);
            }

            // O content JÁ são as questões do nível
            $questions = $content;

            if (empty($questions)) {
                Log::warning('⚠️ Nenhuma questão para o nível', [
                    'challenge_id' => $challenge->id,
                    'level' => $level
                ]);
                return response()->json([
                    'error' => 'Nenhuma questão disponível para este nível'
                ], 404);
            }

            // Validar estrutura das questões
            if (!is_array($questions)) {
                Log::error('❌ Questões do nível não são array', [
                    'challenge_id' => $challenge->id,
                    'level' => $level,
                    'questions_type' => gettype($questions)
                ]);
                return response()->json([
                    'error' => 'Estrutura de questões inválida'
                ], 500);
            }

            // Criar tentativa COM tenant_id validado
            $attempt = ChallengeAttempt::create([
                'user_id' => $user->id,
                'challenge_id' => $challenge->id,
                'level' => $level,
                'questions' => $questions,
                'answers' => [],
                'score' => 0,
                'time_spent' => 0,
                'tenant_id' => $user->tenant_id,
            ]);

            Log::info('🎯 Desafio iniciado', [
                'user_id' => $user->id,
                'tenant_id' => $user->tenant_id,
                'course_id' => $course->id,
                'challenge_id' => $challenge->id,
                'level' => $level,
                'attempt_id' => $attempt->id,
                'questions_count' => count($questions)
            ]);

            return response()->json([
                'success' => true,
                'attempt_id' => $attempt->id,
                'questions' => $questions,
                'started_at' => now()->toIso8601String(),
                'time_limit_minutes' => $challenge->time_limit_minutes,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Re-lançar exceções de validação para que Laravel as trate normalmente
            throw $e;
        } catch (\Exception $e) {
            Log::error('❌ Erro ao iniciar desafio', [
                'user_id' => auth()->id(),
                'course_id' => $course->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Erro ao iniciar desafio. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Submeter respostas do desafio
     */
    public function submit(Request $request, Course $course)
    {
        $user = auth()->user();

        $request->validate([
            'attempt_id' => 'required|exists:challenge_attempts,id',
            'answers' => 'required|array',
            'time_spent' => 'required|integer|min:0',
        ]);

        // Buscar tentativa
        $attempt = ChallengeAttempt::where('id', $request->attempt_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$attempt) {
            return response()->json(['error' => 'Tentativa não encontrada'], 404);
        }

        if ($attempt->isCompleted()) {
            return response()->json(['error' => 'Esta tentativa já foi completada'], 400);
        }

        $challenge = $attempt->challenge;

        // Calcular pontuação
        $score = $this->calculateScore($attempt->questions, $request->answers);
        $minScore = $challenge->getMinScoreForLevel($attempt->level);

        // Atualizar tentativa
        $attempt->update([
            'answers' => $request->answers,
            'score' => $score,
            'time_spent' => $request->time_spent,
            'completed_at' => now(),
        ]);

        $passed = $score >= $minScore;

        Log::info('📊 Desafio submetido', [
            'user_id' => $user->id,
            'level' => $attempt->level,
            'score' => $score,
            'min_score' => $minScore,
            'passed' => $passed
        ]);

        // Verificar se completou todos os 3 níveis
        $easyPassed = ChallengeAttempt::where('user_id', $user->id)
            ->where('challenge_id', $challenge->id)
            ->where('level', 'easy')
            ->where('score', '>=', 60)
            ->exists();

        $mediumPassed = ChallengeAttempt::where('user_id', $user->id)
            ->where('challenge_id', $challenge->id)
            ->where('level', 'medium')
            ->where('score', '>=', 70)
            ->exists();

        $hardPassed = ChallengeAttempt::where('user_id', $user->id)
            ->where('challenge_id', $challenge->id)
            ->where('level', 'hard')
            ->where('score', '>=', 80)
            ->exists();

        $completedAllLevels = $easyPassed && $mediumPassed && $hardPassed;

        // Se completou todos os níveis, conceder badge e pontos
        if ($completedAllLevels) {
            // Dar pontos do badge (se configurado)
            if ($challenge->badge_id) {
                $badge = $challenge->badge;
                if ($badge) {
                    $user->increment('total_points', $badge->points_value);

                    try {
                        \App\Models\Point::create([
                            'user_id' => $user->id,
                            'points' => $badge->points_value,
                            'source_type' => FinalChallenge::class,
                            'source_id' => $challenge->id,
                            'description' => "Desafio Final completado: {$course->title}"
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Erro ao criar pontos: ' . $e->getMessage());
                    }
                }
            }

            // Verificar e conceder badges automaticamente
            try {
                $badgeService = app(BadgeService::class);
                $badgesAwarded = $badgeService->checkAndAwardBadges($user);

                if ($badgesAwarded > 0) {
                    Log::info('🏆 Badges concedidas após Desafio Final', [
                        'user_id' => $user->id,
                        'badges_count' => $badgesAwarded
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Erro ao verificar badges: ' . $e->getMessage());
            }

            Log::info('🎉 DESAFIO FINAL COMPLETADO!', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'all_levels_passed' => true
            ]);
        }

        return response()->json([
            'success' => true,
            'score' => $score,
            'min_score' => $minScore,
            'passed' => $passed,
            'grade' => $attempt->grade,
            'time_spent' => $attempt->formatted_time,
            'completed_all_levels' => $completedAllLevels,
            'next_level_unlocked' => $passed,
        ]);
    }

    /**
     * Enviar motivação para outros alunos
     */
    public function sendMotivation(Request $request, Course $course)
    {
        $user = auth()->user();

        $request->validate([
            'receiver_ids' => 'required|array|max:5',
            'receiver_ids.*' => 'required|exists:users,id',
            'message' => 'required|string|max:500',
        ]);

        // Verificar se completou todos os 3 níveis
        $challenge = FinalChallenge::where('course_id', $course->id)->active()->first();

        if (!$challenge) {
            return response()->json(['error' => 'Desafio não encontrado'], 404);
        }

        $easyPassed = ChallengeAttempt::where('user_id', $user->id)
            ->where('challenge_id', $challenge->id)
            ->where('level', 'easy')
            ->where('score', '>=', 60)
            ->exists();

        $mediumPassed = ChallengeAttempt::where('user_id', $user->id)
            ->where('challenge_id', $challenge->id)
            ->where('level', 'medium')
            ->where('score', '>=', 70)
            ->exists();

        $hardPassed = ChallengeAttempt::where('user_id', $user->id)
            ->where('challenge_id', $challenge->id)
            ->where('level', 'hard')
            ->where('score', '>=', 80)
            ->exists();

        if (!($easyPassed && $mediumPassed && $hardPassed)) {
            return response()->json([
                'error' => 'Você precisa completar todos os 3 níveis do desafio antes de enviar motivações'
            ], 403);
        }

        // Criar motivações
        $motivationsCreated = 0;
        foreach ($request->receiver_ids as $receiverId) {
            // Não enviar para si mesmo
            if ($receiverId == $user->id) {
                continue;
            }

            // Verificar se já enviou motivação para este aluno neste curso
            $existing = ChallengeMotivation::where('sender_id', $user->id)
                ->where('receiver_id', $receiverId)
                ->where('course_id', $course->id)
                ->exists();

            if ($existing) {
                continue;
            }

            ChallengeMotivation::create([
                'sender_id' => $user->id,
                'receiver_id' => $receiverId,
                'course_id' => $course->id,
                'message' => $request->message,
                'tenant_id' => $user->tenant_id,
            ]);

            $motivationsCreated++;
        }

        Log::info('💌 Motivações enviadas', [
            'sender_id' => $user->id,
            'course_id' => $course->id,
            'count' => $motivationsCreated
        ]);

        return response()->json([
            'success' => true,
            'message' => "Motivação enviada para {$motivationsCreated} aluno(s)!",
            'count' => $motivationsCreated
        ]);
    }

    /**
     * Confirmar motivação recebida (dobra pontos)
     */
    public function confirmMotivation(ChallengeMotivation $motivation)
    {
        $user = auth()->user();

        // Verificar se é o destinatário
        if ($motivation->receiver_id != $user->id) {
            return response()->json(['error' => 'Você não pode confirmar esta motivação'], 403);
        }

        // Verificar se já confirmou
        if ($motivation->isConfirmed()) {
            return response()->json(['error' => 'Esta motivação já foi confirmada'], 400);
        }

        // Confirmar e dobrar pontos
        $success = $motivation->confirm();

        if ($success) {
            Log::info('✅ Motivação confirmada e pontos dobrados', [
                'motivation_id' => $motivation->id,
                'receiver_id' => $user->id,
                'sender_id' => $motivation->sender_id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Motivação confirmada! Seus pontos foram dobrados! 🎉',
                'points_doubled' => true
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Motivação confirmada!',
            'points_doubled' => false
        ]);
    }

    /**
     * MÉTODOS PRIVADOS HELPER
     */

    /**
     * Verificar se completou 100% das atividades do curso
     */
    private function hasCompletedAllActivities($user, $course)
    {
        $totalActivities = Activity::where('course_id', $course->id)->count();

        if ($totalActivities === 0) {
            return false;
        }

        $completedActivities = UserActivity::where('user_id', $user->id)
            ->whereHas('activity', function($query) use ($course) {
                $query->where('course_id', $course->id);
            })
            ->whereNotNull('completed_at')
            ->count();

        return $completedActivities >= $totalActivities;
    }

    /**
     * Calcular score (percentual de acertos)
     */
    private function calculateScore($questions, $answers)
    {
        if (empty($questions)) {
            return 0;
        }

        $correct = 0;
        $total = count($questions);

        // Converter array de objetos para array associativo
        $answersMap = [];
        foreach ($answers as $answer) {
            $answersMap[$answer['question_index']] = $answer['selected'];
        }

        foreach ($questions as $index => $question) {
            $userAnswer = $answersMap[$index] ?? null;
            $correctAnswer = $question['correct_answer'] ?? null;

            if ($userAnswer !== null && $userAnswer == $correctAnswer) {
                $correct++;
            }
        }

        return $total > 0 ? round(($correct / $total) * 100, 2) : 0;
    }

    /**
     * Verificar se pode acessar determinado nível
     */
    private function canAccessLevel($user, $course, $level)
    {
        // Easy sempre pode acessar
        if ($level === 'easy') {
            return true;
        }

        // Medium precisa ter passado no Easy
        if ($level === 'medium') {
            $easyChallenge = FinalChallenge::where('course_id', $course->id)
                ->where('difficulty_level', 'easy')
                ->active()
                ->first();

            if (!$easyChallenge) {
                return false;
            }

            return ChallengeAttempt::where('user_id', $user->id)
                ->where('challenge_id', $easyChallenge->id)
                ->where('level', 'easy')
                ->where('score', '>=', 60)
                ->exists();
        }

        // Hard precisa ter passado no Medium
        if ($level === 'hard') {
            $mediumChallenge = FinalChallenge::where('course_id', $course->id)
                ->where('difficulty_level', 'medium')
                ->active()
                ->first();

            if (!$mediumChallenge) {
                return false;
            }

            return ChallengeAttempt::where('user_id', $user->id)
                ->where('challenge_id', $mediumChallenge->id)
                ->where('level', 'medium')
                ->where('score', '>=', 70)
                ->exists();
        }

        return false;
    }
}
