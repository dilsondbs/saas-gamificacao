<?php

namespace App\Events;

use App\Models\User;
use App\Models\Course;
use App\Models\CourseEnrollment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CourseCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $course;
    public $enrollment;
    public $completionTime;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, Course $course, CourseEnrollment $enrollment)
    {
        $this->user = $user;
        $this->course = $course;
        $this->enrollment = $enrollment;
        $this->completionTime = now()->diffInDays($enrollment->enrolled_at);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->user->id),
            new PrivateChannel('gamification.' . $this->user->id),
            new Channel('course.' . $this->course->id) // For instructor notifications
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'event' => 'course_completed',
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
            'enrolled_at' => $this->enrollment->enrolled_at->toISOString(),
            'completed_at' => $this->enrollment->completed_at?->toISOString(),
            'completion_time_days' => $this->completionTime,
            'progress_percentage' => $this->enrollment->progress_percentage
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'course.completed';
    }
}