<?php

namespace App\Console\Commands;

use App\Services\GeminiAIService;
use Illuminate\Console\Command;

class TestEduAIGeneration extends Command
{
    protected $signature = 'eduai:test-generation';
    protected $description = 'Test EduAI course generation with real example';

    public function handle()
    {
        $this->info('🤖 TESTE REAL DO EDUAI - GERAÇÃO DE CURSO');
        $this->info('==========================================');
        $this->newLine();

        $service = new GeminiAIService();

        try {
            $this->info('📝 Gerando curso de matemática para crianças...');
            $this->warn('⏳ Aguarde, consultando a IA...');

            $result = $service->generateCourse(
                'Curso de Matemática Básica para crianças de 8-10 anos, focando em adição, subtração e tabuada de forma lúdica e interativa com jogos educativos',
                'Crianças de 8-10 anos',
                'beginner'
            );

            $this->newLine();
            $this->info('✅ CURSO GERADO COM SUCESSO!');
            $this->line('=============================');

            $this->newLine();
            $this->line('📚 TÍTULO: ' . $result['title']);
            $this->line('📖 DESCRIÇÃO: ' . $result['description']);
            $this->line('⏱️ DURAÇÃO: ' . $result['duration_hours'] . ' horas');
            $this->line('🎯 PÚBLICO: ' . $result['target_audience']);
            $this->line('📊 DIFICULDADE: ' . $result['difficulty']);
            $this->line('📝 MÓDULOS: ' . count($result['modules']));

            $this->newLine();
            $this->info('📋 ESTRUTURA DO CURSO:');
            $this->line('=====================');

            foreach ($result['modules'] as $index => $module) {
                $this->newLine();
                $this->line(($index + 1) . '. ' . $module['title']);
                $this->line('   📝 ' . $module['description']);

                if (isset($module['lessons']) && is_array($module['lessons'])) {
                    $this->line('   📚 Aulas (' . count($module['lessons']) . '):');
                    foreach ($module['lessons'] as $lessonIndex => $lesson) {
                        $this->line('      ' . ($lessonIndex + 1) . '.1 ' . $lesson['title'] . ' (' . $lesson['duration_minutes'] . 'min)');
                        $this->line('          📄 ' . substr($lesson['content'], 0, 100) . '...');
                    }
                }
            }

            $this->newLine();
            $this->info('🎯 OBJETIVOS DE APRENDIZAGEM:');
            foreach ($result['learning_objectives'] as $objective) {
                $this->line('   • ' . $objective);
            }

            $this->newLine();
            $this->info('📋 PRÉ-REQUISITOS:');
            foreach ($result['prerequisites'] as $prereq) {
                $this->line('   • ' . $prereq);
            }

            $this->newLine();
            $this->info('📊 MÉTODOS DE AVALIAÇÃO:');
            foreach ($result['assessment_methods'] as $method) {
                $this->line('   • ' . $method);
            }

        } catch (\Exception $e) {
            $this->newLine();
            $this->error('❌ ERRO: ' . $e->getMessage());
            $this->line('📍 Arquivo: ' . $e->getFile() . ':' . $e->getLine());
        }

        $this->newLine();
        $this->info('🏁 TESTE CONCLUÍDO!');

        return 0;
    }
}