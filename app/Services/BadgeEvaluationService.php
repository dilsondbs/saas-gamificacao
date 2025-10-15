<?php

namespace App\Services;

use App\Models\User;
use App\Models\Activity;
use App\Models\Course;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\UserActivity;
use App\Models\CourseEnrollment;
use App\Models\Point;
use App\Events\BadgeEarned;
use Illuminate\Support\Facades\Log;

class BadgeEvaluationService
{
    /**
     * Badge types and their criteria
     */
    const BADGE_TYPES = [
        'activity_completion' => 'Activity Completion',
        'course_completion' => 'Course Completion',
        'score_achievement' => 'Score Achievement',
        'streak' => 'Streak',
        'level' => 'Level Achievement',
        'participation' => 'Participation',
        'special' => 'Special Achievement'
    ];

    /**
     * Evaluate activity-related badges for a user
     */
    public function evaluateActivityBadges(User $user, Activity $activity, array $data): array
    {
        $awardedBadges = [];

        // Get all active badges that could be related to activities
        $badges = Badge::active()
            ->whereIn('type', ['activity_completion', 'score_achievement', 'participation'])
            ->get();

        foreach ($badges as $badge) {
            if ($this->shouldAwardBadge($user, $badge, 'activity', array_merge($data, [
                'activity' => $activity,
                'user' => $user
            ]))) {
                $userBadge = $this->awardBadge($user, $badge, [
                    'activity_id' => $activity->id,
                    'score' => $data['score'] ?? null,
                    'awarded_for' => 'activity_completion'
                ]);

                if ($userBadge) {
                    $awardedBadges[] = [
                        'id' => $badge->id,
                        'name' => $badge->name,
                        'description' => $badge->description,
                        'icon' => $badge->icon,
                        'color' => $badge->color,
                        'points_value' => $badge->points_value,
                        'earned_at' => $userBadge->earned_at
                    ];
                }
            }
        }

        return $awardedBadges;
    }

    /**
     * Evaluate course enrollment badges
     */
    public function evaluateEnrollmentBadges(User $user, Course $course): array
    {
        $awardedBadges = [];

        $badges = Badge::active()
            ->where('type', 'participation')
            ->get();

        foreach ($badges as $badge) {
            if ($this->shouldAwardBadge($user, $badge, 'enrollment', [
                'course' => $course,
                'user' => $user
            ])) {
                $userBadge = $this->awardBadge($user, $badge, [
                    'course_id' => $course->id,
                    'awarded_for' => 'course_enrollment'
                ]);

                if ($userBadge) {
                    $awardedBadges[] = [
                        'id' => $badge->id,
                        'name' => $badge->name,
                        'description' => $badge->description,
                        'icon' => $badge->icon,
                        'color' => $badge->color,
                        'points_value' => $badge->points_value,
                        'earned_at' => $userBadge->earned_at
                    ];
                }
            }
        }

        return $awardedBadges;
    }

    /**
     * Evaluate course completion badges
     */
    public function evaluateCourseCompletionBadges(User $user, Course $course): array
    {
        $awardedBadges = [];

        $badges = Badge::active()
            ->whereIn('type', ['course_completion', 'participation'])
            ->get();

        foreach ($badges as $badge) {
            if ($this->shouldAwardBadge($user, $badge, 'course_completion', [
                'course' => $course,
                'user' => $user
            ])) {
                $userBadge = $this->awardBadge($user, $badge, [
                    'course_id' => $course->id,
                    'awarded_for' => 'course_completion'
                ]);

                if ($userBadge) {
                    $awardedBadges[] = [
                        'id' => $badge->id,
                        'name' => $badge->name,
                        'description' => $badge->description,
                        'icon' => $badge->icon,
                        'color' => $badge->color,
                        'points_value' => $badge->points_value,
                        'earned_at' => $userBadge->earned_at
                    ];
                }
            }
        }

        return $awardedBadges;
    }

    /**
     * Check and award level-up badge
     */
    public function checkLevelUpBadge(User $user, int $newLevel): ?array
    {
        $levelBadges = Badge::active()
            ->where('type', 'level')
            ->get();

        foreach ($levelBadges as $badge) {
            $criteria = $badge->criteria;

            if (isset($criteria['level']) && $criteria['level'] <= $newLevel) {
                // Check if user already has this badge
                $existingBadge = UserBadge::where('user_id', $user->id)
                    ->where('badge_id', $badge->id)
                    ->first();

                if (!$existingBadge) {
                    $userBadge = $this->awardBadge($user, $badge, [
                        'level' => $newLevel,
                        'awarded_for' => 'level_achievement'
                    ]);

                    if ($userBadge) {
                        return [
                            'id' => $badge->id,
                            'name' => $badge->name,
                            'description' => $badge->description,
                            'icon' => $badge->icon,
                            'color' => $badge->color,
                            'points_value' => $badge->points_value,
                            'earned_at' => $userBadge->earned_at
                        ];
                    }
                }
            }
        }

        return null;
    }

