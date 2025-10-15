<?php

namespace App\Listeners;

use App\Events\LevelUp;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendLevelUpNotification implements ShouldQueue
{
    use InteractsWithQueue;

    protected $notificationService;

    /**
     * Create the event listener.
     */
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the event.
     */
    public function handle(LevelUp $event): void
    {
        try {
            $this->notificationService->sendLevelUpNotification(
                $event->user,
                $event->oldLevel,
                $event->newLevel
            );

            Log::info('Level up notification sent', [
                'user_id' => $event->user->id,
                'old_level' => $event->oldLevel,
                'new_level' => $event->newLevel,
                'points_at_level_up' => $event->pointsAtLevelUp
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send level up notification', [
                'user_id' => $event->user->id,
                'old_level' => $event->oldLevel,
                'new_level' => $event->newLevel,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Handle job failure
     */
    public function failed(LevelUp $event, \Throwable $exception): void
    {
        Log::error('Level up notification job failed', [
            'user_id' => $event->user->id,
            'old_level' => $event->oldLevel,
            'new_level' => $event->newLevel,
            'exception' => $exception->getMessage()
        ]);
    }
}