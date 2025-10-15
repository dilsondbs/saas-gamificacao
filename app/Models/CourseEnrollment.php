<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\BelongsToTenant;
class CourseEnrollment extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'user_id',
        'course_id',
        'enrolled_at',
        'completed_at',
        'progress_percentage',
        'tenant_id',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
        'progress_percentage' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function isCompleted()
    {
        return !is_null($this->completed_at);
    }

    public function markAsCompleted()
    {
        $this->update([
            'completed_at' => now(),
            'progress_percentage' => 100,
        ]);
    }
}
