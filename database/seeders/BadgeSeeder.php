<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BadgeSeeder extends Seeder
{
    /**
     * Seed de Badges Gamificadas para Cursos
     */
    public function run()
    {
        // Pegar todos os tenants
        $tenants = DB::table('tenants')->pluck('id');

        // Se não houver tenants, criar badges sem tenant_id (para central)
        if ($tenants->isEmpty()) {
            $this->createBadges(null);
        } else {
            // Criar badges para cada tenant
            foreach ($tenants as $tenantId) {
                $this->createBadges($tenantId);
            }
        }
    }

    /**
     * Criar badges para um tenant específico
     */
    private function createBadges($tenantId)
    {
        $badges = [
            // Badges de Iniciante
            [
                'name' => 'Primeiro Passo',
                'description' => 'Completou a primeira lição do curso',
                'icon' => '👣',
                'color' => '#10B981',
                'type' => 'completion',
                'points_value' => 10,
                'criteria' => json_encode(['lessons_completed' => 1]),
                'rarity' => 'common',
                'tenant_id' => $tenantId,
            ],
            [
                'name' => 'Iniciante Dedicado',
                'description' => 'Completou 5 lições',
                'icon' => '🌱',
                'color' => '#10B981',
                'type' => 'completion',
                'points_value' => 25,
                'criteria' => json_encode(['lessons_completed' => 5]),
                'rarity' => 'common',
                'tenant_id' => $tenantId,
            ],
            [
                'name' => 'Aprendiz',
                'description' => 'Completou o primeiro módulo',
                'icon' => '📚',
                'color' => '#3B82F6',
                'type' => 'completion',
                'points_value' => 50,
                'criteria' => json_encode(['modules_completed' => 1]),
                'rarity' => 'common',
                'tenant_id' => $tenantId,
            ],

            // Badges Intermediárias
            [
                'name' => 'Explorador',
                'description' => 'Completou 3 módulos diferentes',
                'icon' => '🗺️',
                'color' => '#3B82F6',
                'type' => 'completion',
                'points_value' => 100,
                'criteria' => json_encode(['modules_completed' => 3]),
                'rarity' => 'rare',
                'tenant_id' => $tenantId,
            ],
            [
                'name' => 'Estudante Dedicado',
                'description' => 'Completou 20 lições',
                'icon' => '📖',
                'color' => '#8B5CF6',
                'type' => 'completion',
                'points_value' => 150,
                'criteria' => json_encode(['lessons_completed' => 20]),
                'rarity' => 'rare',
                'tenant_id' => $tenantId,
            ],
            [
                'name' => 'Quiz Master',
                'description' => 'Acertou 90% ou mais em 5 quizzes',
                'icon' => '🎯',
                'color' => '#8B5CF6',
                'type' => 'completion',
                'points_value' => 200,
                'criteria' => json_encode(['quiz_score' => 90, 'quiz_count' => 5]),
                'rarity' => 'rare',
                'tenant_id' => $tenantId,
            ],

            // Badges Avançadas
            [
                'name' => 'Conquistador',
                'description' => 'Completou um curso inteiro',
                'icon' => '🏆',
                'color' => '#F59E0B',
                'type' => 'completion',
                'points_value' => 300,
                'criteria' => json_encode(['courses_completed' => 1]),
                'rarity' => 'epic',
                'tenant_id' => $tenantId,
            ],
            [
                'name' => 'Maratonista',
                'description' => 'Estudou por 7 dias consecutivos',
                'icon' => '🔥',
                'color' => '#F59E0B',
                'type' => 'streak',
                'points_value' => 250,
                'criteria' => json_encode(['streak_days' => 7]),
                'rarity' => 'epic',
                'tenant_id' => $tenantId,
            ],
            [
                'name' => 'Perfeccionista',
                'description' => 'Conseguiu 100% em 10 atividades',
                'icon' => '💯',
                'color' => '#EF4444',
                'type' => 'completion',
                'points_value' => 350,
                'criteria' => json_encode(['perfect_score_count' => 10]),
                'rarity' => 'epic',
                'tenant_id' => $tenantId,
            ],

            // Badges Lendárias
            [
                'name' => 'Mestre do Conhecimento',
                'description' => 'Completou 5 cursos completos',
                'icon' => '👑',
                'color' => '#FFD700',
                'type' => 'completion',
                'points_value' => 500,
                'criteria' => json_encode(['courses_completed' => 5]),
                'rarity' => 'legendary',
                'tenant_id' => $tenantId,
            ],
            [
                'name' => 'Gênio',
                'description' => 'Acertou 100% em todas as atividades de um curso',
                'icon' => '🧠',
                'color' => '#FFD700',
                'type' => 'completion',
                'points_value' => 600,
                'criteria' => json_encode(['course_perfect_score' => 1]),
                'rarity' => 'legendary',
                'tenant_id' => $tenantId,
            ],
            [
                'name' => 'Lenda da Educação',
                'description' => 'Completou 10 cursos e ganhou todas as outras badges',
                'icon' => '⭐',
                'color' => '#FFD700',
                'type' => 'special',
                'points_value' => 1000,
                'criteria' => json_encode(['courses_completed' => 10, 'all_badges' => true]),
                'rarity' => 'legendary',
                'tenant_id' => $tenantId,
            ],

            // Badges Especiais
            [
                'name' => 'Velocista',
                'description' => 'Completou um módulo em menos de 1 hora',
                'icon' => '⚡',
                'color' => '#06B6D4',
                'type' => 'special',
                'points_value' => 150,
                'criteria' => json_encode(['module_time_limit' => 60]),
                'rarity' => 'rare',
                'tenant_id' => $tenantId,
            ],
            [
                'name' => 'Curioso',
                'description' => 'Acessou materiais complementares 10 vezes',
                'icon' => '🔍',
                'color' => '#06B6D4',
                'type' => 'special',
                'points_value' => 100,
                'criteria' => json_encode(['materials_accessed' => 10]),
                'rarity' => 'rare',
                'tenant_id' => $tenantId,
            ],
            [
                'name' => 'Colaborador',
                'description' => 'Ajudou outros estudantes no fórum',
                'icon' => '🤝',
                'color' => '#10B981',
                'type' => 'special',
                'points_value' => 200,
                'criteria' => json_encode(['forum_helps' => 5]),
                'rarity' => 'epic',
                'tenant_id' => $tenantId,
            ],
        ];

        foreach ($badges as $badge) {
            Badge::create($badge);
        }

        $tenantText = $tenantId ? "tenant {$tenantId}" : "sistema central";
        $this->command->info("✅ " . count($badges) . " badges criadas para {$tenantText}");
    }
}
