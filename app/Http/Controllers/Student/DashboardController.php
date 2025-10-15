<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserBadge;
use App\Models\CourseEnrollment;
use App\Models\Course;
use App\Models\Activity;
use App\Models\UserActivity;
use App\Models\Point;
use App\Services\TenantContextService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Calcular estatísticas do usuário
        $userStats = $this->calculateUserStats($user);
        
        // Buscar top 5 estudantes
        $topStudents = $this->getTopStudents();
        
        // Buscar atividades recentes (simuladas por enquanto)
        $recentActivities = $this->getRecentActivities($user);
        
        return Inertia::render('Student/Dashboard', [
            'auth' => [
                'user' => $user
            ],
            'stats' => $userStats,
            'topStudents' => $topStudents,
            'recentActivities' => $recentActivities
        ]);
    }
    
    public function courses()
    {
        $user = auth()->user();

        // Verificar se usuário está logado
        if (!$user) {
            return redirect()->route('login')->with('error', 'Você precisa estar logado para acessar esta página.');
        }

        // CORREÇÃO CRÍTICA: Buscar cursos disponíveis APENAS do tenant atual
        // O global scope do BelongsToTenant já filtra automaticamente por tenant_id
        $availableCourses = Course::where('status', 'published')
            ->with(['instructor', 'activities'])
            ->withCount('enrollments')
            ->get();

        // Buscar cursos do usuário
        $enrolledCourseIds = CourseEnrollment::where('user_id', $user->id)
            ->pluck('course_id')
            ->toArray();
        
        return Inertia::render('Student/Courses', [
            'auth' => ['user' => $user],
            'courses' => $availableCourses,
            'enrolledCourseIds' => $enrolledCourseIds
        ]);
    }
    
    public function showCourse(Course $course)
    {
        $user = auth()->user();

        // Verificar se o usuário está matriculado
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('student.courses')->with('error', 'Você precisa estar matriculado neste curso.');
        }

        // Rest of the method...
        return $this->showCourseInternal($course, $user, $enrollment);
    }

    public function showCourseById($id)
    {
        $user = auth()->user();

        // Verificar se usuário está logado
        if (!$user) {
            return redirect()->route('login')->with('error', 'Você precisa estar logado.');
        }

        // Buscar course por ID
        $course = Course::find($id);
        if (!$course) {
            return redirect()->route('student.courses')->with('error', 'Curso não encontrado.');
        }

        // Verificar se o usuário está matriculado
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('student.courses')->with('error', 'Você precisa estar matriculado neste curso.');
        }

        return $this->showCourseInternal($course, $user, $enrollment);
    }

    private function showCourseInternal($course, $user, $enrollment)
    {
        // Buscar atividades do curso ordenadas por ordem
        $activities = $course->activities()
            ->orderBy('order')
            ->get()
            ->map(function ($activity) use ($user) {
                // Buscar progresso do usuário para cada atividade
                $userActivity = UserActivity::where('user_id', $user->id)
                    ->where('activity_id', $activity->id)
                    ->first();
                
                return [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'description' => $activity->description,
                    'type' => $activity->type,
                    'points_value' => $activity->points_value,
                    'duration_minutes' => $activity->duration_minutes,
                    'order' => $activity->order,
                    'is_completed' => $userActivity ? $userActivity->isCompleted() : false,
                    'score' => $userActivity ? $userActivity->score : null,
                    'attempts' => $userActivity ? $userActivity->attempts : 0,
                    'started_at' => $userActivity ? $userActivity->started_at : null,
                    'completed_at' => $userActivity ? $userActivity->completed_at : null,
                    'can_access' => $this->canAccessActivity($activity, $user),
                ];
            });
        
        // Calcular progresso geral do curso
        $totalActivities = $activities->count();
        $completedActivities = $activities->where('is_completed', true)->count();
        $progressPercentage = $totalActivities > 0 ? ($completedActivities / $totalActivities) * 100 : 0;
        
        return Inertia::render('Student/Course', [
            'auth' => ['user' => $user],
            'course' => $course->load('instructor'),
            'activities' => $activities,
            'enrollment' => $enrollment,
            'progress' => [
                'percentage' => round($progressPercentage, 1),
                'completed' => $completedActivities,
                'total' => $totalActivities
            ]
        ]);
    }
    
    private function canAccessActivity($activity, $user)
    {
        // ✅ PERMITIR REVISÃO: Se a atividade já foi completada, sempre permitir acesso
        $currentUserActivity = UserActivity::where('user_id', $user->id)
            ->where('activity_id', $activity->id)
            ->whereNotNull('completed_at')
            ->first();

        if ($currentUserActivity) {
            \Log::info('✅ Controller: Atividade já completada - ACESSO LIBERADO para revisão', [
                'activity_id' => $activity->id,
                'user_id' => $user->id
            ]);
            return true;
        }

        // Se for a primeira atividade, sempre pode acessar
        if ($activity->order <= 1) {
            return true;
        }

        // Buscar a atividade anterior
        $previousActivity = Activity::where('course_id', $activity->course_id)
            ->where('order', '<', $activity->order)
            ->orderBy('order', 'desc')
            ->first();

        if (!$previousActivity) {
            return true; // Se não há atividade anterior, pode acessar
        }

        // Verificar se completou a atividade anterior
        $previousUserActivity = UserActivity::where('user_id', $user->id)
            ->where('activity_id', $previousActivity->id)
            ->first();

        return $previousUserActivity && $previousUserActivity->isCompleted();
    }
    
    private function calculateUserStats($user)
    {
        // Contar badges do usuário
        $badgesCount = UserBadge::where('user_id', $user->id)->count();
        
        // Contar cursos ativos (matrículas)
        $activeCourses = CourseEnrollment::where('user_id', $user->id)->count();
        
        // Calcular posição no ranking
        $rankPosition = User::where('role', 'student')
            ->where('total_points', '>', $user->total_points)
            ->count() + 1;
        
        // Calcular atividades completadas
        $completedActivities = UserActivity::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();
        
        // Calcular total de atividades nos cursos matriculados
        $totalActivitiesInEnrolledCourses = 0;
        $enrolledCourses = CourseEnrollment::where('user_id', $user->id)->with('course')->get();
        foreach ($enrolledCourses as $enrollment) {
            $totalActivitiesInEnrolledCourses += $enrollment->course->activities->count();
        }
        
        // Calcular progresso geral
        $overallProgress = $totalActivitiesInEnrolledCourses > 0 
            ? ($completedActivities / $totalActivitiesInEnrolledCourses) * 100 
            : 0;
        
        // Calcular streak (dias consecutivos) - simulado por enquanto
        $streak = $this->calculateStreak($user);
        
        // Calcular tempo total estudando (baseado em atividades completadas)
        $studyTime = $this->calculateStudyTime($user);
            
        return [
            'totalPoints' => $user->total_points,
            'badgesCount' => $badgesCount,
            'activeCourses' => $activeCourses,
            'rankPosition' => $rankPosition,
            'completedActivities' => $completedActivities,
            'totalActivities' => $totalActivitiesInEnrolledCourses,
            'overallProgress' => round($overallProgress, 1),
            'streak' => $streak,
            'studyTime' => $studyTime
        ];
    }
    
    private function calculateStreak($user)
    {
        // Calcular dias consecutivos de atividade
        $recentActivities = UserActivity::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->orderBy('completed_at', 'desc')
            ->get();
            
        if ($recentActivities->count() === 0) {
            return 0;
        }
        
        $streak = 0;
        $currentDate = now()->startOfDay();
        
        // Agrupar por data
        $activitiesByDate = $recentActivities->groupBy(function($activity) {
            return $activity->completed_at->format('Y-m-d');
        });
        
        // Contar dias consecutivos a partir de hoje
        while ($activitiesByDate->has($currentDate->format('Y-m-d'))) {
            $streak++;
            $currentDate->subDay();
        }
        
        return $streak;
    }
    
    private function calculateStudyTime($user)
    {
        // Estimar tempo baseado nas atividades completadas
        $completedActivities = UserActivity::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->with('activity')
            ->get();
            
        $totalMinutes = $completedActivities->sum(function($userActivity) {
            return $userActivity->activity->duration_minutes ?? 30; // Default 30 min se não especificado
        });
        
        $hours = intval($totalMinutes / 60);
        $minutes = $totalMinutes % 60;
        
        if ($hours === 0 && $minutes === 0) {
            return '0min';
        } elseif ($hours === 0) {
            return $minutes . 'min';
        } else {
            return $hours . 'h ' . $minutes . 'min';
        }
    }
    
    private function getTopStudents()
    {
        // CORREÇÃO CRÍTICA: Top students APENAS do tenant atual
        // O global scope do BelongsToTenant já filtra automaticamente por tenant_id
        return User::where('role', 'student')
            ->orderBy('total_points', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'total_points']);
    }
    
    private function getRecentActivities($user)
    {
        $activities = [];
        
        // Atividades completadas recentemente
        $recentCompletions = UserActivity::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->with('activity')
            ->orderBy('completed_at', 'desc')
            ->limit(3)
            ->get();
            
        foreach ($recentCompletions as $userActivity) {
            $activities[] = [
                'type' => 'points',
                'description' => "Completou: {$userActivity->activity->title}",
                'date' => $userActivity->completed_at->diffForHumans(),
                'points' => $userActivity->activity->points_value
            ];
        }
        
        // Badges conquistados recentemente
        $recentBadges = UserBadge::where('user_id', $user->id)
            ->with('badge')
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();
            
        foreach ($recentBadges as $userBadge) {
            $activities[] = [
                'type' => 'badge',
                'description' => "Conquistou badge: {$userBadge->badge->name}",
                'date' => $userBadge->created_at->diffForHumans(),
                'points' => $userBadge->badge->points_value
            ];
        }
        
        // Matrículas em cursos
        $recentEnrollments = CourseEnrollment::where('user_id', $user->id)
            ->with('course')
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();
            
        foreach ($recentEnrollments as $enrollment) {
            $activities[] = [
                'type' => 'course',
                'description' => "Matriculou-se em: {$enrollment->course->title}",
                'date' => $enrollment->created_at->diffForHumans(),
                'points' => 0
            ];
        }
        
        // Ordenar por data mais recente e limitar a 5
        usort($activities, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        // Se não tem atividades, mostrar mensagem motivacional
        if (empty($activities)) {
            return [
                [
                    'type' => 'course',
                    'description' => 'Bem-vindo! Comece sua jornada de aprendizado',
                    'date' => 'Agora',
                    'points' => 0
                ]
            ];
        }
        
        return array_slice($activities, 0, 5);
    }
    
    public function enrollCourse(Course $course)
    {
        $user = auth()->user();

        // Check if already enrolled
        if (CourseEnrollment::where('user_id', $user->id)->where('course_id', $course->id)->exists()) {
            return back()->with('error', 'Você já está matriculado neste curso.');
        }

        // Create enrollment with tenant_id
        CourseEnrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'tenant_id' => $user->tenant_id, // ✅ IMPORTANTE: associar com tenant
            'enrolled_at' => now(),
            'progress_percentage' => 0,
        ]);

        return redirect()->route('student.courses')->with('success', 'Matrícula realizada com sucesso!');
    }
    
    public function showActivity(Activity $activity)
    {
        return $this->showActivityInternal($activity);
    }

    public function showActivityById($id)
    {
        $activity = Activity::find($id);
        if (!$activity) {
            return redirect()->route('student.courses')->with('error', 'Atividade não encontrada.');
        }
        return $this->showActivityInternal($activity);
    }

    private function showActivityInternal($activity)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Você precisa estar logado.');
        }

        // Verificar se o usuário está matriculado no curso
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $activity->course_id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('student.courses')->with('error', 'Você precisa estar matriculado no curso para acessar esta atividade.');
        }
        
        // Verificar se pode acessar a atividade (sistema de progressão)
        if (!$this->canAccessActivity($activity, $user)) {
            return redirect()->route('student.courses.show', $activity->course_id)
                ->with('error', 'Você precisa completar as atividades anteriores para acessar esta.');
        }
        
        // Buscar ou criar UserActivity
        $userActivity = UserActivity::firstOrCreate([
            'user_id' => $user->id,
            'activity_id' => $activity->id,
        ], [
            'tenant_id' => $user->tenant_id, // ✅ IMPORTANTE: associar com tenant
            'started_at' => now(),
            'attempts' => 0,
        ]);
        
        // Redirecionar para página específica do tipo de atividade
        switch ($activity->type) {
            case 'quiz':
                return $this->showQuiz($activity, $user, $userActivity);
            case 'reading':
            case 'lesson':
                return $this->showReading($activity, $user, $userActivity);
            case 'assignment':
                return $this->showAssignment($activity, $user, $userActivity);
            default:
                return $this->showQuiz($activity, $user, $userActivity); // Fallback para quiz
        }
    }
    
    private function showQuiz(Activity $activity, $user, $userActivity)
    {
        // ✅ CORREÇÃO: Buscar questions do quiz
        // Decodificar content se for string JSON
        $content = is_string($activity->content) ? json_decode($activity->content, true) : $activity->content;
        $content = $content ?? []; // Garantir que não seja null

        $questions = [];

        if (isset($content['quiz_id'])) {
            // Arquitetura 2: Quiz na tabela separada
            $quiz = \App\Models\Quiz::with('questions')->find($content['quiz_id']);
            if ($quiz && $quiz->questions->count() > 0) {
                // Converter questions do banco para o formato esperado pelo frontend
                $questions = $quiz->questions->map(function($q) {
                    return [
                        'question' => $q->question,
                        'options' => $q->options ?? [],
                        'correct' => $this->convertAnswerToIndex($q->correct_answer),
                        'explanation' => $q->explanation ?? null
                    ];
                })->toArray();
            }
        } elseif (isset($content['questions'])) {
            // Arquitetura 1: Questions no JSON content
            // Normalizar formato: converter correct_answer para correct (índice numérico)
            $questions = array_map(function($q) {
                if (isset($q['correct_answer']) && !isset($q['correct'])) {
                    $q['correct'] = $this->convertAnswerToIndex($q['correct_answer']);
                }
                return $q;
            }, $content['questions']);
        }

        // Preparar dados da activity para o frontend
        $activityData = $activity->toArray();

        // Garantir que content seja array antes de atribuir questions
        if (is_string($activityData['content'])) {
            $activityData['content'] = json_decode($activityData['content'], true) ?? [];
        }

        $activityData['content']['questions'] = $questions;

        return Inertia::render('Student/Quiz', [
            'auth' => ['user' => $user],
            'activity' => $activityData,
            'course' => $activity->course,
            'userActivity' => $userActivity,
            'hasCompleted' => $userActivity->isCompleted()
        ]);
    }
    
    private function showReading(Activity $activity, $user, $userActivity)
    {
        // Preparar dados da activity para o frontend
        $activityData = $activity->toArray();

        // Decodificar content se for string JSON
        if (is_string($activityData['content'])) {
            $decoded = json_decode($activityData['content'], true);

            // Se o content interno também é string, decodificar HTML entities e stripslashes
            if (isset($decoded['content']) && is_string($decoded['content'])) {
                $decoded['content'] = html_entity_decode(stripslashes($decoded['content']), ENT_QUOTES, 'UTF-8');
            }

            $activityData['content'] = $decoded ?? [];
        }

        return Inertia::render('Student/Reading', [
            'auth' => ['user' => $user],
            'activity' => $activityData,  // ✅ Passa array preparado
            'course' => $activity->course,
            'userActivity' => $userActivity,
            'hasCompleted' => $userActivity->isCompleted()
        ]);
    }
    
    private function showAssignment(Activity $activity, $user, $userActivity)
    {
        return Inertia::render('Student/Assignment', [
            'auth' => ['user' => $user],
            'activity' => $activity,
            'course' => $activity->course,
            'userActivity' => $userActivity,
            'hasCompleted' => $userActivity->isCompleted()
        ]);
    }
    
    public function submitQuiz(Request $request, Activity $activity)
    {
        return $this->submitQuizInternal($request, $activity);
    }

    public function submitQuizById(Request $request, $id)
    {
        $activity = Activity::find($id);
        if (!$activity) {
            return redirect()->back()->with('error', 'Atividade não encontrada.');
        }
        return $this->submitQuizInternal($request, $activity);
    }

    private function submitQuizInternal(Request $request, Activity $activity)
    {
        $user = auth()->user();

        \Log::info('🎯 submitQuizInternal INICIADO', [
            'activity_id' => $activity->id,
            'activity_type' => $activity->type,
            'user_id' => $user?->id
        ]);

        if (!$user) {
            return redirect()->route('login')->with('error', 'Você precisa estar logado.');
        }

        // Buscar UserActivity
        $userActivity = UserActivity::where('user_id', $user->id)
            ->where('activity_id', $activity->id)
            ->first();

        // Forçar refresh do banco para evitar cache
        if ($userActivity) {
            $userActivity = $userActivity->fresh();
        }

        if (!$userActivity) {
            return redirect()->back()->with('error', 'Atividade não encontrada.');
        }

        \Log::info('📋 UserActivity encontrada', [
            'user_activity_id' => $userActivity->id,
            'is_completed' => $userActivity->isCompleted()
        ]);

        // Se já completou, não permitir nova submissão
        if ($userActivity->isCompleted()) {
            return redirect()->back()->with('error', 'Você já completou esta atividade.');
        }

        \Log::info('🔀 Entrando no switch', [
            'activity_type' => $activity->type,
            'vai_processar' => 'processQuizSubmission'
        ]);

        // Processar baseado no tipo de atividade
        switch ($activity->type) {
            case 'quiz':
                return $this->processQuizSubmission($request, $activity, $userActivity, $user);
            case 'reading':
            case 'lesson':
                return $this->processReadingSubmission($request, $activity, $userActivity, $user);
            case 'assignment':
                return $this->processAssignmentSubmission($request, $activity, $userActivity, $user);
            default:
                return $this->processQuizSubmission($request, $activity, $userActivity, $user);
        }
    }
    
    private function processQuizSubmission($request, $activity, $userActivity, $user)
    {
        \Log::info('🎯 processQuizSubmission INICIADO', [
            'activity_id' => $activity->id,
            'user_id' => $user->id,
            'request_data' => $request->all()
        ]);

        $request->validate([
            'answers' => 'required|array',
        ]);

        // Calcular pontuação
        // Decodificar content se for string JSON
        $content = is_string($activity->content) ? json_decode($activity->content, true) : $activity->content;
        $questions = $content['questions'] ?? [];

        // Normalizar questões: converter correct_answer para correct
        $questions = array_map(function($q) {
            if (isset($q['correct_answer']) && !isset($q['correct'])) {
                $q['correct'] = $this->convertAnswerToIndex($q['correct_answer']);
            }
            return $q;
        }, $questions);

        $answers = $request->answers;
        $score = 0;
        $totalQuestions = count($questions);

        \Log::info('🔍 Debug Quiz Submission', [
            'total_questions' => count($questions),
            'answers_received' => $answers,
            'first_question_structure' => $questions[0] ?? null
        ]);

        $detailedResults = [];
        foreach ($questions as $index => $question) {
            $userAnswer = $answers[$index] ?? null;
            $isCorrect = isset($answers[$index]) && $answers[$index] == $question['correct'];

            if ($isCorrect) {
                $score++;
            }

            $detailedResults[] = [
                'question' => $question['question'],
                'user_answer' => $userAnswer,
                'correct_answer' => $question['correct'],
                'is_correct' => $isCorrect,
                'explanation' => $question['explanation'] ?? null
            ];
        }
        
        // Calcular pontos (baseado na porcentagem de acertos)
        $percentage = $totalQuestions > 0 ? ($score / $totalQuestions) * 100 : 0;
        $pointsEarned = $percentage >= 70 ? $activity->points_value : 0; // Mínimo 70% para ganhar pontos
        
        // Atualizar UserActivity
        $userActivity->update([
            'completed_at' => now(),
            'score' => $percentage,  // ✅ USAR PERCENTUAL ao invés de número absoluto
            'attempts' => $userActivity->attempts + 1,
            'metadata' => [
                'answers' => $answers,
                'total_questions' => $totalQuestions,
                'percentage' => $percentage,
                'points_earned' => $pointsEarned
            ]
        ]);
        
        // Dar pontos ao usuário se passou
        if ($pointsEarned > 0) {
            $user->increment('total_points', $pointsEarned);

            try {
                Point::create([
                    'user_id' => $user->id,
                    'points' => $pointsEarned,
                    'source_type' => Activity::class,
                    'source_id' => $activity->id,
                    'description' => "Quiz completado: {$activity->title} ({$percentage}% de acertos)"
                ]);
            } catch (\Exception $e) {
                // Falha silenciosa se modelo Point não existir
            }

            // ✨ VERIFICAR E CONCEDER BADGES AUTOMATICAMENTE
            try {
                $badgeService = new \App\Services\BadgeService();
                $badgesAwarded = $badgeService->checkAndAwardBadges($user);

                if ($badgesAwarded > 0) {
                    session()->flash('badges_awarded', $badgesAwarded);
                }
            } catch (\Exception $e) {
                \Log::error('Erro ao verificar badges: ' . $e->getMessage());
            }
        }
        
        return redirect()->route('student.courses.show', $activity->course_id)->with([
            'success' => $pointsEarned > 0
                ? "Parabéns! Você ganhou {$pointsEarned} pontos!"
                : "Quiz completado! Você precisa de pelo menos 70% para ganhar pontos.",
            'quiz_result' => [
                'score' => $score,
                'total' => $totalQuestions,
                'percentage' => $percentage,
                'points_earned' => $pointsEarned,
                'detailed_results' => $detailedResults
            ]
        ]);
    }
    
    private function processReadingSubmission($request, $activity, $userActivity, $user)
    {
        // Leitura sempre ganha pontos completos se completada
        $pointsEarned = $activity->points_value;
        
        $userActivity->update([
            'completed_at' => now(),
            'score' => 1, // Completou a leitura
            'attempts' => $userActivity->attempts + 1,
            'metadata' => [
                'reading_completed' => true,
                'time_spent' => $request->time_spent ?? 0,
                'points_earned' => $pointsEarned
            ]
        ]);
        
        // Dar pontos ao usuário
        $user->increment('total_points', $pointsEarned);

        try {
            Point::create([
                'user_id' => $user->id,
                'points' => $pointsEarned,
                'source_type' => Activity::class,
                'source_id' => $activity->id,
                'description' => "Leitura completada: {$activity->title}"
            ]);
        } catch (\Exception $e) {
            // Falha silenciosa se modelo Point não existir
        }

        // ✨ VERIFICAR E CONCEDER BADGES AUTOMATICAMENTE
        try {
            $badgeService = new \App\Services\BadgeService();
            $badgesAwarded = $badgeService->checkAndAwardBadges($user);

            if ($badgesAwarded > 0) {
                session()->flash('badges_awarded', $badgesAwarded);
            }
        } catch (\Exception $e) {
            \Log::error('Erro ao verificar badges: ' . $e->getMessage());
        }
        
        return redirect()->route('student.activities.show', $activity)->with([
            'success' => "Parabéns! Você ganhou {$pointsEarned} pontos pela leitura!"
        ]);
    }
    
    private function processAssignmentSubmission($request, $activity, $userActivity, $user)
    {
        $request->validate([
            'assignment_text' => 'required|string|min:50',
        ]);
        
        // Exercício sempre ganha pontos completos se enviado
        $pointsEarned = $activity->points_value;
        
        $userActivity->update([
            'completed_at' => now(),
            'score' => 1, // Completou o exercício
            'attempts' => $userActivity->attempts + 1,
            'metadata' => [
                'assignment_text' => $request->assignment_text,
                'assignment_completed' => true,
                'time_spent' => $request->time_spent ?? 0,
                'points_earned' => $pointsEarned
            ]
        ]);
        
        // Dar pontos ao usuário
        $user->increment('total_points', $pointsEarned);
        
        try {
            Point::create([
                'user_id' => $user->id,
                'points' => $pointsEarned,
                'source_type' => Activity::class,
                'source_id' => $activity->id,
                'description' => "Exercício completado: {$activity->title}"
            ]);
        } catch (\Exception $e) {
            // Falha silenciosa se modelo Point não existir
        }
        
        return redirect()->route('student.activities.show', $activity)->with([
            'success' => "Excelente! Você ganhou {$pointsEarned} pontos pelo exercício!"
        ]);
    }
    
    public function leaderboard()
    {
        $user = auth()->user();
        
        // Buscar top estudantes
        $topStudents = User::where('role', 'student')
            ->orderBy('total_points', 'desc')
            ->get(['id', 'name', 'total_points']);
            
        // Buscar posição do usuário atual
        $userPosition = User::where('role', 'student')
            ->where('total_points', '>', $user->total_points)
            ->count() + 1;
            
        // Estatísticas gerais
        $stats = [
            'totalStudents' => User::where('role', 'student')->count(),
            'averagePoints' => User::where('role', 'student')->avg('total_points'),
            'topScore' => User::where('role', 'student')->max('total_points'),
        ];
        
        return Inertia::render('Student/Leaderboard', [
            'auth' => ['user' => $user],
            'topStudents' => $topStudents,
            'userPosition' => $userPosition,
            'stats' => $stats
        ]);
    }
    
    public function badges()
    {
        $user = auth()->user();
        
        // Buscar badges do usuário conquistadas
        $userBadges = UserBadge::where('user_id', $user->id)
            ->with('badge')
            ->get();
            
        // Buscar todos os badges disponíveis e ativos
        $availableBadges = \App\Models\Badge::where('is_active', true)->get();
        
        // Calcular progresso para cada badge
        $progressBadges = $availableBadges->map(function($badge) use ($user, $userBadges) {
            $isCompleted = $userBadges->where('badge_id', $badge->id)->count() > 0;
            $progress = 0;
            $target = 1;
            
            if ($badge->criteria) {
                $criteriaType = $badge->criteria['type'] ?? null;
                $targetValue = $badge->criteria['target_value'] ?? 1;
                $target = $targetValue;
                
                switch ($criteriaType) {
                    case 'points':
                        $progress = $user->total_points;
                        break;
                    case 'completion':
                        $progress = UserActivity::where('user_id', $user->id)
                            ->whereNotNull('completed_at')
                            ->count();
                        break;
                    case 'streak':
                        // Implementar cálculo de streak futuramente
                        $progress = 0;
                        break;
                    default:
                        $progress = 0;
                        break;
                }
            }
            
            return [
                'id' => $badge->id,
                'name' => $badge->name,
                'description' => $badge->description,
                'icon' => $badge->icon ?: '🏅',
                'criteria' => $badge->criteria,
                'color' => $badge->color,
                'type' => $badge->type,
                'points_value' => $badge->points_value,
                'progress' => $progress,
                'target' => $target,
                'completed' => $isCompleted
            ];
        });
        
        return Inertia::render('Student/Badges', [
            'auth' => ['user' => $user],
            'userBadges' => $userBadges,
            'availableBadges' => $availableBadges,
            'progressBadges' => $progressBadges
        ]);
    }

    /**
     * Converte resposta (letra ou número) para índice numérico
     */
    private function convertAnswerToIndex($answer)
    {
        // Se já for número, retorna como int
        if (is_numeric($answer)) {
            return (int)$answer;
        }

        // Se for letra (A, B, C, D), converte para índice (0, 1, 2, 3)
        $letter = strtoupper(trim($answer));
        return ord($letter) - ord('A'); // A=0, B=1, C=2, D=3
    }
}