    /**
     * Check streak badges
     */
    public function checkStreakBadges(User $user, int $streakDays): array
    {
        $awardedBadges = [];

        $streakBadges = Badge::active()
            ->where('type', 'streak')
            ->get();

        foreach ($streakBadges as $badge) {
            $criteria = $badge->criteria;

            if (isset($criteria['streak_days']) && $criteria['streak_days'] <= $streakDays) {
                // Check if user already has this badge
                $existingBadge = UserBadge::where('user_id', $user->id)
                    ->where('badge_id', $badge->id)
                    ->first();

                if (!$existingBadge) {
                    $userBadge = $this->awardBadge($user, $badge, [
                        'streak_days' => $streakDays,
                        'awarded_for' => 'streak_achievement'
                    ]);

                    if ($userBadge) {
                        $awardedBadges[] = [
                            'id' => $badge->id,
                            'name' => $badge->name,
                            'description' => $badge->description,
                            'icon' => $badge->icon,
                            'color' => $badge->color,
                            'points_value' => $badge->points_value,
                            'earned_at' => $userBadge->earned_at
                        ];
                    }
                }
            }
        }

        return $awardedBadges;
    }

    /**
     * Award welcome badge for first enrollment
     */
    public function awardWelcomeBadge(User $user): ?array
    {
        $welcomeBadge = Badge::active()
            ->where('type', 'special')
            ->where('name', 'Welcome')
            ->first();

        if ($welcomeBadge) {
            $existingBadge = UserBadge::where('user_id', $user->id)
                ->where('badge_id', $welcomeBadge->id)
                ->first();

            if (!$existingBadge) {
                $userBadge = $this->awardBadge($user, $welcomeBadge, [
                    'awarded_for' => 'first_enrollment'
                ]);

                if ($userBadge) {
                    return [
                        'id' => $welcomeBadge->id,
                        'name' => $welcomeBadge->name,
                        'description' => $welcomeBadge->description,
                        'icon' => $welcomeBadge->icon,
                        'color' => $welcomeBadge->color,
                        'points_value' => $welcomeBadge->points_value,
                        'earned_at' => $userBadge->earned_at
                    ];
                }
            }
        }

        return null;
    }

    /**
     * Get badge progress for a user
     */
    public function getBadgeProgress(User $user, Badge $badge): float
    {
        $criteria = $badge->criteria;

        switch ($badge->type) {
            case 'activity_completion':
                return $this->getActivityCompletionProgress($user, $criteria);

            case 'course_completion':
                return $this->getCourseCompletionProgress($user, $criteria);

            case 'score_achievement':
                return $this->getScoreAchievementProgress($user, $criteria);

            case 'streak':
                return $this->getStreakProgress($user, $criteria);

            case 'level':
                return $this->getLevelProgress($user, $criteria);

            default:
                return 0;
        }
    }

    /**
     * Re-evaluate all badges for a user
     */
    public function reevaluateAllBadges(User $user): void
    {
        $badges = Badge::active()->get();

        foreach ($badges as $badge) {
            $this->reevaluateBadge($user, $badge);
        }
    }

    /**
     * Determine if badge should be awarded
     */
    private function shouldAwardBadge(User $user, Badge $badge, string $context, array $data): bool
    {
        // Check if user already has this badge
        $existingBadge = UserBadge::where('user_id', $user->id)
            ->where('badge_id', $badge->id)
            ->first();

        if ($existingBadge) {
            return false;
        }

        $criteria = $badge->criteria;

        switch ($badge->type) {
            case 'activity_completion':
                return $this->checkActivityCompletionCriteria($user, $criteria, $data);

            case 'course_completion':
                return $this->checkCourseCompletionCriteria($user, $criteria, $data);

            case 'score_achievement':
                return $this->checkScoreAchievementCriteria($user, $criteria, $data);

            case 'participation':
                return $this->checkParticipationCriteria($user, $criteria, $data);

            default:
                return false;
        }
    }

