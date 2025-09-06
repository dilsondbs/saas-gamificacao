<?php

namespace App\Console\Commands;

use App\Services\AICourseGeneratorService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TestAICourseGeneration extends Command
{
    protected $signature = 'ai:test-course-generation';
    protected $description = 'Test AI course generation functionality';

    public function handle()
    {
        $this->info('🤖 Testando sistema de geração de cursos com IA...');
        
        // Check if API key is configured
        $apiKey = config('services.gemini.api_key');
        if (empty($apiKey) || $apiKey === 'your_gemini_api_key_here') {
            $this->error('❌ Chave da API Gemini não configurada.');
            $this->info('💡 Configure GEMINI_API_KEY no arquivo .env');
            return 1;
        }
        
        $this->info('✅ Chave da API Gemini configurada.');
        
        // Test content validation
        $aiService = new AICourseGeneratorService();
        
        $testContent = "Este é um conteúdo de teste para geração de curso sobre programação em PHP. 
        PHP é uma linguagem de programação muito utilizada para desenvolvimento web.
        
        Módulo 1: Introdução ao PHP
        - Sintaxe básica
        - Variáveis e tipos
        - Operadores
        
        Módulo 2: Estruturas de Controle
        - if/else
        - loops
        - switch
        
        Módulo 3: Funções
        - Declaração de funções
        - Parâmetros
        - Retorno de valores
        
        Módulo 4: Arrays
        - Arrays indexados
        - Arrays associativos
        - Manipulação de arrays
        
        Módulo 5: Orientação a Objetos
        - Classes e objetos
        - Propriedades e métodos
        - Herança";
        
        $this->info('✅ Testando validação de tamanho de conteúdo...');
        if (!$aiService->validateContentSize($testContent)) {
            $this->error('❌ Validação de tamanho falhou');
            return 1;
        }
        $this->info('✅ Validação de tamanho passou.');
        
        // Test prompt generation
        $this->info('✅ Testando geração de prompt...');
        try {
            $prompt = $aiService->buildCourseGenerationPrompt($testContent);
            $this->info('✅ Prompt gerado com sucesso.');
            $this->line('Tamanho do prompt: ' . strlen($prompt) . ' caracteres');
        } catch (\Exception $e) {
            $this->error('❌ Erro ao gerar prompt: ' . $e->getMessage());
            return 1;
        }
        
        // Test API call (only if API key is properly configured)
        if ($apiKey !== 'your_gemini_api_key_here') {
            $this->info('⚡ Testando chamada à API Gemini...');
            $this->warn('⚠️  Esta operação pode demorar alguns segundos...');
            
            try {
                $response = $aiService->callGeminiAPI($prompt);
                $this->info('✅ Chamada à API bem-sucedida.');
                $this->line('Tamanho da resposta: ' . strlen($response) . ' caracteres');
                
                // Test response parsing
                $this->info('✅ Testando parsing da resposta...');
                $courseData = $aiService->parseCourseResponse($response);
                $this->info('✅ Parsing bem-sucedido.');
                
                $this->table(['Campo', 'Valor'], [
                    ['Título', $courseData['title'] ?? 'N/A'],
                    ['Descrição', substr($courseData['description'] ?? 'N/A', 0, 50) . '...'],
                    ['Pontos', $courseData['points_per_completion'] ?? 'N/A'],
                    ['Número de módulos', count($courseData['modules'] ?? [])],
                ]);
                
            } catch (\Exception $e) {
                $this->error('❌ Erro na chamada à API: ' . $e->getMessage());
                $this->info('💡 Verifique se a chave da API está correta e tem créditos disponíveis.');
                return 1;
            }
        } else {
            $this->warn('⚠️  Pulando teste da API - configure a chave primeiro');
        }
        
        // Check required models
        $this->info('✅ Verificando modelos necessários...');
        $requiredModels = [
            'App\Models\Course',
            'App\Models\Activity', 
            'App\Models\Badge',
            'App\Models\User'
        ];
        
        foreach ($requiredModels as $model) {
            if (class_exists($model)) {
                $this->info("✅ $model - OK");
            } else {
                $this->error("❌ $model - NÃO ENCONTRADO");
            }
        }
        
        // Check service dependencies
        $this->info('✅ Verificando dependências do serviço...');
        $dependencies = [
            'GuzzleHttp\Client' => 'Guzzle HTTP Client',
            'Illuminate\Support\Facades\Log' => 'Laravel Log Facade',
            'Illuminate\Support\Facades\Config' => 'Laravel Config Facade'
        ];
        
        foreach ($dependencies as $class => $name) {
            if (class_exists($class)) {
                $this->info("✅ $name - OK");
            } else {
                $this->error("❌ $name - NÃO ENCONTRADO");
            }
        }
        
        $this->info('');
        $this->info('🎉 Teste completo!');
        $this->info('');
        $this->info('📋 Próximos passos:');
        $this->line('1. Configure GEMINI_API_KEY no .env com sua chave real');
        $this->line('2. Execute as migrações: php artisan migrate');
        $this->line('3. Acesse /instructor/courses/ai/create para testar a interface');
        $this->line('4. Use um usuário com role "instructor" para acessar');
        
        return 0;
    }
}