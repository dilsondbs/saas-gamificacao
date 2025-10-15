<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\BelongsToTenant;

class UserActivity extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'user_activities';

    protected $fillable = [
        'user_id',
        'activity_id',
        'tenant_id',
        'started_at',
        'completed_at',
        'score',
        'attempts',
        'metadata',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'score' => 'integer',
        'attempts' => 'integer',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function isCompleted()
    {
        return !is_null($this->completed_at);
    }

    public function markAsCompleted($score = null)
    {
        $this->update([
            'completed_at' => now(),
            'score' => $score,
        ]);

        // Award points for activity completion
        Point::awardPoints(
            $this->user,
            $this->activity->points_value,
            Activity::class,
            $this->activity_id,
            "Completed activity: {$this->activity->title}"
        );
    }

    public function scopeCompleted($query)
    {
        return $query->whereNotNull('completed_at');
    }

    public function scopeInProgress($query)
    {
        return $query->whereNotNull('started_at')->whereNull('completed_at');
    }
}
