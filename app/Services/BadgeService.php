<?php

namespace App\Services;

use App\Models\User;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\UserActivity;
use App\Models\Point;
use Illuminate\Support\Facades\Log;

class BadgeService
{
    /**
     * Verificar e conceder badges para um usuário
     */
    public function checkAndAwardBadges(User $user)
    {
        Log::info('🏆 BadgeService: Verificando badges para usuário', [
            'user_id' => $user->id,
            'user_name' => $user->name
        ]);

        // Buscar badges ativas que o usuário ainda não possui
        $availableBadges = Badge::where('is_active', true)->get();
        $userBadgeIds = UserBadge::where('user_id', $user->id)->pluck('badge_id')->toArray();

        $badgesAwarded = 0;

        foreach ($availableBadges as $badge) {
            // Pular se já possui essa badge
            if (in_array($badge->id, $userBadgeIds)) {
                continue;
            }

            // Verificar se atende aos critérios
            if ($this->meetsRequirements($user, $badge)) {
                $this->awardBadge($user, $badge);
                $badgesAwarded++;
            }
        }

        Log::info('✅ BadgeService: Verificação concluída', [
            'user_id' => $user->id,
            'badges_awarded' => $badgesAwarded
        ]);

        return $badgesAwarded;
    }

    /**
     * Verificar se usuário atende aos critérios da badge
     */
    private function meetsRequirements(User $user, Badge $badge)
    {
        if (!$badge->criteria) {
            return false;
        }

        $criteria = is_string($badge->criteria) ? json_decode($badge->criteria, true) : $badge->criteria;
        $type = $criteria['type'] ?? null;
        $targetValue = $criteria['target_value'] ?? 1;

        switch ($type) {
            case 'points':
                return $user->total_points >= $targetValue;

            case 'completion':
                $completedActivities = UserActivity::where('user_id', $user->id)
                    ->whereNotNull('completed_at')
                    ->count();
                return $completedActivities >= $targetValue;

            case 'streak':
                // Implementar cálculo de streak futuramente
                return false;

            case 'course_completion':
                // Badge por completar um curso específico
                $courseId = $criteria['course_id'] ?? null;
                if (!$courseId) return false;

                $totalActivities = \App\Models\Activity::where('course_id', $courseId)->count();
                $completedActivities = UserActivity::where('user_id', $user->id)
                    ->whereHas('activity', function($query) use ($courseId) {
                        $query->where('course_id', $courseId);
                    })
                    ->whereNotNull('completed_at')
                    ->count();

                return $totalActivities > 0 && $completedActivities >= $totalActivities;

            case 'perfect_score':
                // Badge por tirar nota máxima
                $perfectScores = UserActivity::where('user_id', $user->id)
                    ->whereNotNull('completed_at')
                    ->where('score', '>=', $targetValue)
                    ->count();
                return $perfectScores >= ($criteria['required_perfect_scores'] ?? 1);

            default:
                return false;
        }
    }

    /**
     * Conceder badge ao usuário
     */
    private function awardBadge(User $user, Badge $badge)
    {
        try {
            // Criar relacionamento UserBadge
            UserBadge::create([
                'user_id' => $user->id,
                'badge_id' => $badge->id,
                'awarded_at' => now(),
                'awarded_reason' => $this->generateAwardReason($badge)
            ]);

            // Dar pontos da badge
            if ($badge->points_value > 0) {
                $user->increment('total_points', $badge->points_value);

                Point::create([
                    'user_id' => $user->id,
                    'points' => $badge->points_value,
                    'source_type' => Badge::class,
                    'source_id' => $badge->id,
                    'description' => "Badge conquistada: {$badge->name}"
                ]);
            }

            Log::info('🎉 Badge concedida!', [
                'user_id' => $user->id,
                'badge_name' => $badge->name,
                'points_awarded' => $badge->points_value
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro ao conceder badge', [
                'user_id' => $user->id,
                'badge_id' => $badge->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Gerar texto da razão do prêmio
     */
    private function generateAwardReason(Badge $badge)
    {
        $criteria = is_string($badge->criteria) ? json_decode($badge->criteria, true) : $badge->criteria;
        $type = $criteria['type'] ?? 'unknown';
        $targetValue = $criteria['target_value'] ?? 1;

        switch ($type) {
            case 'points':
                return "Atingiu {$targetValue} pontos";
            case 'completion':
                return "Completou {$targetValue} atividades";
            case 'course_completion':
                return "Completou um curso inteiro";
            case 'perfect_score':
                return "Atingiu pontuação perfeita";
            default:
                return "Atendeu aos critérios da badge";
        }
    }

    /**
     * Criar badges padrão do sistema
     */
    public function createDefaultBadges()
    {
        $defaultBadges = [
            [
                'name' => 'Primeiro Passo',
                'description' => 'Completou sua primeira atividade',
                'icon' => '🌟',
                'color' => '#4CAF50',
                'type' => 'completion',
                'points_value' => 25,
                'criteria' => ['type' => 'completion', 'target_value' => 1],
                'rarity' => 'common',
                'is_active' => true
            ],
            [
                'name' => 'Estudante Dedicado',
                'description' => 'Completou 5 atividades',
                'icon' => '📚',
                'color' => '#2196F3',
                'type' => 'completion',
                'points_value' => 50,
                'criteria' => ['type' => 'completion', 'target_value' => 5],
                'rarity' => 'common',
                'is_active' => true
            ],
            [
                'name' => 'Colecionador de Pontos',
                'description' => 'Acumulou 100 pontos',
                'icon' => '💎',
                'color' => '#FF9800',
                'type' => 'points',
                'points_value' => 75,
                'criteria' => ['type' => 'points', 'target_value' => 100],
                'rarity' => 'rare',
                'is_active' => true
            ],
            [
                'name' => 'Expert',
                'description' => 'Acumulou 500 pontos',
                'icon' => '🏆',
                'color' => '#FFD700',
                'type' => 'points',
                'points_value' => 200,
                'criteria' => ['type' => 'points', 'target_value' => 500],
                'rarity' => 'epic',
                'is_active' => true
            ]
        ];

        foreach ($defaultBadges as $badgeData) {
            Badge::firstOrCreate(
                ['name' => $badgeData['name']],
                $badgeData
            );
        }

        Log::info('✅ Badges padrão criadas/verificadas');
    }
}