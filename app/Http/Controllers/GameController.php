<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Activity;
use App\Models\Course;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\Point;
use App\Models\UserActivity;
use App\Models\CourseEnrollment;
use App\Services\BadgeEvaluationService;
use App\Services\LevelCalculationService;
use App\Services\NotificationService;

class GameController extends Controller
{
    protected $badgeService;
    protected $levelService;
    protected $notificationService;

    public function __construct(
        BadgeEvaluationService $badgeService,
        LevelCalculationService $levelService,
        NotificationService $notificationService
    ) {
        $this->badgeService = $badgeService;
        $this->levelService = $levelService;
        $this->notificationService = $notificationService;
    }

    /**
     * Process gamification after activity completion
     */
    public function processActivityCompletion(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'activity_id' => 'required|integer|exists:activities,id',
            'score' => 'required|integer|min:0|max:100',
            'time_spent' => 'nullable|integer|min:0'
        ]);

        try {
            DB::beginTransaction();

            $user = User::find($validated['user_id']);
            $activity = Activity::find($validated['activity_id']);

            $gamificationResults = $this->processUserActivityCompletion($user, $activity, $validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'results' => $gamificationResults
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erro ao processar gamificação',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Process gamification after course enrollment
     */
    public function processCourseEnrollment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'course_id' => 'required|integer|exists:courses,id'
        ]);

        try {
            DB::beginTransaction();

            $user = User::find($validated['user_id']);
            $course = Course::find($validated['course_id']);

            $gamificationResults = $this->processUserCourseEnrollment($user, $course);

            DB::commit();

            return response()->json([
                'success' => true,
                'results' => $gamificationResults
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erro ao processar gamificação do enrollment',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Process gamification after course completion
     */
    public function processCourseCompletion(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'course_id' => 'required|integer|exists:courses,id'
        ]);

        try {
            DB::beginTransaction();

            $user = User::find($validated['user_id']);
            $course = Course::find($validated['course_id']);

            $gamificationResults = $this->processUserCourseCompletion($user, $course);

            DB::commit();

            return response()->json([
                'success' => true,
                'results' => $gamificationResults
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erro ao processar gamificação da conclusão',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get user's current gamification status
     */
    public function getUserGamificationStatus(User $user): JsonResponse
    {
        $status = [
            'user_id' => $user->id,
            'total_points' => $user->total_points ?? 0,
            'level' => $this->levelService->getUserLevel($user),
            'badges' => $this->getUserBadgesSummary($user),
            'statistics' => $this->getUserStatistics($user),
            'recent_achievements' => $this->getRecentAchievements($user),
            'next_milestones' => $this->getNextMilestones($user),
            'rank' => $this->getUserRankData($user)
        ];

        return response()->json($status);
    }

    /**
     * Force recalculation of all user gamification data
     */
    public function recalculateUserGamification(User $user): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Recalculate total points
            $this->recalculateUserPoints($user);

            // Re-evaluate all badges
            $this->reevaluateUserBadges($user);

            // Update level
            $newLevel = $this->levelService->calculateUserLevel($user);
            $user->update(['level' => $newLevel]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Gamificação recalculada com sucesso',
                'new_status' => $this->getUserGamificationStatus($user)->getData()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erro ao recalcular gamificação',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Process user activity completion gamification
     */
    private function processUserActivityCompletion(User $user, Activity $activity, array $data): array
    {
        $results = [
            'points_awarded' => 0,
            'badges_earned' => [],
            'level_changes' => [],
            'notifications' => [],
            'streaks' => []
        ];

        // Award activity completion points
        if ($data['score'] >= 70) {
            $basePoints = $activity->points_value ?? 10;
            $bonusMultiplier = $this->calculateScoreBonus($data['score']);
            $timeBonus = $this->calculateTimeBonus($data['time_spent'] ?? 0, $activity->duration_minutes ?? 0);

            $totalPoints = round($basePoints * $bonusMultiplier * $timeBonus);

            Point::awardPoints(
                $user,
                $totalPoints,
                Activity::class,
                $activity->id,
                "Completed activity: {$activity->title} (Score: {$data['score']}%)"
            );

            $results['points_awarded'] = $totalPoints;
        }

        // Check for new badges
        $newBadges = $this->badgeService->evaluateActivityBadges($user, $activity, $data);
        $results['badges_earned'] = $newBadges;

        // Check for level changes
        $oldLevel = $user->level ?? 1;
        $newLevel = $this->levelService->calculateUserLevel($user);

        if ($newLevel > $oldLevel) {
            $user->update(['level' => $newLevel]);
            $results['level_changes'][] = [
                'old_level' => $oldLevel,
                'new_level' => $newLevel,
                'points_at_level_up' => $user->total_points
            ];

            // Award level-up badge if exists
            $levelBadge = $this->badgeService->checkLevelUpBadge($user, $newLevel);
            if ($levelBadge) {
                $results['badges_earned'][] = $levelBadge;
            }
        }

        // Check streaks
        $streaks = $this->updateUserStreaks($user, $activity);
        $results['streaks'] = $streaks;

        // Generate notifications
        $notifications = $this->generateAchievementNotifications($user, $results);
        $results['notifications'] = $notifications;

        return $results;
    }

    /**
     * Process user course enrollment gamification
     */
    private function processUserCourseEnrollment(User $user, Course $course): array
    {
        $results = [
            'points_awarded' => 0,
            'badges_earned' => [],
            'welcome_bonus' => false
        ];

        // Award enrollment points
        $enrollmentPoints = 5;
        Point::awardPoints(
            $user,
            $enrollmentPoints,
            Course::class,
            $course->id,
            "Enrolled in course: {$course->title}"
        );

        $results['points_awarded'] = $enrollmentPoints;

        // Check for enrollment badges
        $enrollmentBadges = $this->badgeService->evaluateEnrollmentBadges($user, $course);
        $results['badges_earned'] = $enrollmentBadges;

        // Check if this is user's first course
        $enrollmentCount = CourseEnrollment::where('user_id', $user->id)->count();
        if ($enrollmentCount === 1) {
            $results['welcome_bonus'] = true;
            $welcomeBadge = $this->badgeService->awardWelcomeBadge($user);
            if ($welcomeBadge) {
                $results['badges_earned'][] = $welcomeBadge;
            }
        }

        return $results;
    }

    /**
     * Process user course completion gamification
     */
    private function processUserCourseCompletion(User $user, Course $course): array
    {
        $results = [
            'points_awarded' => 0,
            'badges_earned' => [],
            'completion_bonus' => 0
        ];

        // Award course completion points
        $basePoints = $course->points_per_completion ?? 100;
        $completionBonus = $this->calculateCourseCompletionBonus($user, $course);
        $totalPoints = $basePoints + $completionBonus;

        Point::awardPoints(
            $user,
            $totalPoints,
            Course::class,
            $course->id,
            "Completed course: {$course->title}"
        );

        $results['points_awarded'] = $totalPoints;
        $results['completion_bonus'] = $completionBonus;

        // Check for course completion badges
        $completionBadges = $this->badgeService->evaluateCourseCompletionBadges($user, $course);
        $results['badges_earned'] = $completionBadges;

        return $results;
    }

    /**
     * Calculate score-based bonus multiplier
     */
    private function calculateScoreBonus(int $score): float
    {
        if ($score >= 95) return 1.5;      // 50% bonus for excellent
        if ($score >= 85) return 1.3;      // 30% bonus for great
        if ($score >= 75) return 1.1;      // 10% bonus for good
        return 1.0;                        // No bonus for passing
    }

    /**
     * Calculate time-based bonus multiplier
     */
    private function calculateTimeBonus(int $timeSpent, int $expectedTime): float
    {
        if ($expectedTime <= 0) return 1.0;

        $efficiency = $timeSpent / ($expectedTime * 60); // Convert to seconds

        if ($efficiency <= 0.8) return 1.2;    // 20% bonus for speed
        if ($efficiency <= 1.0) return 1.1;    // 10% bonus for efficiency
        if ($efficiency <= 1.5) return 1.0;    // No bonus for normal time
        return 0.9;                            // -10% for taking too long
    }

    /**
     * Calculate course completion bonus
     */
    private function calculateCourseCompletionBonus(User $user, Course $course): int
    {
        // Speed bonus (completed in less than expected time)
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) return 0;

        $completionTime = now()->diffInDays($enrollment->enrolled_at);
        $expectedTime = 30; // 30 days expected completion time

        if ($completionTime <= 7) return 50;    // 1 week bonus
        if ($completionTime <= 14) return 30;   // 2 weeks bonus
        if ($completionTime <= 21) return 15;   // 3 weeks bonus

        return 0;
    }

    /**
     * Update user streaks
     */
    private function updateUserStreaks(User $user, Activity $activity): array
    {
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        // Get last activity completion date
        $lastCompletion = UserActivity::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->where('activity_id', '!=', $activity->id)
            ->latest('completed_at')
            ->first();

        $currentStreak = $user->current_streak ?? 0;
        $lastActivityDate = $lastCompletion ? $lastCompletion->completed_at->toDateString() : null;

        if ($lastActivityDate === $yesterday) {
            // Continue streak
            $currentStreak++;
        } elseif ($lastActivityDate === $today) {
            // Already had activity today, maintain streak
            // Don't increment
        } else {
            // Reset streak
            $currentStreak = 1;
        }

        // Update user streak
        $user->update([
            'current_streak' => $currentStreak,
            'longest_streak' => max($user->longest_streak ?? 0, $currentStreak),
            'last_activity_date' => now()
        ]);

        return [
            'current_streak' => $currentStreak,
            'longest_streak' => $user->longest_streak,
            'is_new_record' => $currentStreak > ($user->longest_streak ?? 0)
        ];
    }

    /**
     * Generate achievement notifications
     */
    private function generateAchievementNotifications(User $user, array $results): array
    {
        $notifications = [];

        // Points notification
        if ($results['points_awarded'] > 0) {
            $notifications[] = [
                'type' => 'points',
                'message' => "Você ganhou {$results['points_awarded']} pontos!",
                'icon' => 'star',
                'color' => 'yellow'
            ];
        }

        // Badge notifications
        foreach ($results['badges_earned'] as $badge) {
            $notifications[] = [
                'type' => 'badge',
                'message' => "Nova conquista desbloqueada: {$badge['name']}!",
                'icon' => 'trophy',
                'color' => 'gold',
                'badge' => $badge
            ];
        }

        // Level up notifications
        foreach ($results['level_changes'] as $levelChange) {
            $notifications[] = [
                'type' => 'level_up',
                'message' => "Parabéns! Você subiu para o nível {$levelChange['new_level']}!",
                'icon' => 'trending-up',
                'color' => 'blue',
                'level_change' => $levelChange
            ];
        }

        // Streak notifications
        if (!empty($results['streaks']) && $results['streaks']['current_streak'] >= 3) {
            $streak = $results['streaks']['current_streak'];
            $notifications[] = [
                'type' => 'streak',
                'message' => "Sequência incrível! {$streak} dias seguidos de estudo!",
                'icon' => 'fire',
                'color' => 'orange',
                'streak' => $results['streaks']
            ];
        }

        return $notifications;
    }

    /**
     * Get user badges summary
     */
    private function getUserBadgesSummary(User $user): array
    {
        $badges = UserBadge::where('user_id', $user->id)
            ->with('badge')
            ->latest('earned_at')
            ->get();

        return [
            'total' => $badges->count(),
            'recent' => $badges->take(5)->map(function ($userBadge) {
                return [
                    'id' => $userBadge->badge->id,
                    'name' => $userBadge->badge->name,
                    'icon' => $userBadge->badge->icon,
                    'color' => $userBadge->badge->color,
                    'earned_at' => $userBadge->earned_at
                ];
            }),
            'by_type' => $badges->groupBy('badge.type')->map->count()
        ];
    }

    /**
     * Get user statistics
     */
    private function getUserStatistics(User $user): array
    {
        return [
            'activities_completed' => UserActivity::where('user_id', $user->id)
                ->whereNotNull('completed_at')->count(),
            'courses_enrolled' => CourseEnrollment::where('user_id', $user->id)->count(),
            'courses_completed' => CourseEnrollment::where('user_id', $user->id)
                ->whereNotNull('completed_at')->count(),
            'average_score' => UserActivity::where('user_id', $user->id)
                ->whereNotNull('completed_at')
                ->avg('score') ?? 0,
            'current_streak' => $user->current_streak ?? 0,
            'longest_streak' => $user->longest_streak ?? 0
        ];
    }

    /**
     * Get recent achievements
     */
    private function getRecentAchievements(User $user): array
    {
        $recentBadges = UserBadge::where('user_id', $user->id)
            ->with('badge')
            ->latest('earned_at')
            ->take(3)
            ->get();

        $recentPoints = Point::where('user_id', $user->id)
            ->where('type', 'earned')
            ->latest('created_at')
            ->take(5)
            ->get();

        return [
            'badges' => $recentBadges,
            'points' => $recentPoints
        ];
    }

    /**
     * Get next milestones
     */
    private function getNextMilestones(User $user): array
    {
        $currentLevel = $user->level ?? 1;
        $nextLevel = $currentLevel + 1;
        $pointsForNextLevel = $this->levelService->getPointsRequiredForLevel($nextLevel);
        $pointsNeeded = $pointsForNextLevel - ($user->total_points ?? 0);

        return [
            'next_level' => [
                'level' => $nextLevel,
                'points_needed' => max(0, $pointsNeeded),
                'progress_percentage' => $pointsNeeded <= 0 ? 100 :
                    round((($user->total_points ?? 0) / $pointsForNextLevel) * 100, 1)
            ],
            'available_badges' => $this->getAvailableBadges($user)
        ];
    }

    /**
     * Get available badges user can earn
     */
    private function getAvailableBadges(User $user): array
    {
        $earnedBadgeIds = UserBadge::where('user_id', $user->id)->pluck('badge_id');

        return Badge::active()
            ->whereNotIn('id', $earnedBadgeIds)
            ->take(3)
            ->get()
            ->map(function ($badge) use ($user) {
                return [
                    'id' => $badge->id,
                    'name' => $badge->name,
                    'description' => $badge->description,
                    'icon' => $badge->icon,
                    'progress' => $this->badgeService->getBadgeProgress($user, $badge)
                ];
            });
    }

    /**
     * Get user rank data
     */
    private function getUserRankData(User $user): array
    {
        $rank = User::where('total_points', '>', $user->total_points ?? 0)->count() + 1;
        $totalUsers = User::where('total_points', '>', 0)->count();

        return [
            'position' => $rank,
            'total_users' => $totalUsers,
            'percentile' => $totalUsers > 0 ? round((1 - ($rank / $totalUsers)) * 100, 1) : 0
        ];
    }

    /**
     * Recalculate user points
     */
    private function recalculateUserPoints(User $user): void
    {
        $totalPoints = Point::where('user_id', $user->id)
            ->where('type', 'earned')
            ->sum('points');

        $user->update(['total_points' => $totalPoints]);
    }

    /**
     * Re-evaluate user badges
     */
    private function reevaluateUserBadges(User $user): void
    {
        $this->badgeService->reevaluateAllBadges($user);
    }

    /**
     * Get leaderboard
     */
    public function getLeaderboard(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'limit' => 'nullable|integer|min:1|max:100',
            'type' => 'nullable|string|in:points,level,badges',
            'period' => 'nullable|string|in:daily,weekly,monthly,all_time'
        ]);

        $limit = $validated['limit'] ?? 10;
        $type = $validated['type'] ?? 'points';
        $period = $validated['period'] ?? 'all_time';

        $leaderboard = $this->generateLeaderboard($type, $period, $limit);

        return response()->json([
            'leaderboard' => $leaderboard,
            'type' => $type,
            'period' => $period,
            'limit' => $limit,
            'generated_at' => now()->toISOString()
        ]);
    }

    /**
     * Get user rank
     */
    public function getUserRank(User $user): JsonResponse
    {
        $rank = $this->getUserRankData($user);

        return response()->json($rank);
    }

    /**
     * Generate leaderboard based on type and period
     */
    private function generateLeaderboard(string $type, string $period, int $limit): array
    {
        $query = User::where('total_points', '>', 0);

        // Apply period filtering for points
        if ($period !== 'all_time' && $type === 'points') {
            $dateFilter = $this->getDateFilterForPeriod($period);

            $userPointsSubquery = Point::selectRaw('user_id, SUM(points) as period_points')
                ->where('type', 'earned')
                ->where('created_at', '>=', $dateFilter)
                ->groupBy('user_id');

            $query = User::joinSub($userPointsSubquery, 'period_points', function ($join) {
                $join->on('users.id', '=', 'period_points.user_id');
            })->orderByDesc('period_points');
        } else {
            // Default ordering
            switch ($type) {
                case 'level':
                    $query->orderByDesc('level');
                    break;
                case 'badges':
                    $query->withCount('badges as badges_count')->orderByDesc('badges_count');
                    break;
                default:
                    $query->orderByDesc('total_points');
            }
        }

        $topUsers = $query->limit($limit)->get();

        return $topUsers->map(function ($user, $index) use ($type) {
            $levelInfo = $this->levelService->getUserLevel($user);

            $data = [
                'rank' => $index + 1,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'total_points' => $user->total_points ?? 0,
                'level' => $levelInfo['current_level'],
                'level_title' => $levelInfo['current_level_title']
            ];

            if ($type === 'badges') {
                $data['badges_count'] = $user->badges_count ?? 0;
            }

            return $data;
        })->toArray();
    }

    /**
     * Get date filter for leaderboard period
     */
    private function getDateFilterForPeriod(string $period): \Carbon\Carbon
    {
        switch ($period) {
            case 'daily':
                return now()->startOfDay();
            case 'weekly':
                return now()->startOfWeek();
            case 'monthly':
                return now()->startOfMonth();
            default:
                return now()->subYear(); // Fallback to last year
        }
    }
}