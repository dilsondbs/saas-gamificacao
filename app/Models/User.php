<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    // Modelo User em banco único com tenant_id

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
        'password_is_temporary',
        'password_changed_at',
        'last_login_at',
        'temporary_token',
        'tenant_id',
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
        'password_is_temporary' => 'boolean',
        'password_changed_at' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    /**
     * Relacionamento com o tenant
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

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

    /**
     * Generate a temporary password and token for first access
     */
    public function generateTemporaryPassword()
    {
        $temporaryPassword = Str::random(8);
        $token = Str::random(32);

        $this->update([
            'password' => Hash::make($temporaryPassword),
            'password_is_temporary' => true,
            'temporary_token' => $token,
            'password_changed_at' => null
        ]);

        return ['password' => $temporaryPassword, 'token' => $token];
    }

    /**
     * Check if password is temporary and needs to be changed
     */
    public function mustChangePassword()
    {
        return $this->password_is_temporary;
    }

    /**
     * Mark password as changed (no longer temporary)
     */
    public function markPasswordAsChanged()
    {
        $this->update([
            'password_is_temporary' => false,
            'password_changed_at' => now(),
            'temporary_token' => null
        ]);
    }

    /**
     * Update last login timestamp
     */
    public function recordLogin()
    {
        $this->update(['last_login_at' => now()]);
    }
}
