<?php

namespace App\Services;

use Smalot\PdfParser\Parser as PdfParser;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MaterialContentExtractor
{
    protected $pdfParser;

    public function __construct()
    {
        $this->pdfParser = new PdfParser();
    }

    public function extractContent($material)
    {
        Log::info('Starting content extraction', [
            'material_id' => $material->id,
            'file_type' => $material->file_type,
            'file_name' => $material->original_name
        ]);

        try {
            switch ($material->file_type) {
                case 'pdf':
                    return $this->extractFromPDF($material);
                case 'doc':
                case 'docx':
                    return $this->extractFromWord($material);
                case 'ppt':
                case 'pptx':
                    return $this->extractFromPowerPoint($material);
                default:
                    return $this->generatePlaceholderContent($material);
            }
        } catch (\Exception $e) {
            Log::error('Content extraction failed', [
                'material_id' => $material->id,
                'error' => $e->getMessage()
            ]);
            
            return $this->generatePlaceholderContent($material);
        }
    }

    private function extractFromPDF($material)
    {
        $filePath = storage_path('app/public/' . $material->file_path);
        
        if (!file_exists($filePath)) {
            throw new \Exception("PDF file not found: {$filePath}");
        }

        // Parse PDF
        $pdf = $this->pdfParser->parseFile($filePath);
        $text = $pdf->getText();
        
        if (empty($text)) {
            throw new \Exception("No text content found in PDF");
        }

        Log::info('PDF extraction successful', [
            'material_id' => $material->id,
            'text_length' => strlen($text)
        ]);

        return $this->processExtractedText($text, $material);
    }

    private function extractFromWord($material)
    {
        // Placeholder para documentos Word - seria necessário instalar uma biblioteca específica
        Log::info('Word extraction not implemented, using placeholder');
        return $this->generatePlaceholderContent($material);
    }

    private function extractFromPowerPoint($material)
    {
        // Placeholder para PowerPoint - seria necessário instalar uma biblioteca específica
        Log::info('PowerPoint extraction not implemented, using placeholder');
        return $this->generatePlaceholderContent($material);
    }

    private function processExtractedText($rawText, $material)
    {
        // Limpar o texto
        $cleanText = $this->cleanText($rawText);
        
        // Segmentar em seções
        $sections = $this->segmentText($cleanText);
        
        // Criar estrutura organizada
        return [
            'raw_text' => $rawText,
            'clean_text' => $cleanText,
            'sections' => $sections,
            'word_count' => str_word_count($cleanText),
            'estimated_reading_time' => $this->estimateReadingTime($cleanText),
            'extraction_metadata' => [
                'extracted_at' => now(),
                'file_type' => $material->file_type,
                'file_name' => $material->original_name,
                'extraction_method' => 'pdf_parser'
            ]
        ];
    }

    private function cleanText($text)
    {
        // Remover caracteres de controle e limpar formatação
        $text = preg_replace('/[\x00-\x1F\x7F]/u', '', $text);
        
        // Normalizar quebras de linha
        $text = preg_replace('/\r\n|\r|\n/', "\n", $text);
        
        // Remover múltiplas quebras de linha
        $text = preg_replace('/\n{3,}/', "\n\n", $text);
        
        // Remover espaços extras
        $text = preg_replace('/[ \t]+/', ' ', $text);
        
        // Trim geral
        return trim($text);
    }

    private function segmentText($text)
    {
        $sections = [];
        $currentSection = '';
        $sectionTitle = 'Introdução';
        $sectionIndex = 0;

        $lines = explode("\n", $text);
        
        foreach ($lines as $line) {
            $line = trim($line);
            
            if (empty($line)) {
                continue;
            }

            // Detectar possíveis títulos (linhas curtas com palavras-chave ou formatação especial)
            if ($this->looksLikeTitle($line)) {
                // Salvar seção anterior se tiver conteúdo
                if (!empty($currentSection)) {
                    $sections[] = [
                        'title' => $sectionTitle,
                        'content' => trim($currentSection),
                        'word_count' => str_word_count($currentSection),
                        'order' => $sectionIndex++
                    ];
                }
                
                // Iniciar nova seção
                $sectionTitle = $line;
                $currentSection = '';
            } else {
                // Adicionar linha ao conteúdo da seção atual
                $currentSection .= $line . "\n";
            }
        }
        
        // Adicionar última seção
        if (!empty($currentSection)) {
            $sections[] = [
                'title' => $sectionTitle,
                'content' => trim($currentSection),
                'word_count' => str_word_count($currentSection),
                'order' => $sectionIndex
            ];
        }

        // Se não conseguiu segmentar bem, criar seções baseadas em tamanho
        if (count($sections) < 3) {
            return $this->segmentBySize($text);
        }

        return $sections;
    }

    private function looksLikeTitle($line)
    {
        // Critérios para detectar títulos
        $titleIndicators = [
            strlen($line) < 100, // Linha curta
            preg_match('/^[A-Z\s]+$/', $line), // Tudo maiúsculo
            preg_match('/^\d+\./', $line), // Começa com número
            preg_match('/^(CAPÍTULO|CHAPTER|SEÇÃO|SECTION|PARTE|PART)/i', $line), // Palavras-chave
            str_word_count($line) <= 8 // Poucas palavras
        ];

        // Se pelo menos 2 critérios são verdadeiros, provavelmente é título
        return array_sum($titleIndicators) >= 2;
    }

    private function segmentBySize($text)
    {
        $words = explode(' ', $text);
        $totalWords = count($words);
        $sectionsCount = max(3, min(8, intval($totalWords / 500))); // 3-8 seções
        $wordsPerSection = intval($totalWords / $sectionsCount);

        $sections = [];
        $currentWords = [];
        $sectionIndex = 0;

        foreach ($words as $word) {
            $currentWords[] = $word;
            
            if (count($currentWords) >= $wordsPerSection && $sectionIndex < $sectionsCount - 1) {
                $content = implode(' ', $currentWords);
                $sections[] = [
                    'title' => "Seção " . ($sectionIndex + 1),
                    'content' => $content,
                    'word_count' => count($currentWords),
                    'order' => $sectionIndex++
                ];
                $currentWords = [];
            }
        }

        // Última seção com palavras restantes
        if (!empty($currentWords)) {
            $content = implode(' ', $currentWords);
            $sections[] = [
                'title' => "Seção " . ($sectionIndex + 1),
                'content' => $content,
                'word_count' => count($currentWords),
                'order' => $sectionIndex
            ];
        }

        return $sections;
    }

    private function estimateReadingTime($text)
    {
        $wordsPerMinute = 200; // Velocidade média de leitura
        $wordCount = str_word_count($text);
        return max(1, intval($wordCount / $wordsPerMinute));
    }

    private function generatePlaceholderContent($material)
    {
        return [
            'raw_text' => '',
            'clean_text' => '',
            'sections' => [
                [
                    'title' => $material->title,
                    'content' => "Este material ({$material->original_name}) está disponível para estudo. O conteúdo específico será extraído automaticamente em futuras versões do sistema.",
                    'word_count' => 20,
                    'order' => 0
                ]
            ],
            'word_count' => 20,
            'estimated_reading_time' => 1,
            'extraction_metadata' => [
                'extracted_at' => now(),
                'file_type' => $material->file_type,
                'file_name' => $material->original_name,
                'extraction_method' => 'placeholder'
            ]
        ];
    }

    public function extractContentForActivity($material, $activityType, $moduleTitle)
    {
        $extractedContent = $this->extractContent($material);
        
        // Encontrar seção mais relevante para a atividade
        $relevantSection = $this->findRelevantSection($extractedContent['sections'], $moduleTitle);
        
        return [
            'title' => $relevantSection['title'],
            'content' => $relevantSection['content'],
            'word_count' => $relevantSection['word_count'],
            'estimated_time' => $this->estimateActivityTime($relevantSection['content'], $activityType),
            'full_content_available' => $extractedContent
        ];
    }

    private function findRelevantSection($sections, $moduleTitle)
    {
        // Tentar encontrar seção com título similar ao módulo
        foreach ($sections as $section) {
            $similarity = similar_text(
                strtolower($section['title']), 
                strtolower($moduleTitle)
            );
            
            if ($similarity > 5) { // Se há similaridade
                return $section;
            }
        }
        
        // Se não encontrou seção relevante, retornar primeira seção com conteúdo substancial
        foreach ($sections as $section) {
            if ($section['word_count'] > 50) {
                return $section;
            }
        }
        
        // Fallback: primeira seção
        return $sections[0] ?? [
            'title' => $moduleTitle,
            'content' => 'Conteúdo não disponível.',
            'word_count' => 3,
        ];
    }

    private function estimateActivityTime($content, $activityType)
    {
        $baseTime = $this->estimateReadingTime($content);
        
        switch ($activityType) {
            case 'reading':
                return $baseTime;
            case 'quiz':
                return $baseTime + 10; // Tempo de leitura + tempo de quiz
            case 'assignment':
                return $baseTime + 20; // Tempo de leitura + tempo de reflexão
            default:
                return $baseTime;
        }
    }

    public function extractFromUploadedFile($file)
    {
        $fileName = $file->getClientOriginalName();
        $fileType = strtolower($file->getClientOriginalExtension());
        
        try {
            switch ($fileType) {
                case 'pdf':
                    return $this->extractFromUploadedPDF($file);
                case 'txt':
                    return $this->extractFromUploadedText($file);
                default:
                    throw new \Exception("Unsupported file type: {$fileType}");
            }
        } catch (\Exception $e) {
            Log::error('File extraction failed', [
                'file_name' => $fileName,
                'error' => $e->getMessage()
            ]);
            
            return [
                'raw_text' => '',
                'clean_text' => 'Erro ao extrair conteúdo do arquivo.',
                'sections' => [],
                'word_count' => 0,
                'estimated_reading_time' => 0
            ];
        }
    }

    private function extractFromUploadedPDF($file)
    {
        $tempPath = $file->getPathname();
        
        // Parse PDF
        $pdf = $this->pdfParser->parseFile($tempPath);
        $text = $pdf->getText();
        
        if (empty($text)) {
            throw new \Exception("No text content found in PDF");
        }

        return $this->processUploadedFileText($text);
    }

    private function extractFromUploadedText($file)
    {
        $text = file_get_contents($file->getPathname());
        
        if (empty($text)) {
            throw new \Exception("No content found in text file");
        }

        return $this->processUploadedFileText($text);
    }

    private function processUploadedFileText($rawText)
    {
        // Limpar o texto
        $cleanText = $this->cleanText($rawText);
        
        // Segmentar em seções
        $sections = $this->segmentText($cleanText);
        
        // Criar estrutura organizada
        return [
            'raw_text' => $rawText,
            'clean_text' => $cleanText,
            'sections' => $sections,
            'word_count' => str_word_count($cleanText),
            'estimated_reading_time' => $this->estimateReadingTime($cleanText),
            'extraction_metadata' => [
                'extracted_at' => now(),
                'extraction_method' => 'uploaded_file'
            ]
        ];
    }
}