    /**
     * Award badge to user
     */
    private function awardBadge(User $user, Badge $badge, array $metadata = null): ?UserBadge
    {
        try {
            $userBadge = UserBadge::awardBadge($user, $badge, $metadata);

            // Fire badge earned event
            event(new BadgeEarned($user, $badge, $userBadge, true));

            Log::info('Badge awarded', [
                'user_id' => $user->id,
                'badge_id' => $badge->id,
                'badge_name' => $badge->name,
                'metadata' => $metadata
            ]);

            return $userBadge;

        } catch (\Exception $e) {
            Log::error('Failed to award badge', [
                'user_id' => $user->id,
                'badge_id' => $badge->id,
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    /**
     * Check activity completion criteria
     */
    private function checkActivityCompletionCriteria(User $user, array $criteria, array $data): bool
    {
        if (isset($criteria['activities_completed'])) {
            $completedCount = UserActivity::where('user_id', $user->id)
                ->whereNotNull('completed_at')
                ->where('score', '>=', 70)
                ->count();

            return $completedCount >= $criteria['activities_completed'];
        }

        if (isset($criteria['perfect_score']) && $criteria['perfect_score']) {
            return ($data['score'] ?? 0) >= 100;
        }

        if (isset($criteria['min_score'])) {
            return ($data['score'] ?? 0) >= $criteria['min_score'];
        }

        return false;
    }

    /**
     * Check course completion criteria
     */
    private function checkCourseCompletionCriteria(User $user, array $criteria, array $data): bool
    {
        if (isset($criteria['courses_completed'])) {
            $completedCount = CourseEnrollment::where('user_id', $user->id)
                ->whereNotNull('completed_at')
                ->count();

            return $completedCount >= $criteria['courses_completed'];
        }

        return false;
    }

    /**
     * Check score achievement criteria
     */
    private function checkScoreAchievementCriteria(User $user, array $criteria, array $data): bool
    {
        if (isset($criteria['average_score'])) {
            $averageScore = UserActivity::where('user_id', $user->id)
                ->whereNotNull('completed_at')
                ->avg('score');

            return $averageScore >= $criteria['average_score'];
        }

        return false;
    }

    /**
     * Check participation criteria
     */
    private function checkParticipationCriteria(User $user, array $criteria, array $data): bool
    {
        if (isset($criteria['enrollments_count'])) {
            $enrollmentCount = CourseEnrollment::where('user_id', $user->id)->count();
            return $enrollmentCount >= $criteria['enrollments_count'];
        }

        return false;
    }

    /**
     * Get activity completion progress
     */
    private function getActivityCompletionProgress(User $user, array $criteria): float
    {
        if (isset($criteria['activities_completed'])) {
            $completedCount = UserActivity::where('user_id', $user->id)
                ->whereNotNull('completed_at')
                ->where('score', '>=', 70)
                ->count();

            return min(100, ($completedCount / $criteria['activities_completed']) * 100);
        }

        return 0;
    }

    /**
     * Get course completion progress
     */
    private function getCourseCompletionProgress(User $user, array $criteria): float
    {
        if (isset($criteria['courses_completed'])) {
            $completedCount = CourseEnrollment::where('user_id', $user->id)
                ->whereNotNull('completed_at')
                ->count();

            return min(100, ($completedCount / $criteria['courses_completed']) * 100);
        }

        return 0;
    }

    /**
     * Get score achievement progress
     */
    private function getScoreAchievementProgress(User $user, array $criteria): float
    {
        if (isset($criteria['average_score'])) {
            $averageScore = UserActivity::where('user_id', $user->id)
                ->whereNotNull('completed_at')
                ->avg('score') ?? 0;

            return min(100, ($averageScore / $criteria['average_score']) * 100);
        }

        return 0;
    }

    /**
     * Get streak progress
     */
    private function getStreakProgress(User $user, array $criteria): float
    {
        if (isset($criteria['streak_days'])) {
            $currentStreak = $user->current_streak ?? 0;
            return min(100, ($currentStreak / $criteria['streak_days']) * 100);
        }

        return 0;
    }

    /**
     * Get level progress
     */
    private function getLevelProgress(User $user, array $criteria): float
    {
        if (isset($criteria['level'])) {
            $currentLevel = $user->level ?? 1;
            return $currentLevel >= $criteria['level'] ? 100 : (($currentLevel / $criteria['level']) * 100);
        }

        return 0;
    }

    /**
     * Re-evaluate a specific badge for a user
     */
    private function reevaluateBadge(User $user, Badge $badge): void
    {
        $hasEarned = UserBadge::where('user_id', $user->id)
            ->where('badge_id', $badge->id)
            ->exists();

        if (!$hasEarned) {
            $criteria = $badge->criteria;

            // Check if user now meets criteria
            $shouldHave = false;

            switch ($badge->type) {
                case 'activity_completion':
                    $shouldHave = $this->checkActivityCompletionCriteria($user, $criteria, []);
                    break;

                case 'course_completion':
                    $shouldHave = $this->checkCourseCompletionCriteria($user, $criteria, []);
                    break;

                case 'score_achievement':
                    $shouldHave = $this->checkScoreAchievementCriteria($user, $criteria, []);
                    break;
            }

            if ($shouldHave) {
                $this->awardBadge($user, $badge, ['awarded_for' => 'reevaluation']);
            }
        }
    }
}