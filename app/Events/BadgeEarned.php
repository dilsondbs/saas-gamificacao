<?php

namespace App\Events;

use App\Models\User;
use App\Models\Badge;
use App\Models\UserBadge;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BadgeEarned implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $badge;
    public $userBadge;
    public $isNewBadge;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, Badge $badge, UserBadge $userBadge, bool $isNewBadge = true)
    {
        $this->user = $user;
        $this->badge = $badge;
        $this->userBadge = $userBadge;
        $this->isNewBadge = $isNewBadge;
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
            'event' => 'badge_earned',
            'user_id' => $this->user->id,
            'badge' => [
                'id' => $this->badge->id,
                'name' => $this->badge->name,
                'description' => $this->badge->description,
                'icon' => $this->badge->icon,
                'color' => $this->badge->color,
                'type' => $this->badge->type,
                'points_value' => $this->badge->points_value
            ],
            'earned_at' => $this->userBadge->earned_at?->toISOString(),
            'is_new_badge' => $this->isNewBadge,
            'metadata' => $this->userBadge->metadata
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'badge.earned';
    }
}