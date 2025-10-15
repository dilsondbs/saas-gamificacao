<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Activity;
use App\Models\UserActivity;
use App\Models\CourseEnrollment;

class CheckActivityProgression
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        // Skip check if user is not authenticated
        if (!$user) {
            return $next($request);
        }

        // Get activity from route parameter
        $activityId = $request->route('activity');

        if (!$activityId) {
            return $next($request);
        }

        // Handle both Activity model and ID
        if ($activityId instanceof Activity) {
            $activity = $activityId;
        } else {
            $activity = Activity::find($activityId);
        }

        if (!$activity) {
            return $this->redirectWithError('Atividade não encontrada.');
        }

        // Check if user is enrolled in the course
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $activity->course_id)
            ->first();

        if (!$enrollment) {
            return $this->redirectWithError('Você não está matriculado neste curso.');
        }

        // Check if activity is active
        if (!$activity->is_active) {
            return $this->redirectWithError('Esta atividade não está mais disponível.');
        }

        // Skip progression check for instructors and admins
        if (in_array($user->role, ['instructor', 'admin'])) {
            return $next($request);
        }

        // Check progression requirements
        $canAccess = $this->checkProgressionRequirements($user->id, $activity);

        if (!$canAccess['canAccess']) {
            return $this->redirectWithProgressionError($activity, $canAccess);
        }

        return $next($request);
    }

    /**
     * Check if user meets progression requirements for activity
     */
    private function checkProgressionRequirements(int $userId, Activity $activity): array
    {
        \Log::info('🔒 CheckActivityProgression: Verificando acesso', [
            'user_id' => $userId,
            'activity_id' => $activity->id,
            'activity_title' => $activity->title,
            'activity_order' => $activity->order,
            'course_id' => $activity->course_id
        ]);

        // ✅ PERMITIR REVISÃO: Se a atividade já foi completada, permitir acesso
        $currentUserActivity = UserActivity::where('user_id', $userId)
            ->where('activity_id', $activity->id)
            ->whereNotNull('completed_at')
            ->first();

        if ($currentUserActivity) {
            \Log::info('🔓 Atividade já completada - ACESSO LIBERADO (Revisão)');
            return [
                'canAccess' => true,
                'reason' => 'Atividade já completada - modo revisão'
            ];
        }

        // Get all activities in the course ordered by sequence
        $courseActivities = Activity::where('course_id', $activity->course_id)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        \Log::info('🔒 Total de atividades no curso: ' . $courseActivities->count());

        // Find current activity position
        $currentPosition = $courseActivities->search(function ($item) use ($activity) {
            return $item->id === $activity->id;
        });

        \Log::info('🔒 Posição da atividade atual: ' . $currentPosition);

        // First activity is always accessible
        if ($currentPosition === 0) {
            \Log::info('🔓 Primeira atividade - ACESSO LIBERADO');
            return [
                'canAccess' => true,
                'reason' => 'Primeira atividade do curso'
            ];
        }

        // Check progress of previous activities
        $previousActivities = $courseActivities->take($currentPosition);
        $completedPrevious = 0;
        $totalPrevious = $previousActivities->count();
        $incompleteActivities = [];

        \Log::info('🔒 Verificando ' . $totalPrevious . ' atividades anteriores');

        foreach ($previousActivities as $prevActivity) {
            // BUG FIX: Para atividades de reading/lesson, score = 1 (não percentual)
            // Apenas para quiz que score é percentual (0-100)
            $minScore = ($prevActivity->type === 'quiz') ? 70 : 1;

            $userActivity = UserActivity::where('user_id', $userId)
                ->where('activity_id', $prevActivity->id)
                ->whereNotNull('completed_at')
                ->where('score', '>=', $minScore)
                ->first();

            \Log::info('🔒 Atividade anterior: ' . $prevActivity->title . ' (ID: ' . $prevActivity->id . ')', [
                'tipo' => $prevActivity->type,
                'min_score_requerido' => $minScore,
                'completada' => $userActivity ? 'SIM' : 'NÃO',
                'score' => $userActivity ? $userActivity->score : 'N/A'
            ]);

            if ($userActivity) {
                $completedPrevious++;
            } else {
                $incompleteActivities[] = [
                    'id' => $prevActivity->id,
                    'title' => $prevActivity->title,
                    'order' => $prevActivity->order
                ];
            }
        }

        $currentProgress = $totalPrevious > 0 ? round(($completedPrevious / $totalPrevious) * 100, 2) : 0;
        $requiredProgress = 70; // 70% minimum

        $canAccess = $currentProgress >= $requiredProgress;

        return [
            'canAccess' => $canAccess,
            'currentProgress' => $currentProgress,
            'requiredProgress' => $requiredProgress,
            'completedPrevious' => $completedPrevious,
            'totalPrevious' => $totalPrevious,
            'incompleteActivities' => $incompleteActivities,
            'reason' => $canAccess
                ? 'Requisitos de progressão atendidos'
                : "Você precisa completar pelo menos {$this->getRequiredPreviousActivities($totalPrevious)} das atividades anteriores com nota mínima de 70%"
        ];
    }

    /**
     * Calculate required previous activities based on 70% rule
     */
    private function getRequiredPreviousActivities(int $totalPrevious): int
    {
        return max(1, ceil($totalPrevious * 0.7));
    }

    /**
     * Redirect with error message
     */
    private function redirectWithError(string $message)
    {
        if (request()->expectsJson()) {
            return response()->json([
                'error' => $message,
                'canAccess' => false
            ], 403);
        }

        return redirect()->back()->with('error', $message);
    }

    /**
     * Redirect with progression-specific error
     */
    private function redirectWithProgressionError(Activity $activity, array $progressData)
    {
        $message = $progressData['reason'];

        if (request()->expectsJson()) {
            return response()->json([
                'error' => $message,
                'canAccess' => false,
                'progressData' => $progressData,
                'activity' => [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'course_id' => $activity->course_id
                ]
            ], 403);
        }

        // For web requests, redirect to course page with detailed progress info
        return redirect()
            ->route('student.courses.show', $activity->course_id)
            ->with('progression_error', $message)
            ->with('progress_data', $progressData)
            ->with('blocked_activity', [
                'id' => $activity->id,
                'title' => $activity->title
            ]);
    }
}