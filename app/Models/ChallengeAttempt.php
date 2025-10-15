<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\BelongsToTenant;

class ChallengeAttempt extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'user_id',
        'challenge_id',
        'level',
        'score',
        'questions',
        'answers',
        'time_spent',
        'completed_at',
        'tenant_id',
    ];

    protected $casts = [
        'questions' => 'json',
        'answers' => 'json',
        'score' => 'decimal:2',
        'time_spent' => 'integer',
        'completed_at' => 'datetime',
    ];

    /**
     * Relacionamento com User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relacionamento com FinalChallenge
     */
    public function challenge()
    {
        return $this->belongsTo(FinalChallenge::class, 'challenge_id');
    }

    /**
     * Verificar se passou no desafio
     */
    public function isPassed()
    {
        if (!$this->completed_at || !$this->challenge) {
            return false;
        }

        $minScore = $this->challenge->getMinScoreForLevel($this->level);
        return $this->score >= $minScore;
    }

    /**
     * Verificar se está completo
     */
    public function isCompleted()
    {
        return !is_null($this->completed_at);
    }

    /**
     * Calcular tempo formatado
     */
    public function getFormattedTimeAttribute()
    {
        $minutes = floor($this->time_spent / 60);
        $seconds = $this->time_spent % 60;

        if ($minutes > 0) {
            return sprintf('%d min %d seg', $minutes, $seconds);
        }

        return sprintf('%d seg', $seconds);
    }

    /**
     * Obter grade (conceito) baseado no score
     */
    public function getGradeAttribute()
    {
        if ($this->score >= 90) return 'A+';
        if ($this->score >= 80) return 'A';
        if ($this->score >= 70) return 'B';
        if ($this->score >= 60) return 'C';
        if ($this->score >= 50) return 'D';
        return 'F';
    }

    /**
     * Scope para tentativas completadas
     */
    public function scopeCompleted($query)
    {
        return $query->whereNotNull('completed_at');
    }

    /**
     * Scope para tentativas aprovadas
     */
    public function scopePassed($query)
    {
        return $query->completed()->where(function($q) {
            $q->where('score', '>=', 60); // Score mínimo geral
        });
    }
}
