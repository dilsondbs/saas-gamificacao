import logging
from app.models.schemas import ExtractedContent, RoutingDecision
from app.config import settings, PROVIDER_COSTS

logger = logging.getLogger(__name__)


class AIRouter:
    """
    ARCHITECTURE: Single-provider (Gemini) system
    - OpenAI removed to eliminate quota/cost unpredictability
    - Gemini provides 90%+ reliability at predictable costs
    - Git history preserves removed code for future reference
    """

    def __init__(self):
        self.provider = "gemini"

    def route(
        self,
        extracted_content: ExtractedContent,
        premium_quality: bool = False,
        preferred_provider: str | None = None,
        content_type: str = "pdf"
    ) -> RoutingDecision:
        logger.info(f"🧠 Routing to Gemini: {extracted_content.char_count} chars")

        estimated_input_tokens = extracted_content.char_count // 4
        estimated_output_tokens = min(8000, estimated_input_tokens * 3)

        costs = PROVIDER_COSTS["gemini"]
        estimated_cost = (
            (estimated_input_tokens / 1_000_000) * costs["input"] +
            (estimated_output_tokens / 1_000_000) * costs["output"]
        )

        base_time = 30 + (extracted_content.char_count // 100)
        estimated_time = int(base_time * 0.8)

        decision = RoutingDecision(
            provider="gemini",
            reason="Gemini-only architecture",
            confidence=0.9,
            estimated_cost=round(estimated_cost, 6),
            estimated_time_seconds=estimated_time
        )

        logger.info(
            f"✅ Routing: GEMINI "
            f"(confidence: 90%, cost: ${estimated_cost:.4f}, time: ~{estimated_time}s)"
        )

        return decision

    def get_provider_status(self) -> dict:
        return {
            "gemini": "available" if settings.GEMINI_API_KEY else "unavailable"
        }


router = AIRouter()
