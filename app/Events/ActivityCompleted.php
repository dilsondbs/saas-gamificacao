<?php

namespace App\Events;

use App\Models\User;
use App\Models\Activity;
use App\Models\UserActivity;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ActivityCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $activity;
    public $userActivity;
    public $score;
    public $timeSpent;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, Activity $activity, UserActivity $userActivity, int $score, ?int $timeSpent = null)
    {
        $this->user = $user;
        $this->activity = $activity;
        $this->userActivity = $userActivity;
        $this->score = $score;
        $this->timeSpent = $timeSpent;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->user->id),
            new PrivateChannel('gamification.' . $this->user->id)
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'event' => 'activity_completed',
            'user_id' => $this->user->id,
            'activity_id' => $this->activity->id,
            'activity_title' => $this->activity->title,
            'score' => $this->score,
            'time_spent' => $this->timeSpent,
            'completed_at' => $this->userActivity->completed_at?->toISOString(),
            'course' => [
                'id' => $this->activity->course->id,
                'title' => $this->activity->course->title
            ]
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'activity.completed';
    }
}