"""Pydantic Models/Schemas for EduAI AI Service"""
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

# ==================== REQUEST MODELS ====================

class CourseGenerationRequest(BaseModel):
    """Request model for course generation"""
    title: str = Field(..., min_length=5, max_length=200, description="Course title")
    difficulty: str = Field(
        default="intermediate",
        description="Course difficulty level"
    )
    target_audience: Optional[str] = Field(
        None,
        max_length=200,
        description="Target audience description"
    )
    provider: Optional[str] = Field(
        default="auto",
        description="AI provider to use (auto = intelligent routing)"
    )
    premium_quality: bool = Field(
        default=False,
        description="Request premium quality generation (uses Claude)"
    )

    # Removed json_schema_extra to fix OpenAPI generation


# ==================== RESPONSE MODELS ====================

class QuizQuestionSchema(BaseModel):
    """Schema for a quiz question"""
    question: str = Field(..., min_length=10, description="Question text")
    options: List[str] = Field(default_factory=list, description="Answer options")
    correct_answer: str = Field(..., description="Correct answer")
    explanation: str = Field(..., min_length=20, description="Explanation")
    type: str = Field(default="multiple_choice", description="Question type")
    points: int = Field(default=10, ge=1, le=100)
    order: int = Field(default=1, ge=1)


class LessonSchema(BaseModel):
    """Schema for a single lesson"""
    title: str
    content: str = Field(..., min_length=50, description="Lesson content (min 50 chars)")
    duration_minutes: int = Field(ge=5, le=120, description="Duration in minutes (5-120)")
    objectives: List[str] = Field(default_factory=list)
    type: str = "lesson"
    points: int = Field(default=10, ge=0, le=100)
    order: int = Field(default=1, ge=1)


class QuizSchema(BaseModel):
    """Schema for a quiz activity"""
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    type: str = "quiz"
    points: int = Field(default=10, ge=0, le=100)
    duration_minutes: int = Field(ge=5, le=60, description="Quiz time limit")
    order: int = Field(default=1, ge=1)
    questions: List[QuizQuestionSchema] = Field(..., min_items=3, max_items=10)


class ModuleSchema(BaseModel):
    """Schema for a course module"""
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=500)
    activities: List[Union[LessonSchema, QuizSchema]] = Field(..., min_items=1, max_items=20)
    order: int = Field(default=1, ge=1)


class CourseDataSchema(BaseModel):
    """Complete course data schema"""
    title: str
    description: str = Field(..., min_length=20, max_length=1000)
    difficulty: str
    estimated_hours: int = Field(ge=1, le=200, description="Total course hours")
    points_per_completion: int = Field(default=100, ge=0)
    modules: List[ModuleSchema] = Field(..., min_items=1, max_items=20)
    learning_objectives: List[str] = Field(default_factory=list)
    prerequisites: List[str] = Field(default_factory=list)
    final_challenge_questions: Optional[Dict[str, List[Dict[str, Any]]]] = Field(
        default=None,
        description='Final challenge questions organized by difficulty (easy, medium, hard)'
    )


class GenerationMetadata(BaseModel):
    """Metadata about the generation process"""
    provider: str
    model: str
    generation_method: str
    tokens_used: Dict[str, int] = Field(
        default_factory=lambda: {"input": 0, "output": 0}
    )
    cost_usd: float = Field(default=0.0, ge=0)
    generation_time_ms: int = Field(default=0, ge=0)
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
    routing_reason: str = ""


class CourseGenerationResponse(BaseModel):
    """Response model for successful course generation"""
    success: bool = True
    course_data: CourseDataSchema
    metadata: GenerationMetadata
    requires_review: bool = Field(
        default=False,
        description="Whether course requires human review"
    )
    warnings: List[str] = Field(default_factory=list)

    # Removed json_schema_extra to fix OpenAPI generation


class ErrorResponse(BaseModel):
    """Response model for errors"""
    success: bool = False
    error: str
    error_code: str
    details: Optional[Dict[str, Any]] = None
    retry_possible: bool = False


class AsyncTaskResponse(BaseModel):
    """Response for async task creation"""
    task_id: str
    status: str
    status_url: str
    estimated_time_seconds: int = 60


class TaskStatusResponse(BaseModel):
    """Response for task status check"""
    task_id: str
    status: str
    progress: int = Field(ge=0, le=100, description="Progress percentage")
    result: Optional[CourseGenerationResponse] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ==================== INTERNAL MODELS ====================

class ExtractedContent(BaseModel):
    """Model for extracted PDF content"""
    text: str
    char_count: int
    word_count: int
    page_count: int = 0
    has_images: bool = False
    language: str = "unknown"
    quality_score: float = Field(ge=0.0, le=1.0, default=0.5)


class RoutingDecision(BaseModel):
    """Model for AI provider routing decision"""
    provider: str
    reason: str
    confidence: float = Field(ge=0.0, le=1.0)
    estimated_cost: float
    estimated_time_seconds: int


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    uptime_seconds: int
    providers: Dict[str, str]  # Changed from Literal to str to fix OpenAPI schema generation
    timestamp: float
