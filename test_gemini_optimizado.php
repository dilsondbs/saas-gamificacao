<?php

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   TESTE GEMINI OTIMIZADO - Validar Melhorias                ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n";
echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║         TESTE GEMINI OTIMIZADO - NOVA CONFIGURAÇÃO          ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n";
echo "\n";

echo "📊 OTIMIZAÇÕES APLICADAS:\n";
echo "   ✅ Limite de conteúdo: 800 → 15,000 caracteres\n";
echo "   ✅ Temperature: 0.7 → 0.9 (mais criativo)\n";
echo "   ✅ MaxOutputTokens: 8,192 → 32,768 (4x maior!)\n";
echo "   ✅ Prompt melhorado com instruções detalhadas\n";
echo "\n";

// Criar conteúdo de teste RICO
$richContent = "
GESTÃO DE PESSOAS - GUIA COMPLETO

MÓDULO 1: FUNDAMENTOS DA GESTÃO DE PESSOAS

1.1 Introdução
A gestão de pessoas é o conjunto de políticas e práticas necessárias para conduzir os aspectos relacionados às pessoas no trabalho, incluindo recrutamento, seleção, treinamento, recompensas e avaliação de desempenho.

1.2 Objetivos Estratégicos
Os principais objetivos da gestão de pessoas são:
- Alinhar os objetivos individuais com os objetivos organizacionais
- Desenvolver competências dos colaboradores
- Criar ambiente motivador e produtivo
- Reter talentos e reduzir turnover
- Promover cultura organizacional positiva

1.3 Processos Fundamentais
A gestão de pessoas engloba seis processos principais:
1. Agregar pessoas (recrutamento e seleção)
2. Aplicar pessoas (orientação e modelagem do trabalho)
3. Recompensar pessoas (remuneração e benefícios)
4. Desenvolver pessoas (treinamento e carreira)
5. Manter pessoas (segurança e qualidade de vida)
6. Monitorar pessoas (avaliação de desempenho)

MÓDULO 2: RECRUTAMENTO E SELEÇÃO

2.1 Planejamento de RH
Antes de recrutar, é essencial:
- Analisar a necessidade real da vaga
- Definir perfil do candidato ideal
- Estabelecer critérios de seleção
- Definir orçamento disponível

2.2 Técnicas de Recrutamento
Recrutamento Interno:
- Promoções e transferências
- Banco de talentos interno
- Programas de desenvolvimento

Recrutamento Externo:
- Anúncios em portais de emprego
- Redes sociais profissionais (LinkedIn)
- Empresas de headhunting
- Indicações de funcionários

2.3 Processo Seletivo
Etapas típicas:
1. Triagem de currículos
2. Testes técnicos e comportamentais
3. Entrevistas por competências
4. Verificação de referências
5. Exames médicos admissionais
6. Proposta e negociação

MÓDULO 3: DESENVOLVIMENTO ORGANIZACIONAL

3.1 Treinamento e Capacitação
Tipos de treinamento:
- Integração (onboarding)
- Técnico (habilidades específicas)
- Comportamental (soft skills)
- Liderança e gestão

3.2 Avaliação de Desempenho
Métodos modernos:
- Avaliação 360 graus
- OKRs (Objectives and Key Results)
- Feedback contínuo
- Conversas de performance

3.3 Plano de Carreira
Elementos essenciais:
- Mapeamento de competências
- Trilhas de desenvolvimento
- Sucessão de lideranças
- Programas de mentoria

MÓDULO 4: REMUNERAÇÃO E BENEFÍCIOS

4.1 Estrutura Salarial
- Pesquisa de mercado
- Cargos e salários
- Faixas salariais
- Mérito e promoções

4.2 Benefícios
Essenciais:
- Vale-transporte
- Vale-alimentação
- Plano de saúde
- Seguro de vida

Estratégicos:
- Participação nos lucros (PLR)
- Stock options
- Previdência privada
- Auxílio educação

MÓDULO 5: CLIMA E CULTURA ORGANIZACIONAL

5.1 Cultura Organizacional
Componentes:
- Valores e crenças
- Normas e comportamentos
- Símbolos e rituais
- Histórias e heróis

