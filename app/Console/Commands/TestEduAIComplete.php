<?php

namespace App\Console\Commands;

use App\Services\GeminiAIService;
use Illuminate\Console\Command;

class TestEduAIComplete extends Command
{
    protected $signature = 'eduai:test-complete';
    protected $description = 'Test complete EduAI package generation';

    public function handle()
    {
        $this->info('🤖 TESTE COMPLETO DO EDUAI - PACOTE EDUCACIONAL');
        $this->info('================================================');

        $service = new GeminiAIService();

        // 1. Teste de Curso
        $this->newLine();
        $this->info('1. 📚 TESTANDO GERAÇÃO DE CURSO...');
        $this->testCourseGeneration($service);

        // 2. Teste de Atividades
        $this->newLine();
        $this->info('2. 🎮 TESTANDO GERAÇÃO DE ATIVIDADES...');
        $this->testActivitiesGeneration($service);

        // 3. Teste de Badges
        $this->newLine();
        $this->info('3. 🏆 TESTANDO GERAÇÃO DE BADGES...');
        $this->testBadgesGeneration($service);

        // 4. Teste de Canvas
        $this->newLine();
        $this->info('4. 🎨 TESTANDO GERAÇÃO DE CANVAS...');
        $this->testCanvasGeneration($service);

        $this->newLine();
        $this->info('🎉 TODOS OS TESTES CONCLUÍDOS!');
        return 0;
    }

    private function testCourseGeneration($service)
    {
        try {
            $result = $service->generateCourse(
                'Curso de Programação Python para Iniciantes - aprenda desde variáveis até orientação a objetos',
                'Jovens de 16-25 anos',
                'beginner'
            );

            $this->line('   ✅ Título: ' . $result['title']);
            $this->line('   📝 Módulos: ' . count($result['modules']));
            $this->line('   ⏱️ Duração: ' . $result['duration_hours'] . 'h');

        } catch (\Exception $e) {
            $this->error('   ❌ Erro: ' . $e->getMessage());
        }
    }

    private function testActivitiesGeneration($service)
    {
        try {
            $result = $service->generateGamifiedActivities(
                'Python Básico',
                'Variáveis e Tipos de Dados',
                3
            );

            if (isset($result['activities'])) {
                $this->line('   ✅ Atividades geradas: ' . count($result['activities']));
                foreach ($result['activities'] as $activity) {
                    $this->line('      • ' . $activity['title'] . ' (' . $activity['points'] . ' pts)');
                }
            }

        } catch (\Exception $e) {
            $this->error('   ❌ Erro: ' . $e->getMessage());
        }
    }

    private function testBadgesGeneration($service)
    {
        try {
            $result = $service->generateBadges(
                'Python Básico',
                ['Variáveis', 'Condicionais', 'Loops']
            );

            if (isset($result['badges'])) {
                $this->line('   ✅ Badges geradas: ' . count($result['badges']));
                foreach ($result['badges'] as $badge) {
                    $this->line('      🏆 ' . $badge['name'] . ' (' . $badge['points'] . ' pts) - ' . $badge['rarity']);
                }
            }

        } catch (\Exception $e) {
            $this->error('   ❌ Erro: ' . $e->getMessage());
        }
    }

    private function testCanvasGeneration($service)
    {
        try {
            $result = $service->generateCanvasContent(
                'Estruturas de Dados em Python',
                'mindmap'
            );

            if (isset($result['canvas'])) {
                $this->line('   ✅ Canvas: ' . $result['canvas']['title']);
                $this->line('   🎨 Tipo: ' . $result['canvas']['type']);
                $this->line('   📊 Elementos: ' . count($result['canvas']['elements']));
            }

        } catch (\Exception $e) {
            $this->error('   ❌ Erro: ' . $e->getMessage());
        }
    }
}