<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\BelongsToTenant;

class ChallengeMotivation extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'course_id',
        'message',
        'confirmed_at',
        'points_doubled',
        'tenant_id',
    ];

    protected $casts = [
        'confirmed_at' => 'datetime',
        'points_doubled' => 'boolean',
    ];

    /**
     * Relacionamento com User (remetente)
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Relacionamento com User (destinatário)
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Relacionamento com Course
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Verificar se já foi confirmada
     */
    public function isConfirmed()
    {
        return !is_null($this->confirmed_at);
    }

    /**
     * Confirmar motivação e dobrar pontos
     */
    public function confirm()
    {
        if ($this->isConfirmed()) {
            return false; // Já confirmada
        }

        // Marcar como confirmada
        $this->confirmed_at = now();
        $this->save();

        // Dobrar pontos do destinatário se ainda não dobrou
        if (!$this->points_doubled) {
            $receiver = $this->receiver;

            // Buscar tentativa aprovada mais recente do curso
            $attempt = ChallengeAttempt::where('user_id', $receiver->id)
                ->whereHas('challenge', function($query) {
                    $query->where('course_id', $this->course_id);
                })
                ->completed()
                ->passed()
                ->latest()
                ->first();

            if ($attempt) {
                // Dobrar os pontos ganhos nessa tentativa
                $pointsEarned = $attempt->challenge->badge ? $attempt->challenge->badge->points_value : 100;
                $bonusPoints = $pointsEarned; // Dobrar = adicionar mesma quantidade

                $receiver->increment('total_points', $bonusPoints);

                // Registrar pontos
                try {
                    Point::create([
                        'user_id' => $receiver->id,
                        'points' => $bonusPoints,
                        'source_type' => ChallengeMotivation::class,
                        'source_id' => $this->id,
                        'description' => "Bônus de motivação de {$this->sender->name}"
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Erro ao criar pontos de motivação: ' . $e->getMessage());
                }

                $this->points_doubled = true;
                $this->save();

                \Log::info('🎉 Pontos dobrados por motivação', [
                    'sender_id' => $this->sender_id,
                    'receiver_id' => $this->receiver_id,
                    'bonus_points' => $bonusPoints
                ]);

                return true;
            }
        }

        return false;
    }

    /**
     * Scope para motivações pendentes
     */
    public function scopePending($query)
    {
        return $query->whereNull('confirmed_at');
    }

    /**
     * Scope para motivações confirmadas
     */
    public function scopeConfirmed($query)
    {
        return $query->whereNotNull('confirmed_at');
    }

    /**
     * Scope para motivações recebidas por um usuário
     */
    public function scopeReceivedBy($query, $userId)
    {
        return $query->where('receiver_id', $userId);
    }

    /**
     * Scope para motivações enviadas por um usuário
     */
    public function scopeSentBy($query, $userId)
    {
        return $query->where('sender_id', $userId);
    }
}
