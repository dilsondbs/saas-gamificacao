<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BadgeService;

class CreateDefaultBadges extends Command
{
    protected $signature = 'badges:create-default';
    protected $description = 'Criar badges padrão do sistema';

    public function handle()
    {
        $this->info('🏆 Criando badges padrão do sistema...');

        $badgeService = new BadgeService();
        $badgeService->createDefaultBadges();

        $this->info('✅ Badges padrão criadas com sucesso!');
        $this->info('');
        $this->info('📋 Badges criadas:');
        $this->info('• Primeiro Passo (1 atividade)');
        $this->info('• Estudante Dedicado (5 atividades)');
        $this->info('• Colecionador de Pontos (100 pontos)');
        $this->info('• Expert (500 pontos)');

        return 0;
    }
}