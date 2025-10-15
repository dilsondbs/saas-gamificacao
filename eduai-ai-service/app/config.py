"""Configuration Management for EduAI AI Service"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application Settings"""

    # Service Configuration
    SERVICE_NAME: str = "eduai-ai-service"
    SERVICE_PORT: int = 8001
    SERVICE_HOST: str = "0.0.0.0"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # AI Provider API Keys
    OPENAI_API_KEY: str
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str

    # AI Models
    OPENAI_MODEL: str = "gpt-4o"
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"
    GEMINI_MODEL: str = "gemini-1.5-pro"

    # Default Provider
    DEFAULT_PROVIDER: str = "openai"  # Options: openai, claude, gemini

    # Routing Thresholds
    HEAVY_CONTENT_THRESHOLD: int = 2000  # chars
    SIMPLE_CONTENT_THRESHOLD: int = 1000  # chars

    # Rate Limiting
    MAX_REQUESTS_PER_MINUTE: int = 10
    MAX_FILE_SIZE_MB: int = 50

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""

    # Database
    DATABASE_URL: str = ""

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # Laravel Integration
    LARAVEL_API_URL: str = "http://localhost:8000"
    LARAVEL_API_SECRET: str = ""

    # Monitoring
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090

    class Config:
        env_file = ".env"
        case_sensitive = True


# Routing Rules Configuration
ROUTING_RULES = {
    "pdf_heavy": {
        "min_chars": 2000,
        "provider": "openai",
        "reason": "Complex PDF content requires GPT-4o reliability"
    },
    "pdf_medium": {
        "min_chars": 1000,
        "max_chars": 2000,
        "provider": "gemini",
        "reason": "Medium complexity, Gemini is cost-effective"
    },
    "pdf_simple": {
        "max_chars": 1000,
        "provider": "gemini",
        "reason": "Simple content, Gemini sufficient"
    },
    "video": {
        "provider": "openai",
        "reason": "Video transcription requires GPT-4o"
    },
    "premium": {
        "provider": "claude",
        "reason": "User requested premium quality"
    },
    "fallback": {
        "provider": "gemini",
        "reason": "Fallback when primary provider fails"
    }
}

# Provider Cost Configuration (per 1M tokens)
PROVIDER_COSTS = {
    "openai": {
        "input": 0.50,   # $0.50 per 1M input tokens
        "output": 1.50,  # $1.50 per 1M output tokens
    },
    "claude": {
        "input": 3.00,   # $3.00 per 1M input tokens
        "output": 15.00, # $15.00 per 1M output tokens
    },
    "gemini": {
        "input": 0.50,   # $0.50 per 1M input tokens (1.5 Pro)
        "output": 1.50,  # $1.50 per 1M output tokens
    }
}

# Retry Configuration
RETRY_CONFIG = {
    "max_attempts": 3,
    "initial_delay": 1,  # seconds
    "max_delay": 10,     # seconds
    "exponential_base": 2
}

# Timeout Configuration
TIMEOUT_CONFIG = {
    "pdf_extraction": 30,      # seconds
    "ai_generation": 120,      # seconds
    "total_request": 180       # seconds
}

# Instantiate settings
settings = Settings()
