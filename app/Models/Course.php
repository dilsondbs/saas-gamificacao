<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\CourseMaterial;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image',
        'status',
        'points_per_completion',
        'instructor_id',
    ];

    protected $casts = [
        'points_per_completion' => 'integer',
    ];

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function enrollments()
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    public function enrolledUsers()
    {
        return $this->belongsToMany(User::class, 'course_enrollments')
                    ->withPivot(['enrolled_at', 'completed_at', 'progress_percentage'])
                    ->withTimestamps();
    }

    public function activities()
    {
        return $this->hasMany(Activity::class)->orderBy('order');
    }

    public function materials()
    {
        return $this->hasMany(CourseMaterial::class);
    }

    public function getEnrollmentCountAttribute()
    {
        return $this->enrollments()->count();
    }

    public function getCompletionRateAttribute()
    {
        $totalEnrollments = $this->enrollments()->count();
        if ($totalEnrollments === 0) return 0;
        
        $completedEnrollments = $this->enrollments()->whereNotNull('completed_at')->count();
        return round(($completedEnrollments / $totalEnrollments) * 100, 2);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeByInstructor($query, $instructorId)
    {
        return $query->where('instructor_id', $instructorId);
    }
}
