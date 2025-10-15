<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Course;
use App\Models\Activity;
use App\Models\UserActivity;
use App\Models\CourseEnrollment;
use App\Http\Requests\ProgressCheckRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProgressController extends Controller
{
    /**
     * Minimum progress percentage required to unlock next activities
     */
    const MINIMUM_PROGRESS_PERCENTAGE = 70;

    /**
     * Check if user can access a specific activity
     */
    public function checkActivityAccess(Activity $activity): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'canAccess' => false,
                'reason' => 'Usuário não autenticado'
            ], 401);
        }

        // Check if user is enrolled in the course
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $activity->course_id)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'canAccess' => false,
                'reason' => 'Você não está matriculado neste curso'
            ], 403);
        }

        // Check if activity is active
        if (!$activity->is_active) {
            return response()->json([
                'canAccess' => false,
                'reason' => 'Esta atividade não está mais disponível'
            ], 403);
        }

        // Check progression requirements
        $progressData = $this->checkProgressionRequirements($user->id, $activity);

        return response()->json([
            'canAccess' => $progressData['canAccess'],
            'reason' => $progressData['reason'],
            'currentProgress' => $progressData['currentProgress'],
            'requiredProgress' => self::MINIMUM_PROGRESS_PERCENTAGE,
            'previousActivities' => $progressData['previousActivities'],
            'nextActivity' => $progressData['nextActivity']
        ]);
    }

    /**
     * Check course progression for a user
     */
    public function checkCourseProgression(Course $course): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return response()->json(['error' => 'Not enrolled in this course'], 403);
        }

        $progressData = $this->calculateCourseProgress($user->id, $course);

        return response()->json([
            'courseProgress' => $progressData,
            'unlockedActivities' => $this->getUnlockedActivities($user->id, $course),
            'lockedActivities' => $this->getLockedActivities($user->id, $course),
            'nextRecommendation' => $this->getNextRecommendedActivity($user->id, $course)
        ]);
    }

    /**
     * Attempt to unlock next activity after completing current one
     */
    public function completeActivity(Request $request, Activity $activity): JsonResponse
    {
        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:100',
            'time_spent' => 'nullable|integer|min:0',
            'metadata' => 'nullable|array'
        ]);

        $user = Auth::user();

        try {
            DB::beginTransaction();

            // Find or create user activity record
            $userActivity = UserActivity::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'activity_id' => $activity->id
                ],
                [
                    'started_at' => now(),
                    'score' => $validated['score'],
                    'attempts' => 1,
                    'metadata' => $validated['metadata'] ?? []
                ]
            );

            // Update completion if score meets minimum requirement
            if ($validated['score'] >= self::MINIMUM_PROGRESS_PERCENTAGE) {
                $userActivity->markAsCompleted($validated['score']);

                // Update attempts if it was a retry
                if ($userActivity->attempts > 1) {
                    $userActivity->increment('attempts');
                }

                // Check and unlock next activities
                $unlockResult = $this->checkAndUnlockNextActivities($user->id, $activity);

                // Update course progress
                $this->updateCourseProgress($user->id, $activity->course_id);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Atividade concluída com sucesso!',
                    'score' => $validated['score'],
                    'unlockedActivities' => $unlockResult['unlockedActivities'],
                    'courseProgress' => $unlockResult['courseProgress'],
                    'badges' => $unlockResult['newBadges'] ?? [],
                    'nextRecommendation' => $this->getNextRecommendedActivity($user->id, $activity->course)
                ]);
            } else {
                // Score too low, allow retry
                $userActivity->update([
                    'score' => $validated['score'],
                    'metadata' => array_merge($userActivity->metadata ?? [], [
                        'last_attempt' => now(),
                        'attempts' => $userActivity->attempts + 1
                    ])
                ]);
                $userActivity->increment('attempts');

                DB::commit();

                return response()->json([
                    'success' => false,
                    'canRetry' => true,
                    'message' => "Pontuação insuficiente. Você precisa de pelo menos " . self::MINIMUM_PROGRESS_PERCENTAGE . "% para avançar.",
                    'score' => $validated['score'],
                    'requiredScore' => self::MINIMUM_PROGRESS_PERCENTAGE,
                    'attempts' => $userActivity->attempts,
                    'encouragementMessage' => $this->getEncouragementMessage($userActivity->attempts)
                ]);
            }

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erro ao processar atividade. Tente novamente.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get user's overall progress across all enrolled courses
     */
    public function getUserOverallProgress(): JsonResponse
    {
        $user = Auth::user();

        $enrollments = CourseEnrollment::where('user_id', $user->id)
            ->with(['course.activities'])
            ->get();

        $overallStats = [
            'totalCourses' => $enrollments->count(),
            'completedCourses' => $enrollments->where('completed_at', '!=', null)->count(),
            'totalActivities' => 0,
            'completedActivities' => 0,
            'totalPoints' => 0,
            'averageProgress' => 0,
            'courses' => []
        ];

        foreach ($enrollments as $enrollment) {
            $courseProgress = $this->calculateCourseProgress($user->id, $enrollment->course);
            $overallStats['courses'][] = $courseProgress;
            $overallStats['totalActivities'] += $courseProgress['totalActivities'];
            $overallStats['completedActivities'] += $courseProgress['completedActivities'];
            $overallStats['totalPoints'] += $courseProgress['pointsEarned'];
        }

        if ($overallStats['totalActivities'] > 0) {
            $overallStats['averageProgress'] = round(
                ($overallStats['completedActivities'] / $overallStats['totalActivities']) * 100,
                2
            );
        }

        return response()->json($overallStats);
    }

    /**
     * Check progression requirements for an activity
     */
    private function checkProgressionRequirements(int $userId, Activity $activity): array
    {
        // Get all activities in the course ordered by sequence
        $courseActivities = Activity::where('course_id', $activity->course_id)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        // Find current activity position
        $currentPosition = $courseActivities->search(function ($item) use ($activity) {
            return $item->id === $activity->id;
        });

        // First activity is always accessible
        if ($currentPosition === 0) {
            return [
                'canAccess' => true,
                'reason' => 'Primeira atividade do curso',
                'currentProgress' => 100,
                'previousActivities' => [],
                'nextActivity' => $courseActivities->get($currentPosition + 1) ?? null
            ];
        }

        // Check progress of previous activities
        $previousActivities = $courseActivities->take($currentPosition);
        $completedPrevious = 0;
        $totalPrevious = $previousActivities->count();

        foreach ($previousActivities as $prevActivity) {
            $userActivity = UserActivity::where('user_id', $userId)
                ->where('activity_id', $prevActivity->id)
                ->whereNotNull('completed_at')
                ->where('score', '>=', self::MINIMUM_PROGRESS_PERCENTAGE)
                ->first();

            if ($userActivity) {
                $completedPrevious++;
            }
        }

        $currentProgress = $totalPrevious > 0 ? round(($completedPrevious / $totalPrevious) * 100, 2) : 0;
        $canAccess = $currentProgress >= self::MINIMUM_PROGRESS_PERCENTAGE;

        return [
            'canAccess' => $canAccess,
            'reason' => $canAccess
                ? 'Requisitos de progressão atendidos'
                : "Você precisa completar pelo menos {$this->getRequiredPreviousActivities($totalPrevious)} das atividades anteriores",
            'currentProgress' => $currentProgress,
            'previousActivities' => $previousActivities->map(function ($act) use ($userId) {
                $userAct = UserActivity::where('user_id', $userId)->where('activity_id', $act->id)->first();
                return [
                    'id' => $act->id,
                    'title' => $act->title,
                    'completed' => $userAct && $userAct->completed_at && $userAct->score >= self::MINIMUM_PROGRESS_PERCENTAGE,
                    'score' => $userAct->score ?? 0
                ];
            }),
            'nextActivity' => $courseActivities->get($currentPosition + 1) ?? null
        ];
    }

    /**
     * Calculate course progress for a user
     */
    private function calculateCourseProgress(int $userId, Course $course): array
    {
        $activities = $course->activities()->where('is_active', true)->get();
        $totalActivities = $activities->count();
        $completedActivities = 0;
        $pointsEarned = 0;
        $totalPossiblePoints = 0;

        $activitiesProgress = [];

        foreach ($activities as $activity) {
            $userActivity = UserActivity::where('user_id', $userId)
                ->where('activity_id', $activity->id)
                ->first();

            $isCompleted = $userActivity &&
                          $userActivity->completed_at &&
                          $userActivity->score >= self::MINIMUM_PROGRESS_PERCENTAGE;

            if ($isCompleted) {
                $completedActivities++;
                $pointsEarned += $activity->points_value;
            }

            $totalPossiblePoints += $activity->points_value;

            $activitiesProgress[] = [
                'id' => $activity->id,
                'title' => $activity->title,
                'type' => $activity->type,
                'points_value' => $activity->points_value,
                'order' => $activity->order,
                'completed' => $isCompleted,
                'score' => $userActivity->score ?? 0,
                'attempts' => $userActivity->attempts ?? 0,
                'canAccess' => $this->checkProgressionRequirements($userId, $activity)['canAccess']
            ];
        }

        $progressPercentage = $totalActivities > 0
            ? round(($completedActivities / $totalActivities) * 100, 2)
            : 0;

        return [
            'courseId' => $course->id,
            'courseTitle' => $course->title,
            'totalActivities' => $totalActivities,
            'completedActivities' => $completedActivities,
            'progressPercentage' => $progressPercentage,
            'pointsEarned' => $pointsEarned,
            'totalPossiblePoints' => $totalPossiblePoints,
            'pointsPercentage' => $totalPossiblePoints > 0
                ? round(($pointsEarned / $totalPossiblePoints) * 100, 2)
                : 0,
            'activities' => $activitiesProgress,
            'isCompleted' => $progressPercentage >= 100,
            'canComplete' => $progressPercentage >= self::MINIMUM_PROGRESS_PERCENTAGE
        ];
    }

    /**
     * Check and unlock next activities after completion
     */
    private function checkAndUnlockNextActivities(int $userId, Activity $completedActivity): array
    {
        $course = $completedActivity->course;
        $courseProgress = $this->calculateCourseProgress($userId, $course);

        // No real "unlocking" needed as it's checked dynamically
        // But we can return newly accessible activities
        $newlyAccessible = [];

        foreach ($courseProgress['activities'] as $activityData) {
            if ($activityData['canAccess'] && !$activityData['completed']) {
                $newlyAccessible[] = $activityData;
            }
        }

        return [
            'unlockedActivities' => $newlyAccessible,
            'courseProgress' => $courseProgress,
            'newBadges' => [] // TODO: Implement badge logic in ETAPA 5
        ];
    }

    /**
     * Update course enrollment progress
     */
    private function updateCourseProgress(int $userId, int $courseId): void
    {
        $course = Course::find($courseId);
        $progressData = $this->calculateCourseProgress($userId, $course);

        $enrollment = CourseEnrollment::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->first();

        if ($enrollment) {
            $updateData = [
                'progress_percentage' => $progressData['progressPercentage']
            ];

            // Mark course as completed if 100% progress
            if ($progressData['progressPercentage'] >= 100) {
                $updateData['completed_at'] = now();
            }

            $enrollment->update($updateData);
        }
    }

    /**
     * Get unlocked activities for a course
     */
    private function getUnlockedActivities(int $userId, Course $course): array
    {
        $courseProgress = $this->calculateCourseProgress($userId, $course);

        return array_filter($courseProgress['activities'], function ($activity) {
            return $activity['canAccess'];
        });
    }

    /**
     * Get locked activities for a course
     */
    private function getLockedActivities(int $userId, Course $course): array
    {
        $courseProgress = $this->calculateCourseProgress($userId, $course);

        return array_filter($courseProgress['activities'], function ($activity) {
            return !$activity['canAccess'];
        });
    }

    /**
     * Get next recommended activity
     */
    private function getNextRecommendedActivity(int $userId, Course $course): ?array
    {
        $courseProgress = $this->calculateCourseProgress($userId, $course);

        // Find first accessible but not completed activity
        foreach ($courseProgress['activities'] as $activity) {
            if ($activity['canAccess'] && !$activity['completed']) {
                return $activity;
            }
        }

        return null;
    }

    /**
     * Get encouragement message based on attempt count
     */
    private function getEncouragementMessage(int $attempts): string
    {
        $messages = [
            1 => "Não desista! Revise o conteúdo e tente novamente. Você consegue! 💪",
            2 => "Quase lá! Foque nas partes mais desafiadoras e tente mais uma vez. 🎯",
            3 => "Persistência é a chave do sucesso! Revise os materiais com calma. 📚",
            4 => "Você está progredindo! Cada tentativa te deixa mais próximo do objetivo. ⭐",
        ];

        return $messages[$attempts] ?? "Continue tentando! O esforço sempre compensa no final. 🚀";
    }

    /**
     * Calculate required previous activities based on 70% rule
     */
    private function getRequiredPreviousActivities(int $totalPrevious): int
    {
        return max(1, ceil($totalPrevious * (self::MINIMUM_PROGRESS_PERCENTAGE / 100)));
    }
}