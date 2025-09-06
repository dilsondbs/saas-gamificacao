<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Point extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'points',
        'type',
        'source_type',
        'source_id',
        'description',
    ];

    protected $casts = [
        'points' => 'integer',
        'source_id' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function source()
    {
        return $this->morphTo();
    }

    public function scopeEarned($query)
    {
        return $query->where('type', 'earned');
    }

    public function scopeSpent($query)
    {
        return $query->where('type', 'spent');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public static function awardPoints($user, $points, $sourceType, $sourceId, $description = null)
    {
        $point = self::create([
            'user_id' => $user->id,
            'points' => $points,
            'type' => 'earned',
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'description' => $description,
        ]);

        $user->updateTotalPoints();
        
        return $point;
    }
}
