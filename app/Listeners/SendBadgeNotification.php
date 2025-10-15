<?php

namespace App\Listeners;

use App\Events\BadgeEarned;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendBadgeNotification implements ShouldQueue
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
    public function handle(BadgeEarned $event): void
    {
        try {
            if ($event->isNewBadge) {
                $this->notificationService->sendBadgeEarnedNotification($event->user, $event->badge);

                Log::info('Badge earned notification sent', [
                    'user_id' => $event->user->id,
                    'badge_id' => $event->badge->id,
                    'badge_name' => $event->badge->name
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to send badge earned notification', [
                'user_id' => $event->user->id,
                'badge_id' => $event->badge->id,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Handle job failure
     */
    public function failed(BadgeEarned $event, \Throwable $exception): void
    {
        Log::error('Badge notification job failed', [
            'user_id' => $event->user->id,
            'badge_id' => $event->badge->id,
            'exception' => $exception->getMessage()
        ]);
    }
}