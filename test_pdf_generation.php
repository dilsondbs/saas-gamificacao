<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\GeminiAIService;

echo "🧪 Testando geração de curso a partir de PDF...\n\n";

// Simular texto extraído de um PDF sobre Direito
$pdfContent = <<<EOF
NOÇÕES DE DIREITO
1º Ten Gregório

OBJETIVOS:
- Aplicar às atividades militares
- Identificar os aspectos do Direito Público e do Direito Privado
- Conhecer as principais normas do Direito Brasileiro

I. ESTADO - Elementos

O Estado é uma organização político-jurídica de uma sociedade para realizar o bem comum.
Possui três elementos fundamentais:

1. Povo: Conjunto de indivíduos que se vinculam juridicamente ao Estado
2. Território: Espaço geográfico onde o Estado exerce sua soberania
3. Governo: Organização política que dirige o Estado

II. FONTES DO DIREITO

- Lei: norma jurídica escrita emanada do poder competente
- Costumes: prática reiterada de determinada conduta
- Jurisprudência: conjunto de decisões dos tribunais
- Doutrina: opinião dos estudiosos do direito

III. DIREITO PÚBLICO E PRIVADO

Direito Público: regula relações em que o Estado é parte
- Direito Constitucional
- Direito Administrativo
- Direito Penal
- Direito Processual

Direito Privado: regula relações entre particulares
- Direito Civil
- Direito Comercial
- Direito do Trabalho
EOF;

try {
    $service = new GeminiAIService();

    echo "📄 Conteúdo do PDF ({strlen($pdfContent)} caracteres):\n";
    echo substr($pdfContent, 0, 200) . "...\n\n";

    echo "🤖 Gerando curso com IA...\n\n";

    $courseData = $service->generateCourseFromContent(
        $pdfContent,
        'Noções de Direito para Militares',
        'Militares em formação',
        'beginner'
    );

    echo "\n✅ CURSO GERADO:\n";
    echo "=".str_repeat('=', 80)."\n";
    echo "Título: " . ($courseData['title'] ?? 'N/A') . "\n";
    echo "Descrição: " . substr($courseData['description'] ?? 'N/A', 0, 150) . "...\n";
    echo "Dificuldade: " . ($courseData['difficulty'] ?? 'N/A') . "\n";
    echo "Público-alvo: " . ($courseData['target_audience'] ?? 'N/A') . "\n";
    echo "Módulos: " . count($courseData['modules'] ?? []) . "\n\n";

    if (isset($courseData['modules'])) {
        foreach ($courseData['modules'] as $index => $module) {
            echo "📚 Módulo " . ($index + 1) . ": " . ($module['title'] ?? 'N/A') . "\n";
            echo "   Descrição: " . substr($module['description'] ?? 'N/A', 0, 100) . "...\n";
            echo "   Aulas: " . count($module['lessons'] ?? []) . "\n";

            if (isset($module['lessons'])) {
                foreach ($module['lessons'] as $lIndex => $lesson) {
                    echo "      └─ Aula " . ($lIndex + 1) . ": " . ($lesson['title'] ?? 'N/A') . "\n";
                }
            }
            echo "\n";
        }
    }

    echo "\n📊 VERIFICAÇÃO:\n";
    echo "   - Título está relacionado ao PDF? " . (stripos($courseData['title'], 'direito') !== false ? '✅ SIM' : '❌ NÃO') . "\n";
    echo "   - Descrição menciona conteúdo do PDF? " . (stripos($courseData['description'], 'direito') !== false || stripos($courseData['description'], 'estado') !== false ? '✅ SIM' : '❌ NÃO') . "\n";
    echo "   - Módulos parecem específicos do PDF? ";

    $specificTerms = ['estado', 'direito', 'público', 'privado', 'fontes', 'militar'];
    $foundSpecificContent = false;
    foreach ($courseData['modules'] ?? [] as $module) {
        foreach ($specificTerms as $term) {
            if (stripos($module['title'], $term) !== false || stripos($module['description'] ?? '', $term) !== false) {
                $foundSpecificContent = true;
                break 2;
            }
        }
    }
    echo ($foundSpecificContent ? '✅ SIM' : '❌ NÃO - Parecem genéricos') . "\n";

} catch (\Exception $e) {
    echo "\n❌ ERRO: " . $e->getMessage() . "\n";
    echo "\n📍 Trace:\n";
    echo $e->getTraceAsString();
}

echo "\n\n";
