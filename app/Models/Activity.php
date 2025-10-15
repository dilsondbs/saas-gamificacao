<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\BelongsToTenant;
class Activity extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'type',
        'points_value',
        'order',
        'content',
        'is_required',
        'duration_minutes',
        'is_active',
        'tenant_id',
    ];

    protected $casts = [
        'points_value' => 'integer',
        'order' => 'integer',
        'is_required' => 'boolean',
        'duration_minutes' => 'integer',
        'is_active' => 'boolean',
        'content' => 'json',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_activities')
                    ->withPivot(['started_at', 'completed_at', 'score', 'attempts', 'metadata'])
                    ->withTimestamps();
    }

    public function userActivities()
    {
        return $this->hasMany(UserActivity::class);
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function getCompletionRateAttribute()
    {
        $totalEnrolled = $this->course->enrollments()->count();
        if ($totalEnrolled === 0) return 0;
        
        $completed = $this->userActivities()->whereNotNull('completed_at')->count();
        return round(($completed / $totalEnrolled) * 100, 2);
    }
}
