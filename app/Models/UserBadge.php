<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class UserBadge extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'badge_id',
        'earned_at',
        'metadata',
    ];

    protected $casts = [
        'earned_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function badge()
    {
        return $this->belongsTo(Badge::class);
    }

    public static function awardBadge($user, $badge, $metadata = null)
    {
        $userBadge = self::firstOrCreate(
            ['user_id' => $user->id, 'badge_id' => $badge->id],
            [
                'earned_at' => now(),
                'metadata' => $metadata,
            ]
        );

        // Award points for badge if it has points value
        if ($badge->points_value > 0) {
            Point::awardPoints(
                $user,
                $badge->points_value,
                Badge::class,
                $badge->id,
                "Earned badge: {$badge->name}"
            );
        }

        return $userBadge;
    }
}