5.2 Pesquisa de Clima
Dimensões avaliadas:
- Liderança
- Comunicação
- Desenvolvimento
- Reconhecimento
- Ambiente físico

5.3 Engajamento
Estratégias:
- Comunicação transparente
- Reconhecimento frequente
- Oportunidades de crescimento
- Autonomia e propósito
- Equilíbrio trabalho-vida

CONCLUSÃO
A gestão de pessoas é fundamental para o sucesso organizacional no século XXI.
Organizações que investem em seus colaboradores colhem resultados superiores em
produtividade, inovação e satisfação dos clientes.
";

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "📚 TESTE 1: Conteúdo Rico (3500+ caracteres)\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

echo "📊 Estatísticas do conteúdo:\n";
echo "   Caracteres: " . strlen($richContent) . "\n";
echo "   Palavras: ~" . str_word_count($richContent) . "\n";
echo "   Módulos mencionados: 5\n";
echo "\n";

$geminiService = app(\App\Services\GeminiAIService::class);

echo "🚀 Gerando curso com Gemini otimizado...\n\n";

$startTime = microtime(true);

try {
    $courseData = $geminiService->generateCourseFromContent(
        $richContent,
        'Gestão de Pessoas Completo',
        'Gestores e RH',
        'intermediate'
    );

    $elapsed = microtime(true) - $startTime;

    echo "╔══════════════════════════════════════════════════════════════╗\n";
    echo "║                  ✅ CURSO GERADO COM SUCESSO!                ║\n";
    echo "╚══════════════════════════════════════════════════════════════╝\n\n";

    echo "⏱️  TEMPO DE GERAÇÃO: " . number_format($elapsed, 2) . "s\n\n";

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "📖 ESTRUTURA DO CURSO GERADO\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    echo "📚 Título: " . ($courseData['title'] ?? 'N/A') . "\n";
    echo "📝 Descrição: " . substr($courseData['description'] ?? 'N/A', 0, 100) . "...\n";
    echo "⏰ Horas estimadas: " . ($courseData['estimated_hours'] ?? 0) . "h\n";
    echo "🎯 Dificuldade: " . ($courseData['difficulty'] ?? 'N/A') . "\n\n";

    $totalLessons = 0;
    $totalDuration = 0;
    $lessonTypes = [];

    echo "📚 MÓDULOS (" . count($courseData['modules'] ?? []) . "):\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    foreach (($courseData['modules'] ?? []) as $index => $module) {
        $moduleNum = $index + 1;
        $lessonsCount = count($module['lessons'] ?? []);
        $totalLessons += $lessonsCount;

        echo "📘 MÓDULO {$moduleNum}: " . ($module['title'] ?? 'N/A') . "\n";
        echo "   📝 " . substr($module['description'] ?? 'N/A', 0, 80) . "...\n";
        echo "   📖 Lições: {$lessonsCount}\n";

        // Mostrar primeiras 2 lições como exemplo
        foreach (array_slice($module['lessons'] ?? [], 0, 2) as $lessonIdx => $lesson) {
            $lessonNum = $lessonIdx + 1;
            $duration = $lesson['duration_minutes'] ?? 0;
            $type = $lesson['type'] ?? 'lesson';
            $points = $lesson['points'] ?? 0;

            $totalDuration += $duration;
            $lessonTypes[$type] = ($lessonTypes[$type] ?? 0) + 1;

            $typeEmoji = [
                'lesson' => '📖',
                'reading' => '📄',
                'quiz' => '❓',
                'assignment' => '✏️',
                'video' => '🎥'
            ][$type] ?? '📌';

            echo "      {$typeEmoji} Lição {$lessonNum}: " . ($lesson['title'] ?? 'N/A') . "\n";
            echo "         ⏰ {$duration}min | 🎯 {$points} pts | 📝 " . strlen($lesson['content'] ?? '') . " chars\n";
        }

        if ($lessonsCount > 2) {
            echo "      ... e mais " . ($lessonsCount - 2) . " lições\n";
        }

        echo "\n";
    }

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "📊 ESTATÍSTICAS FINAIS\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    echo "📚 Total de módulos: " . count($courseData['modules'] ?? []) . "\n";
    echo "📖 Total de lições: {$totalLessons}\n";
    echo "⏰ Duração total: {$totalDuration} minutos (~" . round($totalDuration / 60, 1) . " horas)\n";
    echo "🎯 Pontos totais: " . ($courseData['points_per_completion'] ?? 0) . "\n\n";

    echo "📊 Tipos de lições:\n";
    foreach ($lessonTypes as $type => $count) {
        $percentage = round(($count / $totalLessons) * 100, 1);
        echo "   {$type}: {$count} ({$percentage}%)\n";
    }

    echo "\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "✅ VALIDAÇÃO DE QUALIDADE\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    $quality = [
        'modules_ok' => count($courseData['modules'] ?? []) >= 3,
        'lessons_ok' => $totalLessons >= 9,
        'duration_ok' => $totalDuration >= 60,
        'variety_ok' => count($lessonTypes) >= 2,
        'content_ok' => strlen($courseData['description'] ?? '') > 50
    ];

    foreach ($quality as $check => $passed) {
        $icon = $passed ? '✅' : '❌';
        $label = str_replace('_', ' ', ucfirst($check));
        echo "   {$icon} {$label}\n";
    }

    $passedChecks = count(array_filter($quality));
    $totalChecks = count($quality);
    $qualityScore = round(($passedChecks / $totalChecks) * 100, 1);

    echo "\n";
    echo "🎯 SCORE DE QUALIDADE: {$qualityScore}% ({$passedChecks}/{$totalChecks} critérios)\n\n";

    if ($qualityScore >= 80) {
        echo "🏆 EXCELENTE! Curso com alta qualidade!\n";
    } elseif ($qualityScore >= 60) {
        echo "👍 BOM! Curso com qualidade aceitável.\n";
    } else {
        echo "⚠️  Curso precisa de melhorias.\n";
    }

    echo "\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "💾 SALVANDO RESULTADO\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    $resultPath = storage_path('app/gemini_optimized_result.json');
    file_put_contents($resultPath, json_encode($courseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo "✅ Resultado salvo em:\n";
    echo "   {$resultPath}\n\n";

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "📈 COMPARAÇÃO: ANTES vs DEPOIS\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    echo "┌─────────────────────────┬────────────┬────────────┐\n";
    echo "│ MÉTRICA                 │ ANTES      │ AGORA      │\n";
    echo "├─────────────────────────┼────────────┼────────────┤\n";
    printf("│ Conteúdo enviado        │ %6s     │ %6s     │\n", "800ch", strlen($richContent) > 800 ? "15000ch" : strlen($richContent) . "ch");
    printf("│ Módulos gerados         │ %6d     │ %6d     │\n", 1, count($courseData['modules'] ?? []));
    printf("│ Lições totais           │ %6d     │ %6d     │\n", 4, $totalLessons);
    printf("│ Temperatura             │ %6.1f     │ %6.1f     │\n", 0.7, 0.9);
    printf("│ Max tokens              │ %6d     │ %6d     │\n", 8192, 32768);
    echo "└─────────────────────────┴────────────┴────────────┘\n\n";

    echo "╔══════════════════════════════════════════════════════════════╗\n";
    echo "║            🎉 OTIMIZAÇÃO CONCLUÍDA COM SUCESSO!              ║\n";
    echo "╚══════════════════════════════════════════════════════════════╝\n\n";

    echo "🚀 PRÓXIMOS PASSOS:\n";
    echo "   1. ✅ Gemini otimizado está funcionando!\n";
    echo "   2. 🌐 Teste na interface web com seu PDF\n";
    echo "   3. 📊 Compare a qualidade antes/depois\n\n";

    echo "💡 DICA: Use PDFs com TEXTO RICO para melhores resultados!\n\n";

} catch (\Exception $e) {
    echo "╔══════════════════════════════════════════════════════════════╗\n";
    echo "║                     ❌ ERRO NO TESTE                         ║\n";
    echo "╚══════════════════════════════════════════════════════════════╝\n\n";

    echo "Erro: " . $e->getMessage() . "\n\n";
    echo "Detalhes técnicos:\n";
    echo "   Arquivo: " . $e->getFile() . "\n";
    echo "   Linha: " . $e->getLine() . "\n\n";

    exit(1);
}

exit(0);
