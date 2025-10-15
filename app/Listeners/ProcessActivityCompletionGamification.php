<?php

namespace App\Listeners;

use App\Events\ActivityCompleted;
use App\Http\Controllers\GameController;
use App\Services\BadgeEvaluationService;
use App\Services\LevelCalculationService;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class ProcessActivityCompletionGamification implements ShouldQueue
{
    use InteractsWithQueue;

    protected $gameController;
    protected $badgeService;
    protected $levelService;
    protected $notificationService;

    /**
     * Create the event listener.
     */
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
     * Handle the event.
     */
    public function handle(ActivityCompleted $event): void
    {
        try {
            Log::info('Processing gamification for activity completion', [
                'user_id' => $event->user->id,
                'activity_id' => $event->activity->id,
                'score' => $event->score
            ]);

            // Process gamification automatically
            $this->processGamification($event);

        } catch (\Exception $e) {
            Log::error('Failed to process activity completion gamification', [
                'user_id' => $event->user->id,
                'activity_id' => $event->activity->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw to trigger retry if needed
            throw $e;
        }
    }

    /**
     * Process all gamification logic
     */
    private function processGamification(ActivityCompleted $event): void
    {
        $user = $event->user;
        $activity = $event->activity;
        $score = $event->score;
        $timeSpent = $event->timeSpent;

        // 1. Award points for completion (if score >= 70%)
        if ($score >= 70) {
            $this->awardActivityPoints($user, $activity, $score, $timeSpent);
        }

        // 2. Check and award badges
        $this->evaluateAndAwardBadges($user, $activity, $score);

        // 3. Check for level up
        $this->checkAndProcessLevelUp($user);

        // 4. Update streaks
        $this->updateUserStreaks($user, $activity);

        // 5. Send notifications
        $this->sendAchievementNotifications($user, $activity, $score);

        // 6. Update course progress
        $this->updateCourseProgress($user, $activity);

        Log::info('Gamification processing completed', [
            'user_id' => $user->id,
            'activity_id' => $activity->id,
            'new_total_points' => $user->fresh()->total_points,
            'new_level' => $user->fresh()->level
        ]);
    }

    /**
     * Award points for activity completion
     */
    private function awardActivityPoints($user, $activity, int $score, ?int $timeSpent): void
    {
        $basePoints = $activity->points_value ?? 10;

        // Score bonus
        $scoreMultiplier = 1.0;
        if ($score >= 95) $scoreMultiplier = 1.5;
        elseif ($score >= 85) $scoreMultiplier = 1.3;
        elseif ($score >= 75) $scoreMultiplier = 1.1;

        // Time bonus (if completed efficiently)
        $timeMultiplier = 1.0;
        if ($timeSpent && $activity->duration_minutes) {
            $expectedSeconds = $activity->duration_minutes * 60;
            $efficiency = $timeSpent / $expectedSeconds;

            if ($efficiency <= 0.8) $timeMultiplier = 1.2;      // 20% bonus for speed
            elseif ($efficiency <= 1.0) $timeMultiplier = 1.1;  // 10% bonus for efficiency
            elseif ($efficiency > 1.5) $timeMultiplier = 0.9;   // -10% for taking too long
        }

        $totalPoints = round($basePoints * $scoreMultiplier * $timeMultiplier);

        \App\Models\Point::awardPoints(
            $user,
            $totalPoints,
            \App\Models\Activity::class,
            $activity->id,
            "Completed activity: {$activity->title} (Score: {$score}%)"
        );

        Log::info('Points awarded', [
            'user_id' => $user->id,
            'activity_id' => $activity->id,
            'base_points' => $basePoints,
            'total_points' => $totalPoints,
            'score_multiplier' => $scoreMultiplier,
            'time_multiplier' => $timeMultiplier
        ]);
    }

    /**
     * Evaluate and award badges
     */
    private function evaluateAndAwardBadges($user, $activity, int $score): void
    {
        // Check activity-specific badges
        $badges = $this->badgeService->evaluateActivityBadges($user, $activity, [
            'score' => $score,
            'completed_at' => now()
        ]);

        foreach ($badges as $badge) {
            Log::info('Badge awarded', [
                'user_id' => $user->id,
                'badge_id' => $badge['id'],
                'badge_name' => $badge['name']
            ]);
        }
    }

    /**
     * Check for level up
     */
    private function checkAndProcessLevelUp($user): void
    {
        $oldLevel = $user->level ?? 1;
        $newLevel = $this->levelService->calculateUserLevel($user);

        if ($newLevel > $oldLevel) {
            $user->update(['level' => $newLevel]);

            // Fire level up event
            event(new \App\Events\LevelUp($user, $oldLevel, $newLevel, $user->total_points));

            Log::info('User leveled up', [
                'user_id' => $user->id,
                'old_level' => $oldLevel,
                'new_level' => $newLevel,
                'total_points' => $user->total_points
            ]);

            // Award level-up badge if exists
            $levelBadge = $this->badgeService->checkLevelUpBadge($user, $newLevel);
            if ($levelBadge) {
                Log::info('Level-up badge awarded', [
                    'user_id' => $user->id,
                    'level' => $newLevel,
                    'badge' => $levelBadge
                ]);
            }
        }
    }

    /**
     * Update user streaks
     */
    private function updateUserStreaks($user, $activity): void
    {
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        // Get last activity completion date (excluding current activity)
        $lastCompletion = \App\Models\UserActivity::where('user_id', $user->id)
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
        } else {
            // Reset streak
            $currentStreak = 1;
        }

        $user->update([
            'current_streak' => $currentStreak,
            'longest_streak' => max($user->longest_streak ?? 0, $currentStreak),
            'last_activity_date' => now()
        ]);

        // Award streak badges if applicable
        if ($currentStreak >= 7) {
            $this->badgeService->checkStreakBadges($user, $currentStreak);
        }

        Log::info('Streak updated', [
            'user_id' => $user->id,
            'current_streak' => $currentStreak,
            'longest_streak' => $user->longest_streak
        ]);
    }

    /**
     * Send achievement notifications
     */
    private function sendAchievementNotifications($user, $activity, int $score): void
    {
        // This will be handled by notification service
        $this->notificationService->sendActivityCompletionNotification($user, $activity, $score);
    }

    /**
     * Update course progress
     */
    private function updateCourseProgress($user, $activity): void
    {
        $course = $activity->course;

        // Calculate new course progress
        $totalActivities = $course->activities()->where('is_active', true)->count();
        $completedActivities = \App\Models\UserActivity::where('user_id', $user->id)
            ->whereHas('activity', function($query) use ($course) {
                $query->where('course_id', $course->id)->where('is_active', true);
            })
            ->whereNotNull('completed_at')
            ->where('score', '>=', 70)
            ->count();

        $progressPercentage = $totalActivities > 0 ? round(($completedActivities / $totalActivities) * 100, 2) : 0;

        // Update enrollment
        $enrollment = \App\Models\CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($enrollment) {
            $updateData = ['progress_percentage' => $progressPercentage];

            // Check if course is completed
            if ($progressPercentage >= 100 && is_null($enrollment->completed_at)) {
                $updateData['completed_at'] = now();

                // Fire course completion event
                event(new \App\Events\CourseCompleted($user, $course, $enrollment));
            }

            $enrollment->update($updateData);

            Log::info('Course progress updated', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'progress_percentage' => $progressPercentage,
                'completed_activities' => $completedActivities,
                'total_activities' => $totalActivities
            ]);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(ActivityCompleted $event, \Throwable $exception): void
    {
        Log::error('Activity completion gamification job failed', [
            'user_id' => $event->user->id,
            'activity_id' => $event->activity->id,
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);

        // Optionally send alert to administrators
        // $this->notificationService->alertAdministrators('gamification_failure', $exception);
    }
}