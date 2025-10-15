<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\BelongsToTenant;

class FinalChallenge extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'difficulty_level',
        'time_limit_minutes',
        'min_score_percentage',
        'content',
        'badge_id',
        'is_active',
        'tenant_id',
    ];

    protected $casts = [
        'content' => 'json',
        'is_active' => 'boolean',
        'time_limit_minutes' => 'integer',
        'min_score_percentage' => 'integer',
    ];

    /**
     * Relacionamento com Course
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Relacionamento com Badge (premio especial)
     */
    public function badge()
    {
        return $this->belongsTo(Badge::class);
    }

    /**
     * Relacionamento com tentativas
     */
    public function attempts()
    {
        return $this->hasMany(ChallengeAttempt::class, 'challenge_id');
    }

    /**
     * Scope para desafios ativos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Obter percentual mínimo baseado no nível
     */
    public function getMinScoreForLevel($level)
    {
        $scores = [
            'easy' => 60,
            'medium' => 70,
            'hard' => 80,
        ];

        return $scores[$level] ?? $this->min_score_percentage;
    }

    /**
     * Verificar se usuário já passou no desafio
     */
    public function userHasPassed($userId)
    {
        return $this->attempts()
            ->where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->where('score', '>=', $this->min_score_percentage)
            ->exists();
    }

    /**
     * Obter melhor tentativa do usuário
     */
    public function getBestAttempt($userId)
    {
        return $this->attempts()
            ->where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->orderBy('score', 'desc')
            ->first();
    }
}
