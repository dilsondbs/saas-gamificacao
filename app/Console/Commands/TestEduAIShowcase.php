<?php

namespace App\Console\Commands;

use App\Services\GeminiAIService;
use Illuminate\Console\Command;

class TestEduAIShowcase extends Command
{
    protected $signature = 'eduai:showcase';
    protected $description = 'Showcase EduAI improvements with specific examples';

    public function handle()
    {
        $this->info('🎪 SHOWCASE EDUAI - DEMONSTRAÇÃO DE MELHORIAS');
        $this->info('=============================================');
        $this->newLine();

        $service = new GeminiAIService();

        // Teste 1: Curso para diferentes públicos
        $this->testDifferentAudiences($service);

        // Teste 2: Diferentes níveis de dificuldade
        $this->testDifferentDifficulties($service);

        // Teste 3: Detecção inteligente de assunto
        $this->testSubjectDetection($service);

        $this->newLine();
        $this->info('🎉 SHOWCASE CONCLUÍDO!');
        $this->info('💡 O EduAI agora gera conteúdo CONTEXTUALIZADO e PERSONALIZADO!');

        return 0;
    }

    private function testDifferentAudiences($service)
    {
        $this->info('📊 TESTE 1: ADAPTAÇÃO POR PÚBLICO-ALVO');
        $this->line('=========================================');

        $testCases = [
            ['description' => 'Curso de Excel básico', 'audience' => 'Crianças de 8-12 anos', 'difficulty' => 'beginner'],
            ['description' => 'Curso de Excel básico', 'audience' => 'Profissionais de RH', 'difficulty' => 'intermediate'],
            ['description' => 'Curso de Excel básico', 'audience' => 'CEOs e Diretores', 'difficulty' => 'advanced']
        ];

        foreach ($testCases as $index => $case) {
            $this->newLine();
            $this->warn("Teste " . ($index + 1) . ".{$index}: {$case['audience']}");

            try {
                $result = $service->generateCourse($case['description'], $case['audience'], $case['difficulty']);

                $this->line("   🎯 Título: " . $result['title']);
                $this->line("   📝 Módulos: " . count($result['modules']));
                $this->line("   ⏱️  Duração: " . $result['duration_hours'] . 'h');
                $this->line("   👥 Público: " . $result['target_audience']);
                $this->line("   📊 Dificuldade: " . $result['difficulty']);

            } catch (\Exception $e) {
                $this->error("   ❌ Erro: " . $e->getMessage());
            }
        }
    }

    private function testDifferentDifficulties($service)
    {
        $this->newLine();
        $this->info('🎚️  TESTE 2: ADAPTAÇÃO POR NÍVEL DE DIFICULDADE');
        $this->line('==============================================');

        $difficulties = ['beginner', 'intermediate', 'advanced'];

        foreach ($difficulties as $difficulty) {
            $this->newLine();
            $this->warn("Teste 2.{$difficulty}: Nível {$difficulty}");

            try {
                $result = $service->generateCourse(
                    'Curso de JavaScript moderno',
                    'Desenvolvedores web',
                    $difficulty
                );

                $this->line("   📚 Título: " . $result['title']);
                $this->line("   🔢 Módulos: " . count($result['modules']));
                $this->line("   ⏱️  Duração: " . $result['duration_hours'] . 'h');
                $this->line("   📋 Pré-requisitos: " . implode(', ', $result['prerequisites']));

                // Mostrar diferença nos módulos
                $this->line("   📖 Primeiros módulos:");
                foreach (array_slice($result['modules'], 0, 2) as $module) {
                    $this->line("      • " . $module['title']);
                }

            } catch (\Exception $e) {
                $this->error("   ❌ Erro: " . $e->getMessage());
            }
        }
    }

    private function testSubjectDetection($service)
    {
        $this->newLine();
        $this->info('🔍 TESTE 3: DETECÇÃO INTELIGENTE DE ASSUNTO');
        $this->line('==========================================');

        $testCases = [
            'Aprenda matemática básica com jogos e diversão',
            'Programação Python para análise de dados',
            'Marketing digital e redes sociais para empresas',
            'Curso de inglês conversacional para viagens'
        ];

        foreach ($testCases as $index => $description) {
            $this->newLine();
            $this->warn("Teste 3." . ($index + 1) . ": {$description}");

            try {
                $result = $service->generateCourse($description, null, 'intermediate');

                $this->line("   🎯 Título gerado: " . $result['title']);
                $this->line("   📚 Assunto detectado: " . $this->extractSubjectFromTitle($result['title']));
                $this->line("   🎓 Primeiro módulo: " . $result['modules'][0]['title']);

            } catch (\Exception $e) {
                $this->error("   ❌ Erro: " . $e->getMessage());
            }
        }
    }

    private function extractSubjectFromTitle($title)
    {
        if (strpos($title, 'Matemática') !== false) return 'Matemática';
        if (strpos($title, 'Python') !== false || strpos($title, 'Programação') !== false) return 'Programação';
        if (strpos($title, 'Marketing') !== false) return 'Marketing';
        if (strpos($title, 'Inglês') !== false) return 'Inglês';
        return 'Geral';
    }
}