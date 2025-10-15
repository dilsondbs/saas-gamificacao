<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LevelUp implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $oldLevel;
    public $newLevel;
    public $pointsAtLevelUp;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, int $oldLevel, int $newLevel, int $pointsAtLevelUp)
    {
        $this->user = $user;
        $this->oldLevel = $oldLevel;
        $this->newLevel = $newLevel;
        $this->pointsAtLevelUp = $pointsAtLevelUp;
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
            'event' => 'level_up',
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'old_level' => $this->oldLevel,
            'new_level' => $this->newLevel,
            'points_at_level_up' => $this->pointsAtLevelUp,
            'level_difference' => $this->newLevel - $this->oldLevel,
            'leveled_up_at' => now()->toISOString()
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'level.up';
    }
}