"""OpenAI GPT-4o Service - Primary AI Provider"""
import logging
import json
from typing import Dict, Tuple
from openai import AsyncOpenAI, OpenAIError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.config import settings, RETRY_CONFIG
from app.models.schemas import CourseDataSchema, ExtractedContent, GenerationMetadata

logger = logging.getLogger(__name__)


class OpenAIService:
    """Service for generating courses using OpenAI GPT-4o"""

    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured")

        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        logger.info(f"✅ OpenAI Service initialized with model: {self.model}")

    @retry(
        stop=stop_after_attempt(RETRY_CONFIG["max_attempts"]),
        wait=wait_exponential(
            multiplier=RETRY_CONFIG["exponential_base"],
            min=RETRY_CONFIG["initial_delay"],
            max=RETRY_CONFIG["max_delay"]
        ),
        retry=retry_if_exception_type(OpenAIError),
        reraise=True
    )
    async def generate_course(
        self,
        extracted_content: ExtractedContent,
        title: str,
        difficulty: str,
        target_audience: str | None = None
    ) -> Tuple[CourseDataSchema, GenerationMetadata]:
        """
        Generate a complete course using OpenAI GPT-4o

        Returns:
            Tuple of (CourseDataSchema, GenerationMetadata)
        """
        logger.info(f"🤖 Generating course with OpenAI GPT-4o: '{title}'")

        # Build optimized prompt
        prompt = self._build_prompt(
            extracted_content=extracted_content,
            title=title,
            difficulty=difficulty,
            target_audience=target_audience
        )

        try:
            # Call OpenAI API with structured output (JSON mode)
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt()
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},  # Force JSON output
                temperature=0.7,
                max_tokens=8000,
                top_p=0.9
            )

            # Extract response
            content = response.choices[0].message.content
            usage = response.usage

            logger.info(
                f"✅ OpenAI response received: "
                f"{usage.prompt_tokens} input + {usage.completion_tokens} output tokens"
            )

            # Parse JSON
            course_json = json.loads(content)

            # Validate and create CourseDataSchema
            course_data = CourseDataSchema(**course_json)

            # Create metadata
            metadata = GenerationMetadata(
                provider="openai",
                model=self.model,
                generation_method="gpt4o_json_mode",
                tokens_used={
                    "input": usage.prompt_tokens,
                    "output": usage.completion_tokens
                },
                cost_usd=self._calculate_cost(usage.prompt_tokens, usage.completion_tokens),
                generation_time_ms=0,  # Will be filled by caller
                confidence_score=self._calculate_confidence(course_data),
                routing_reason="OpenAI GPT-4o selected for high reliability"
            )

            logger.info(f"💰 Cost: ${metadata.cost_usd:.6f}, Confidence: {metadata.confidence_score:.0%}")

            return course_data, metadata

        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parsing error: {e}")
            logger.error(f"Raw content: {content[:500]}...")
            raise ValueError(f"OpenAI returned invalid JSON: {str(e)}")

        except OpenAIError as e:
            logger.error(f"❌ OpenAI API error: {e}")
            raise

        except Exception as e:
            logger.error(f"❌ Unexpected error in OpenAI generation: {e}")
            raise

    def _get_system_prompt(self) -> str:
        """System prompt defining the AI's role"""
        return """Você é um PEDAGOGO ESPECIALISTA em design instrucional e criação de cursos educacionais de alta qualidade.

Sua missão é criar cursos EXCEPCIONAIS, ESTRUTURADOS e ENVOLVENTES em português brasileiro.

DIRETRIZES OBRIGATÓRIAS:
✓ Crie conteúdo DENSO, PRÁTICO e ACIONÁVEL
✓ Baseie-se RIGOROSAMENTE no material fornecido
✓ Use linguagem adequada ao público-alvo
✓ Objetivos de aprendizagem ESPECÍFICOS e MENSURÁVEIS
✓ Progressão lógica e pedagógica entre módulos

IMPORTANTE: Retorne APENAS JSON válido, sem texto adicional."""

    def _build_prompt(
        self,
        extracted_content: ExtractedContent,
        title: str,
        difficulty: str,
        target_audience: str | None
    ) -> str:
        """Build optimized prompt for course generation"""

        audience_text = f"para {target_audience}" if target_audience else "para público geral"
        difficulty_map = {
            "beginner": "iniciante (conceitos básicos, exemplos simples)",
            "intermediate": "intermediário (conteúdo prático, casos reais)",
            "advanced": "avançado (técnicas especializadas, arquiteturas complexas)"
        }
        difficulty_text = difficulty_map.get(difficulty, difficulty_map["intermediate"])

        # Limit content to avoid token overflow
        content_preview = extracted_content.text[:3000] if len(extracted_content.text) > 3000 else extracted_content.text

        return f"""Crie um curso completo sobre: "{title}"

NÍVEL: {difficulty_text}
PÚBLICO-ALVO: {audience_text}

CONTEÚDO DO MATERIAL FORNECIDO:
{content_preview}

ESTRUTURA JSON OBRIGATÓRIA:
{{
  "title": "{title}",
  "description": "Descrição envolvente e profissional (100-300 palavras)",
  "difficulty": "{difficulty}",
  "estimated_hours": 8,
  "points_per_completion": 100,
  "modules": [
    {{
      "title": "Nome do Módulo 1",
      "description": "O que o aluno aprenderá neste módulo (50-150 palavras)",
      "lessons": [
        {{
          "title": "Aula 1: Conceitos Fundamentais",
          "content": "Conteúdo DETALHADO da aula baseado no material (mínimo 200 palavras)",
          "duration_minutes": 45,
          "objectives": ["Objetivo específico 1", "Objetivo específico 2"],
          "type": "lesson",
          "points": 15
        }},
        {{
          "title": "Quiz: Verificação de Conhecimento",
          "content": "Perguntas de múltipla escolha sobre o conteúdo",
          "duration_minutes": 15,
          "objectives": ["Avaliar compreensão dos conceitos"],
          "type": "quiz",
          "points": 20
        }}
      ]
    }}
  ],
  "learning_objectives": [
    "Objetivo geral 1",
    "Objetivo geral 2",
    "Objetivo geral 3"
  ],
  "prerequisites": ["Pré-requisito 1", "Pré-requisito 2"]
}}

REGRAS:
- Crie 3-5 módulos baseados no conteúdo fornecido
- Cada módulo deve ter 2-4 lições
- Misture tipos: lesson, quiz, assignment
- Conteúdo das lições deve ser DETALHADO (200+ palavras cada)
- Use INFORMAÇÕES REAIS do material fornecido
- Duração total: 6-20 horas
- Retorne APENAS o JSON, sem markdown ou texto adicional"""

    def _calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost in USD"""
        from app.config import PROVIDER_COSTS
        costs = PROVIDER_COSTS["openai"]
        return (input_tokens / 1_000_000) * costs["input"] + (output_tokens / 1_000_000) * costs["output"]

    def _calculate_confidence(self, course_data: CourseDataSchema) -> float:
        """Calculate confidence score based on course quality"""
        score = 0.0

        # Check modules (25%)
        if len(course_data.modules) >= 3:
            score += 0.25
        elif len(course_data.modules) >= 2:
            score += 0.15

        # Check lessons per module (25%)
        avg_lessons = sum(len(m.lessons) for m in course_data.modules) / len(course_data.modules)
        if avg_lessons >= 3:
            score += 0.25
        elif avg_lessons >= 2:
            score += 0.15

        # Check content quality (25%)
        avg_content_length = sum(
            len(lesson.content) for module in course_data.modules for lesson in module.lessons
        ) / sum(len(m.lessons) for m in course_data.modules)

        if avg_content_length >= 200:
            score += 0.25
        elif avg_content_length >= 100:
            score += 0.15

        # Check objectives (15%)
        if len(course_data.learning_objectives) >= 3:
            score += 0.15
        elif len(course_data.learning_objectives) >= 1:
            score += 0.08

        # Check description quality (10%)
        if len(course_data.description) >= 100:
            score += 0.10
        elif len(course_data.description) >= 50:
            score += 0.05

        return min(score, 1.0)


# Export singleton instance
openai_service = OpenAIService()
