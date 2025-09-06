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
        
        // Buscar cursos disponíveis
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
        
        // Create enrollment
        CourseEnrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'enrolled_at' => now(),
            'progress_percentage' => 0,
        ]);
        
        return redirect()->route('student.courses')->with('success', 'Matrícula realizada com sucesso!');
    }
    
    public function showActivity(Activity $activity)
    {
        $user = auth()->user();
        
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
        return Inertia::render('Student/Quiz', [
            'auth' => ['user' => $user],
            'activity' => $activity,
            'course' => $activity->course,
            'userActivity' => $userActivity,
            'hasCompleted' => $userActivity->isCompleted()
        ]);
    }
    
    private function showReading(Activity $activity, $user, $userActivity)
    {
        return Inertia::render('Student/Reading', [
            'auth' => ['user' => $user],
            'activity' => $activity,
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
        $user = auth()->user();
        
        // Buscar UserActivity
        $userActivity = UserActivity::where('user_id', $user->id)
            ->where('activity_id', $activity->id)
            ->first();
            
        if (!$userActivity) {
            return redirect()->back()->with('error', 'Atividade não encontrada.');
        }
        
        // Se já completou, não permitir nova submissão
        if ($userActivity->isCompleted()) {
            return redirect()->back()->with('error', 'Você já completou esta atividade.');
        }

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
        $request->validate([
            'answers' => 'required|array',
        ]);
        
        // Calcular pontuação
        $questions = $activity->content['questions'] ?? [];
        $answers = $request->answers;
        $score = 0;
        $totalQuestions = count($questions);
        
        foreach ($questions as $index => $question) {
            if (isset($answers[$index]) && $answers[$index] == $question['correct']) {
                $score++;
            }
        }
        
        // Calcular pontos (baseado na porcentagem de acertos)
        $percentage = $totalQuestions > 0 ? ($score / $totalQuestions) * 100 : 0;
        $pointsEarned = $percentage >= 70 ? $activity->points_value : 0; // Mínimo 70% para ganhar pontos
        
        // Atualizar UserActivity
        $userActivity->update([
            'completed_at' => now(),
            'score' => $score,
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
        }
        
        return redirect()->route('student.activities.show', $activity)->with([
            'success' => $pointsEarned > 0 
                ? "Parabéns! Você ganhou {$pointsEarned} pontos!" 
                : "Quiz completado! Você precisa de pelo menos 70% para ganhar pontos.",
            'quiz_result' => [
                'score' => $score,
                'total' => $totalQuestions,
                'percentage' => $percentage,
                'points_earned' => $pointsEarned
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
}
