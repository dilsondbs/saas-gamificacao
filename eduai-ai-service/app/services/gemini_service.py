import google.generativeai as genai
import json
import asyncio
from typing import Tuple, Dict, Any
from pathlib import Path
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.models.schemas import ExtractedContent
from app.config import settings


class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Use gemini-2.5-flash (rápido, estável e disponível)
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def build_prompt(
        self,
        title: str,
        difficulty: str,
        audience: str,
        content: str
    ) -> str:
        # ✅ CORREÇÃO 1: Removido limite de 15000 caracteres
        # Agora usa TODO o conteúdo extraído do PDF
        limited_content = content  # Usa conteúdo completo

        prompt = f"""Você é um especialista pedagógico criando material didático de alta qualidade.

DOCUMENTO ORIGINAL:
{limited_content}

Título do Curso: {title}
Dificuldade: {difficulty}
Público-alvo: {audience}

INSTRUÇÕES CRÍTICAS:
1. **DIVISÃO DO CONTEÚDO**: Analise o documento e divida em 4-6 módulos com temas ÚNICOS e DISTINTOS
   - Cada módulo deve cobrir um aspecto DIFERENTE do conteúdo
   - NÃO repita o mesmo conteúdo em múltiplos módulos
   - Organize de forma progressiva (do básico ao avançado)

2. **ESTRUTURA DE CADA MÓDULO**:
   - Cada módulo DEVE ter: 1 lição + 1 quiz correspondente
   - A ORDEM é crítica: primeiro a lição (type: "lesson"), depois o quiz (type: "quiz")
   - O campo "order" deve ser sequencial: 1, 2, 3, 4, 5, 6...

3. **CRITICAL MICRO-LEARNING REQUIREMENTS**:
   - Each lesson 'content' field: MINIMUM 800 characters with rich HTML structure
   - Structure each lesson as:
     * Title with <h2>📚 Main Topic Title</h2>
     * Introduction paragraph with <p>Brief introduction explaining context</p>
     * Core concepts with <h3>Key Concepts</h3> subsections
     * Important terms: <strong>highlight with bold</strong>
     * Technical terms: <em>mark in italics</em>
     * Lists: use <ul> or <ol> for enumeration
     * Tips/Warnings: <blockquote>💡 <strong>Important:</strong> Relevant information</blockquote>
     * Tables: use <table> for comparisons and structured data
     * Icons: use emojis for visual appeal (📊 📈 💡 ⚠️ ✅ ❌)
     * Example structure:

       <h2>📚 Lesson Topic</h2>
       <p>Clear introduction to the concept.</p>

       <h3>Core Principles</h3>
       <p>The <strong>main concept</strong> is essential because it <em>defines the foundation</em> of understanding.</p>

       <blockquote>💡 <strong>Key Point:</strong> This concept appears in 90% of practical applications.</blockquote>

       <h3>📊 Comparison Table</h3>
       <table>
       <thead>
       <tr><th>Method</th><th>Advantages</th><th>Disadvantages</th></tr>
       </thead>
       <tbody>
       <tr>
       <td><strong>Method A</strong></td>
       <td>✅ Fast<br>✅ Efficient</td>
       <td>❌ Complex<br>❌ Expensive</td>
       </tr>
       </tbody>
       </table>

       <h3>Key Takeaways</h3>
       <ul>
       <li><strong>First important point:</strong> detailed explanation</li>
       <li><strong>Second critical concept:</strong> practical example</li>
       <li><strong>Third essential idea:</strong> real application</li>
       </ul>

       <blockquote>⚠️ <strong>Note:</strong> This concept frequently appears in assessments!</blockquote>
   - Focus on ONE main idea per lesson with rich visual structure
   - Be comprehensive and well-formatted with semantic HTML

4. **QUIZZES**:
   - Cada quiz deve ter 5 questões sobre a lição correspondente
   - Questões devem testar compreensão, não memorização
   - Incluir explicações pedagógicas

ESTRUTURA JSON OBRIGATÓRIA:
{{
    "title": "{title}",
    "description": "descrição completa do curso (mínimo 80 caracteres)",
    "difficulty": "{difficulty}",
    "estimated_hours": número_inteiro,
    "points_per_completion": 100,
    "modules": [
        {{
            "title": "Módulo 1: [Tema Único]",
            "description": "descrição do módulo (mínimo 40 caracteres)",
            "order": 1,
            "activities": [
                {{
                    "title": "título da lição sobre o tema",
                    "content": "RICH HTML CONTENT with <h2>, <h3>, <p>, <strong>, <em>, <ul>, <table>, <blockquote> and emojis (MINIMUM 800 characters with semantic structure)",
                    "duration_minutes": número_entre_5_e_15,
                    "type": "lesson",
                    "points": 10,
                    "order": 1
                }},
                {{
                    "title": "Quiz: [mesmo tema da lição]",
                    "description": "Avaliação sobre [tema da lição]",
                    "type": "quiz",
                    "points": 10,
                    "duration_minutes": 15,
                    "order": 2,
                    "questions": [
                        {{
                            "question": "Pergunta clara sobre o conteúdo da lição?",
                            "options": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
                            "correct_answer": "A",
                            "explanation": "Explicação pedagógica detalhada"
                        }}
                    ]
                }}
            ]
        }},
        {{
            "title": "Módulo 2: [Tema DIFERENTE]",
            "description": "descrição do módulo 2",
            "order": 2,
            "activities": [
                {{
                    "title": "título da segunda lição",
                    "content": "CONTEÚDO DIFERENTE da primeira lição...",
                    "duration_minutes": número,
                    "type": "lesson",
                    "points": 10,
                    "order": 3
                }},
                {{
                    "title": "Quiz: [tema da segunda lição]",
                    "description": "Avaliação sobre segunda lição",
                    "type": "quiz",
                    "points": 10,
                    "duration_minutes": 15,
                    "order": 4,
                    "questions": [...]
                }}
            ]
        }}
    ],
    "learning_objectives": ["objetivo1", "objetivo2", "objetivo3"],
    "prerequisites": ["prerequisito1", "prerequisito2"]
}}

REGRAS FINAIS:
- Retorne APENAS o JSON válido, sem markdown ou código
- A ordem (order) deve ser sequencial: 1, 2, 3, 4, 5...
- NUNCA coloque quiz antes de sua lição
- Cada módulo = 1 tema único diferente dos outros"""

        return prompt

    def _parse_json(self, text: str) -> Dict[str, Any]:
        start = text.find('{')
        end = text.rfind('}')

        if start == -1 or end == -1:
            raise ValueError("No JSON object found in response")

        json_str = text[start:end + 1]
        return json.loads(json_str)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((Exception,)),
        reraise=True
    )
    async def generate_course(
        self,
        extracted: ExtractedContent,
        title: str,
        difficulty: str,
        target_audience: str
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        prompt = self.build_prompt(title, difficulty, target_audience, extracted.text)

        response = await self.model.generate_content_async(
            prompt,
            generation_config={
                "temperature": 0.8,  # ✅ CORREÇÃO 2: Aumentado de 0.7 para 0.8
                "top_p": 0.85,
                "top_k": 40,
                "max_output_tokens": 32768,
                "response_mime_type": "application/json"
            }
        )

        course_dict = self._parse_json(response.text)

        print("=" * 80)
        print("DEBUG - JSON RECEBIDO DO GEMINI (generate_course):")
        print(json.dumps(course_dict, indent=2, ensure_ascii=False))
        print("=" * 80)

        metadata_dict = {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "generation_method": "direct_json",
            "tokens_used": {
                "input": response.usage_metadata.prompt_token_count,
                "output": response.usage_metadata.candidates_token_count
            },
            "cost_usd": 0.0,
            "generation_time_ms": 0,
            "confidence_score": 0.9,
            "routing_reason": "gemini_service"
        }

        return (course_dict, metadata_dict)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((Exception,)),
        reraise=True
    )
    async def upload_and_generate_from_pdf(
        self,
        pdf_path: str,
        title: str,
        difficulty: str,
        target_audience: str
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        uploaded_file = genai.upload_file(pdf_path, mime_type="application/pdf")

        while uploaded_file.state.name == "PROCESSING":
            await asyncio.sleep(1)
            uploaded_file = genai.get_file(uploaded_file.name)

        if uploaded_file.state.name == "FAILED":
            raise ValueError(f"File processing failed: {uploaded_file.state.name}")

        # ✅ CORREÇÃO 3: Prompt completamente reescrito com quizzes integrados
        prompt = f"""Você é um especialista pedagógico criando material didático de excelência a partir do PDF.

Título do Curso: {title}
Dificuldade: {difficulty}
Público-alvo: {target_audience}

TAREFA: Crie um curso educacional completo baseado EXCLUSIVAMENTE no conteúdo do PDF fornecido.

INSTRUÇÕES CRÍTICAS:
1. **DIVISÃO INTELIGENTE DO CONTEÚDO**:
   - Analise todo o PDF e identifique 4-6 temas PRINCIPAIS e DISTINTOS
   - Cada módulo deve cobrir um aspecto DIFERENTE do documento
   - NÃO repita o mesmo conteúdo em vários módulos
   - Organize progressivamente (básico → intermediário → avançado)

2. **ESTRUTURA DE CADA MÓDULO** (OBRIGATÓRIA):
   Módulo = 1 Lição + 1 Quiz
   - PRIMEIRO: Lição (type: "lesson", order: número_ímpar)
   - DEPOIS: Quiz sobre essa lição (type: "quiz", order: número_par)
   - Exemplo: Lição (order: 1) → Quiz (order: 2) → Lição (order: 3) → Quiz (order: 4)

3. **CRITICAL MICRO-LEARNING REQUIREMENTS**:
   - Each lesson 'content' field: MINIMUM 800 characters with rich HTML structure
   - Structure each lesson as:
     * Title with <h2>📚 Main Topic Title</h2>
     * Introduction paragraph with <p>Brief introduction explaining context</p>
     * Core concepts with <h3>Key Concepts</h3> subsections
     * Important terms: <strong>highlight with bold</strong>
     * Technical terms: <em>mark in italics</em>
     * Lists: use <ul> or <ol> for enumeration
     * Tips/Warnings: <blockquote>💡 <strong>Important:</strong> Relevant information</blockquote>
     * Tables: use <table> for comparisons and structured data
     * Icons: use emojis for visual appeal (📊 📈 💡 ⚠️ ✅ ❌)
     * Example structure:

       <h2>📚 Lesson Topic</h2>
       <p>Clear introduction to the concept.</p>

       <h3>Core Principles</h3>
       <p>The <strong>main concept</strong> is essential because it <em>defines the foundation</em> of understanding.</p>

       <blockquote>💡 <strong>Key Point:</strong> This concept appears in 90% of practical applications.</blockquote>

       <h3>📊 Comparison Table</h3>
       <table>
       <thead>
       <tr><th>Method</th><th>Advantages</th><th>Disadvantages</th></tr>
       </thead>
       <tbody>
       <tr>
       <td><strong>Method A</strong></td>
       <td>✅ Fast<br>✅ Efficient</td>
       <td>❌ Complex<br>❌ Expensive</td>
       </tr>
       </tbody>
       </table>

       <h3>Key Takeaways</h3>
       <ul>
       <li><strong>First important point:</strong> detailed explanation</li>
       <li><strong>Second critical concept:</strong> practical example</li>
       <li><strong>Third essential idea:</strong> real application</li>
       </ul>

       <blockquote>⚠️ <strong>Note:</strong> This concept frequently appears in assessments!</blockquote>
   - Focus on ONE main idea per lesson with rich visual structure
   - Be comprehensive and well-formatted with semantic HTML
   - Use 100% de fidelidade ao PDF - não invente informações
   - Seja profissional mas acessível

4. **QUIZZES**:
   - Cada quiz deve ter exatamente 5 questões
   - Questões testam COMPREENSÃO da lição correspondente
   - Mix: 3 múltipla escolha + 2 verdadeiro/falso
   - Cada questão deve ter explicação pedagógica

ESTRUTURA JSON OBRIGATÓRIA:
{{
    "title": "{title}",
    "description": "descrição completa do curso (mínimo 100 caracteres)",
    "difficulty": "{difficulty}",
    "estimated_hours": número_inteiro,
    "points_per_completion": 100,
    "modules": [
        {{
            "title": "Módulo 1: [Primeiro Tema Principal]",
            "description": "descrição detalhada do primeiro tema (mínimo 50 caracteres)",
            "order": 1,
            "activities": [
                {{
                    "title": "Lição: [Título específico do tema 1]",
                    "content": "RICH HTML CONTENT with <h2>, <h3>, <p>, <strong>, <em>, <ul>, <table>, <blockquote> and emojis (MINIMUM 800 characters with semantic structure from PDF content)",
                    "duration_minutes": 10,
                    "type": "lesson",
                    "points": 10,
                    "order": 1
                }},
                {{
                    "title": "Quiz: Avaliação sobre [Tema 1]",
                    "description": "Teste seus conhecimentos sobre [tema específico da lição 1]",
                    "type": "quiz",
                    "points": 10,
                    "duration_minutes": 15,
                    "order": 2,
                    "questions": [
                        {{
                            "question": "Pergunta objetiva sobre conceito da lição 1?",
                            "options": ["A) Primeira opção", "B) Segunda opção", "C) Terceira opção", "D) Quarta opção"],
                            "correct_answer": "A",
                            "explanation": "Explicação detalhada do por que A está correta e as outras erradas, referenciando o conteúdo da lição"
                        }},
                        {{
                            "question": "Segunda pergunta sobre outro conceito da lição 1?",
                            "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
                            "correct_answer": "B",
                            "explanation": "Explicação pedagógica..."
                        }},
                        {{
                            "question": "Terceira pergunta...",
                            "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
                            "correct_answer": "C",
                            "explanation": "..."
                        }},
                        {{
                            "question": "Quarta pergunta verdadeiro/falso...",
                            "options": ["A) Verdadeiro", "B) Falso"],
                            "correct_answer": "A",
                            "explanation": "..."
                        }},
                        {{
                            "question": "Quinta pergunta verdadeiro/falso...",
                            "options": ["A) Verdadeiro", "B) Falso"],
                            "correct_answer": "B",
                            "explanation": "..."
                        }}
                    ]
                }}
            ]
        }},
        {{
            "title": "Módulo 2: [Segundo Tema Principal - DIFERENTE]",
            "description": "descrição do segundo tema único",
            "order": 2,
            "activities": [
                {{
                    "title": "Lição: [Título específico do tema 2 - DIFERENTE do tema 1]",
                    "content": "RICH HTML CONTENT completely different from lesson 1, MINIMUM 800 characters with <h2>, <h3>, <p>, <strong>, <em>, <ul>, <table>, <blockquote> and emojis...",
                    "duration_minutes": 10,
                    "type": "lesson",
                    "points": 10,
                    "order": 3
                }},
                {{
                    "title": "Quiz: Avaliação sobre [Tema 2]",
                    "description": "Teste sobre o segundo tema",
                    "type": "quiz",
                    "points": 10,
                    "duration_minutes": 15,
                    "order": 4,
                    "questions": [
                        {{...5 questões sobre lição 2...}}
                    ]
                }}
            ]
        }}
    ],
    "learning_objectives": ["objetivo 1 claro", "objetivo 2 mensurável", "objetivo 3 específico"],
    "prerequisites": ["prerequisito 1", "prerequisito 2"]
}}

REGRAS FINAIS OBRIGATÓRIAS:
✅ Retorne APENAS JSON válido (sem markdown, sem blocos de código)
✅ Ordem sequencial: 1, 2, 3, 4, 5, 6...
✅ SEMPRE: Lição (ordem ímpar) → Quiz (ordem par seguinte)
✅ Cada módulo = tema ÚNICO e DIFERENTE
✅ MÁXIMO 300 palavras por lição (micro-learning obrigatório)
✅ Exatamente 5 questões por quiz
✅ Fidelidade total ao conteúdo do PDF"""

        response = await self.model.generate_content_async(
            [uploaded_file, prompt],
            generation_config={
                "temperature": 0.8,  # ✅ CORREÇÃO 4: Aumentado de 0.4 para 0.8
                "top_p": 0.85,
                "top_k": 40,
                "max_output_tokens": 32768,
                "response_mime_type": "application/json"
            }
        )

        genai.delete_file(uploaded_file.name)

        course_dict = self._parse_json(response.text)

        print("=" * 80)
        print("DEBUG - JSON RECEBIDO DO GEMINI (upload_and_generate_from_pdf):")
        print(json.dumps(course_dict, indent=2, ensure_ascii=False))
        print("=" * 80)

        metadata_dict = {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "generation_method": "pdf_upload",
            "tokens_used": {
                "input": response.usage_metadata.prompt_token_count,
                "output": response.usage_metadata.candidates_token_count
            },
            "cost_usd": 0.0,
            "generation_time_ms": 0,
            "confidence_score": 0.95,
            "routing_reason": "gemini_pdf_upload"
        }

        return (course_dict, metadata_dict)

    async def generate_quiz(self, module_content: str, module_title: str, difficulty: str) -> dict:
        prompt = f"""Você é um especialista em avaliação educacional.

CONTEÚDO DO MÓDULO: {module_title}
{module_content[:2000]}

TAREFA: Gere 5 questões de avaliação no formato JSON EXATO:

{{
  "questions": [
    {{
      "type": "multiple_choice",
      "question": "Pergunta clara e objetiva?",
      "options": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
      "correct_answer": "A",
      "explanation": "Por que A está correta"
    }},
    {{
      "type": "true_false",
      "question": "Afirmação para julgar",
      "correct_answer": true,
      "explanation": "Justificativa"
    }}
  ]
}}

REGRAS:
- 3 questões multiple_choice, 2 true_false
- Dificuldade: {difficulty}
- Questões devem testar compreensão
- Explicações pedagógicas claras
- RETORNE APENAS O JSON"""

        response = await self.model.generate_content_async(
            prompt,
            generation_config={"temperature": 0.7, "response_mime_type": "application/json"}
        )

        return json.loads(response.text)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((Exception,)),
        reraise=True
    )
    async def generate_final_challenge_questions(
        self,
        course_content: str,
        course_title: str,
        course_modules: list
    ) -> Dict[str, Any]:
        """
        Gera 30 questões para o Desafio Final distribuídas em 3 níveis de dificuldade:
        - 10 questões fáceis (nível easy)
        - 10 questões médias (nível medium)
        - 10 questões difíceis (nível hard)

        As questões são baseadas em TODO o conteúdo do curso.
        """

        # Extrair conteúdo das lições para contexto
        lessons_content = ""
        for module in course_modules:
            module_title = module.get('title', '')
            lessons_content += f"\n\n### {module_title}\n"
            for activity in module.get('activities', []):
                if activity.get('type') == 'lesson':
                    lessons_content += f"\n{activity.get('title', '')}\n"
                    lessons_content += f"{activity.get('content', '')[:500]}...\n"

        # Limitar conteúdo para não exceder tokens
        limited_content = (course_content[:5000] + lessons_content[:5000]) if len(course_content) > 5000 else course_content + lessons_content

        prompt = f"""Você é um especialista pedagógico criando o DESAFIO FINAL de um curso educacional.

TÍTULO DO CURSO: {course_title}

CONTEÚDO COMPLETO DO CURSO:
{limited_content}

TAREFA CRÍTICA:
Crie 30 questões de múltipla escolha distribuídas em 3 níveis de dificuldade progressivos.
Estas questões avaliarão a COMPREENSÃO COMPLETA do aluno sobre TODO o conteúdo do curso.

ESTRUTURA OBRIGATÓRIA:

**NÍVEL FÁCIL (10 questões):**
- Conceitos básicos e definições
- Questões diretas que testam memorização e compreensão fundamental
- Resposta pode ser encontrada diretamente no conteúdo
- Exemplo: "O que é X?", "Qual a definição de Y?"

**NÍVEL MÉDIO (10 questões):**
- Aplicação de conceitos em situações práticas
- Requer interpretação e análise
- Conexão entre diferentes tópicos do curso
- Exemplo: "Como X se relaciona com Y?", "Qual a melhor abordagem para Z?"

**NÍVEL DIFÍCIL (10 questões):**
- Síntese de múltiplos conceitos
- Pensamento crítico e resolução de problemas complexos
- Cenários que exigem análise profunda
- Exemplo: "Avalie a situação complexa...", "Compare e contraste X, Y e Z"

FORMATO JSON OBRIGATÓRIO:
{{
    "easy_questions": [
        {{
            "question": "Pergunta objetiva sobre conceito básico?",
            "options": [
                "A) Primeira opção",
                "B) Segunda opção",
                "C) Terceira opção",
                "D) Quarta opção"
            ],
            "correct_answer": "A",
            "explanation": "Explicação detalhada pedagógica do por que A está correta e as outras estão erradas, referenciando o conteúdo do curso",
            "points": 10
        }}
        // ... total de 10 questões easy
    ],
    "medium_questions": [
        {{
            "question": "Pergunta que requer aplicação de conhecimento?",
            "options": [
                "A) ...",
                "B) ...",
                "C) ...",
                "D) ..."
            ],
            "correct_answer": "B",
            "explanation": "Explicação pedagógica detalhada...",
            "points": 15
        }}
        // ... total de 10 questões medium
    ],
    "hard_questions": [
        {{
            "question": "Pergunta complexa que requer síntese e análise crítica?",
            "options": [
                "A) ...",
                "B) ...",
                "C) ...",
                "D) ..."
            ],
            "correct_answer": "C",
            "explanation": "Explicação pedagógica profunda que demonstra por que C é a melhor resposta...",
            "points": 20
        }}
        // ... total de 10 questões hard
    ]
}}

REGRAS CRÍTICAS:
✅ EXATAMENTE 10 questões em cada nível (easy, medium, hard)
✅ Todas as questões devem ter 4 opções (A, B, C, D)
✅ Cada questão deve ter explicação pedagógica DETALHADA (mínimo 100 caracteres)
✅ As questões devem cobrir TODOS os módulos do curso de forma equilibrada
✅ Evite questões muito similares - cada uma deve testar um aspecto diferente
✅ Use linguagem clara, objetiva e profissional
✅ As opções incorretas devem ser plausíveis (não obviamente erradas)
✅ Pontos: easy=10, medium=15, hard=20
✅ Retorne APENAS o JSON válido (sem markdown, sem blocos de código)

IMPORTANTE: As questões devem seguir uma progressão pedagógica clara:
- Easy: "O QUE é?" (conhecimento)
- Medium: "COMO aplicar?" (compreensão/aplicação)
- Hard: "POR QUE e QUANDO?" (análise/síntese/avaliação)"""

        response = await self.model.generate_content_async(
            prompt,
            generation_config={
                "temperature": 0.85,  # Criatividade para gerar questões variadas
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 32768,
                "response_mime_type": "application/json"
            }
        )

        questions_dict = self._parse_json(response.text)

        print("=" * 80)
        print("DEBUG - DESAFIO FINAL GERADO (30 questões):")
        print(f"Easy: {len(questions_dict.get('easy_questions', []))} questões")
        print(f"Medium: {len(questions_dict.get('medium_questions', []))} questões")
        print(f"Hard: {len(questions_dict.get('hard_questions', []))} questões")
        print("=" * 80)

        return questions_dict


gemini_service = GeminiService()