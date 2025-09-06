<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    // Note: BelongsToTenant não é necessário pois cada tenant tem sua própria base de dados

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'total_points',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'total_points' => 'integer',
    ];

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isInstructor()
    {
        return $this->role === 'instructor';
    }

    public function isStudent()
    {
        return $this->role === 'student';
    }

    public function courses()
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    public function enrollments()
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    public function enrolledCourses()
    {
        return $this->belongsToMany(Course::class, 'course_enrollments')
                    ->withPivot(['enrolled_at', 'completed_at', 'progress_percentage'])
                    ->withTimestamps();
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
                    ->withPivot(['earned_at', 'metadata'])
                    ->withTimestamps();
    }

    public function points()
    {
        return $this->hasMany(Point::class);
    }

    public function activities()
    {
        return $this->belongsToMany(Activity::class, 'user_activities')
                    ->withPivot(['started_at', 'completed_at', 'score', 'attempts', 'metadata'])
                    ->withTimestamps();
    }

    public function updateTotalPoints()
    {
        $totalPoints = $this->points()->where('type', 'earned')->sum('points') 
                     - $this->points()->where('type', 'spent')->sum('points');
        $this->update(['total_points' => max(0, $totalPoints)]);
    }
}
