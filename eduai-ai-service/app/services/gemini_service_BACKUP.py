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
        limited_content = content[:15000]

        prompt = f"""Você é um especialista pedagógico criando material didático de alta qualidade.

DOCUMENTO ORIGINAL:
{limited_content}

Título do Curso: {title}
Dificuldade: {difficulty}
Público-alvo: {audience}

INSTRUÇÕES:
1. Extraia TODOS os conceitos e informações relevantes do documento
2. Mantenha 100% de fidelidade ao conteúdo original - NÃO invente informações
3. Para cada lição, organize em: Introdução → Conceitos-Chave → Exemplos → Aplicação Prática
4. Seja pedagógico e claro, mas NÃO resuma demais - use TODAS as informações disponíveis
5. Se o documento não tiver informação suficiente sobre um tema, seja honesto no conteúdo

IMPORTANTE: O professor espera lições COMPLETAS e DETALHADAS. Use todo o conteúdo disponível do documento, não economize informação.

Gere um curso estruturado seguindo este formato JSON exato:
{{
    "title": "{title}",
    "description": "descrição do curso (mínimo 50 caracteres)",
    "difficulty": "{difficulty}",
    "estimated_hours": número_inteiro,
    "points_per_completion": 100,
    "modules": [
        {{
            "title": "título do módulo",
            "description": "descrição do módulo (mínimo 20 caracteres)",
            "order": 1,
            "lessons": [
                {{
                    "title": "título da lição",
                    "content": "CONTEÚDO DETALHADO DA LIÇÃO (mínimo 600 palavras, seguindo a estrutura pedagógica: Introdução, Desenvolvimento, Aplicação Prática, Conclusão)",
                    "duration_minutes": número_entre_15_e_120,
                    "objectives": ["objetivo1", "objetivo2", "objetivo3"],
                    "type": "lesson",
                    "points": 10,
                    "order": 1
                }}
            ]
        }}
    ],
    "learning_objectives": ["objetivo1", "objetivo2", "objetivo3"],
    "prerequisites": ["prerequisito1", "prerequisito2"]
}}

Retorne apenas o JSON, sem texto adicional."""

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
                "temperature": 0.7,
                "top_p": 0.85,
                "top_k": 40,
                "max_output_tokens": 32768,
                "response_mime_type": "application/json"
            }
        )

        course_dict = self._parse_json(response.text)

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

        prompt = f"""Você é um especialista pedagógico criando material didático de excelência a partir do PDF.

Título do Curso: {title}
Dificuldade: {difficulty}
Público-alvo: {target_audience}

TAREFA: Crie um curso educacional completo baseado EXCLUSIVAMENTE no conteúdo do PDF fornecido.

REQUISITOS OBRIGATÓRIOS PARA CADA LIÇÃO:
1. **Fidelidade ao Conteúdo**: Use APENAS informações do PDF. Não invente ou extrapole.
2. **Profundidade**: Cada lição deve ter MÍNIMO 600 palavras de conteúdo rico e detalhado.
3. **Estrutura Pedagógica do "content"**:
   - Introdução (contextualize o tema em 2-3 parágrafos)
   - Desenvolvimento (explique conceitos com clareza e exemplos do documento)
   - Aplicação Prática (mostre como aplicar na realidade profissional)
   - Conclusão (síntese dos pontos-chave)

4. **Estilo de Escrita**:
   - Tom: Profissional mas acessível
   - Evite clichês genéricos
   - Use exemplos concretos do PDF
   - Varie estrutura das frases

5. **Qualidade**:
   - Prefira profundidade a extensão vazia
   - Valorize insights e conexões entre conceitos
   - Se o PDF não tiver informação suficiente sobre um tópico, seja honesto no conteúdo

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem markdown, sem blocos de código.

Estrutura JSON:
{{
    "title": "{title}",
    "description": "descrição do curso (mínimo 50 caracteres)",
    "difficulty": "{difficulty}",
    "estimated_hours": número_inteiro,
    "points_per_completion": 100,
    "modules": [
        {{
            "title": "título do módulo",
            "description": "descrição do módulo (mínimo 20 caracteres)",
            "order": 1,
            "lessons": [
                {{
                    "title": "título da lição",
                    "content": "CONTEÚDO DETALHADO DA LIÇÃO (mínimo 600 palavras, seguindo a estrutura pedagógica: Introdução, Desenvolvimento, Aplicação Prática, Conclusão)",
                    "duration_minutes": número_entre_15_e_120,
                    "objectives": ["objetivo1", "objetivo2", "objetivo3"],
                    "type": "lesson",
                    "points": 10,
                    "order": 1
                }}
            ]
        }}
    ],
    "learning_objectives": ["objetivo1", "objetivo2", "objetivo3"],
    "prerequisites": ["prerequisito1", "prerequisito2"]
}}

Retorne apenas o JSON, sem texto adicional."""

        response = await self.model.generate_content_async(
            [uploaded_file, prompt],
            generation_config={
                "temperature": 0.4,
                "top_p": 0.85,
                "top_k": 40,
                "max_output_tokens": 32768,
                "response_mime_type": "application/json"
            }
        )

        genai.delete_file(uploaded_file.name)

        course_dict = self._parse_json(response.text)

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


gemini_service = GeminiService()
