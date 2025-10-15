<?php

namespace App\Listeners;

use App\Events\CourseCompleted;
use App\Services\BadgeEvaluationService;
use App\Services\LevelCalculationService;
use App\Services\NotificationService;
use App\Models\Point;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class ProcessCourseCompletionGamification implements ShouldQueue
{
    use InteractsWithQueue;

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
    public function handle(CourseCompleted $event): void
    {
        try {
            Log::info('Processing gamification for course completion', [
                'user_id' => $event->user->id,
                'course_id' => $event->course->id,
                'completion_time_days' => $event->completionTime
            ]);

            $this->processGamification($event);

        } catch (\Exception $e) {
            Log::error('Failed to process course completion gamification', [
                'user_id' => $event->user->id,
                'course_id' => $event->course->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Process gamification logic for course completion
     */
    private function processGamification(CourseCompleted $event): void
    {
        $user = $event->user;
        $course = $event->course;
        $completionTime = $event->completionTime;

        // 1. Award course completion points
        $this->awardCourseCompletionPoints($user, $course, $completionTime);

        // 2. Check and award course completion badges
        $this->evaluateAndAwardCourseCompletionBadges($user, $course);

        // 3. Check for level up
        $this->checkAndProcessLevelUp($user);

        // 4. Send course completion notification
        $this->notificationService->sendCourseCompletionNotification($user, $course);

        Log::info('Course completion gamification processed', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'new_total_points' => $user->fresh()->total_points,
            'new_level' => $user->fresh()->level
        ]);
    }

    /**
     * Award points for course completion
     */
    private function awardCourseCompletionPoints($user, $course, int $completionTime): void
    {
        $basePoints = $course->points_per_completion ?? 100;

        // Time-based bonus
        $timeBonus = 0;
        if ($completionTime <= 7) {
            $timeBonus = 50;  // 1 week completion bonus
        } elseif ($completionTime <= 14) {
            $timeBonus = 30;  // 2 weeks completion bonus
        } elseif ($completionTime <= 21) {
            $timeBonus = 15;  // 3 weeks completion bonus
        }

        $totalPoints = $basePoints + $timeBonus;

        Point::awardPoints(
            $user,
            $totalPoints,
            \App\Models\Course::class,
            $course->id,
            "Completed course: {$course->title}" . ($timeBonus > 0 ? " (Speed bonus: +{$timeBonus})" : "")
        );

        Log::info('Course completion points awarded', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'base_points' => $basePoints,
            'time_bonus' => $timeBonus,
            'total_points' => $totalPoints,
            'completion_time_days' => $completionTime
        ]);
    }

    /**
     * Evaluate and award course completion badges
     */
    private function evaluateAndAwardCourseCompletionBadges($user, $course): void
    {
        $badges = $this->badgeService->evaluateCourseCompletionBadges($user, $course);

        foreach ($badges as $badge) {
            Log::info('Course completion badge awarded', [
                'user_id' => $user->id,
                'course_id' => $course->id,
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

            Log::info('User leveled up from course completion', [
                'user_id' => $user->id,
                'old_level' => $oldLevel,
                'new_level' => $newLevel,
                'total_points' => $user->total_points
            ]);
        }
    }

    /**
     * Handle job failure
     */
    public function failed(CourseCompleted $event, \Throwable $exception): void
    {
        Log::error('Course completion gamification job failed', [
            'user_id' => $event->user->id,
            'course_id' => $event->course->id,
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}