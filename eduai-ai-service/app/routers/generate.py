"""Course Generation API Endpoints"""
import logging
import time
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.models.schemas import (
    CourseGenerationRequest,
    CourseGenerationResponse,
    ErrorResponse
)
from app.services.ai_router import router as ai_router
from app.services.gemini_service import gemini_service
from app.utils.pdf_extractor import pdf_extractor

logger = logging.getLogger(__name__)

router = APIRouter()


class QuizRequest(BaseModel):
    content: str
    title: str
    difficulty: str = "intermediate"


class FinalChallengeRequest(BaseModel):
    course_id: int
    course_title: str
    course_content: str
    course_modules: list


@router.post(
    "/course",
    response_model=CourseGenerationResponse,
    summary="Generate course from PDF",
    description="Upload a PDF and generate a complete course structure"
)
async def generate_course(
    file: UploadFile = File(..., description="PDF file to process"),
    title: str = Form(..., min_length=5, max_length=200),
    difficulty: str = Form(default="intermediate", pattern="^(beginner|intermediate|advanced)$"),
    target_audience: str = Form(default=None),
    premium_quality: bool = Form(default=False),
    provider: str = Form(default="auto")
):
    """
    Generate a complete course from uploaded PDF

    **Process:**
    1. Extract content from PDF
    2. Generate structured course with Gemini 2.5 Flash
    3. Return course data + metadata

    **Success Rate:** 90%+ with predictable costs
    """
    start_time = time.time()

    try:
        logger.info(f"📥 Received request: '{title}', difficulty: {difficulty}")

        # Step 1: Extract PDF content
        from io import BytesIO
        import tempfile
        import os

        pdf_content = await file.read()
        pdf_file_obj = BytesIO(pdf_content)
        extracted_content = await pdf_extractor.extract(pdf_file_obj)

        logger.info(f"📊 Extracted: {extracted_content.char_count} chars, quality: {extracted_content.quality_score:.0%}")

        # Step 2: Route to best provider
        routing_decision = ai_router.route(
            extracted_content=extracted_content,
            premium_quality=premium_quality,
            preferred_provider=provider if provider != "auto" else None,
            content_type="pdf"
        )

        logger.info(f"🧠 Routing: {routing_decision.provider.upper()} - {routing_decision.reason}")

        # Step 3: Generate course with Gemini
        is_pdf = file.content_type == "application/pdf"

        if is_pdf:
            try:
                logger.info("📄 Using Gemini File API for native PDF processing")

                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                    temp_file.write(pdf_content)
                    temp_file_path = temp_file.name

                try:
                    course_data, metadata = await gemini_service.upload_and_generate_from_pdf(
                        pdf_path=temp_file_path,
                        title=title,
                        difficulty=difficulty,
                        target_audience=target_audience or "Estudantes em geral"
                    )
                finally:
                    if os.path.exists(temp_file_path):
                        os.unlink(temp_file_path)

            except Exception as e:
                logger.warning(f"⚠️ File API failed, using text extraction fallback: {e}")
                course_data, metadata = await gemini_service.generate_course(
                    extracted=extracted_content,
                    title=title,
                    difficulty=difficulty,
                    target_audience=target_audience or "Estudantes em geral"
                )
        else:
            logger.info("✨ Using Gemini 2.5 Flash with text extraction")
            course_data, metadata = await gemini_service.generate_course(
                extracted=extracted_content,
                title=title,
                difficulty=difficulty,
                target_audience=target_audience or "Estudantes em geral"
            )

        # Step 4: Generate Final Challenge Questions (30 questions)
        logger.info("🎯 Generating Final Challenge questions (30 questions)...")
        final_challenge_start = time.time()

        try:
            # Prepare course content for final challenge generation
            course_content_text = f"{course_data.get('title', '')}\n\n"
            course_content_text += f"{course_data.get('description', '')}\n\n"

            # Extract lessons content from modules
            for module in course_data.get('modules', []):
                course_content_text += f"## {module.get('title', '')}\n"
                for activity in module.get('activities', []):
                    if activity.get('type') == 'lesson':
                        course_content_text += f"{activity.get('title', '')}\n"
                        # Strip HTML for cleaner content
                        import re
                        clean_content = re.sub('<[^<]+?>', '', activity.get('content', ''))
                        course_content_text += f"{clean_content[:500]}...\n\n"

            # Generate the 30 questions
            challenge_questions = await gemini_service.generate_final_challenge_questions(
                course_content=course_content_text,
                course_title=course_data.get('title', title),
                course_modules=course_data.get('modules', [])
            )

            # DEBUG: Ver o que realmente foi retornado
            logger.info(f'🔍 DEBUG: challenge_questions type = {type(challenge_questions)}')
            logger.info(f'🔍 DEBUG: challenge_questions keys = {list(challenge_questions.keys()) if isinstance(challenge_questions, dict) else "N/A"}')
            logger.info(f'🔍 DEBUG: easy_questions = {len(challenge_questions.get("easy_questions", []))} items')
            logger.info(f'🔍 DEBUG: Primeiro item easy_questions = {challenge_questions.get("easy_questions", [])[0] if challenge_questions.get("easy_questions") else "VAZIO"}')

            final_challenge_time_ms = int((time.time() - final_challenge_start) * 1000)

            # Validate question counts
            easy_count = len(challenge_questions.get('easy_questions', []))
            medium_count = len(challenge_questions.get('medium_questions', []))
            hard_count = len(challenge_questions.get('hard_questions', []))

            logger.info(
                f"✅ Final Challenge generated in {final_challenge_time_ms}ms - "
                f"Easy: {easy_count}, Medium: {medium_count}, Hard: {hard_count}"
            )

            # Add final challenge questions to course_data
            course_data['final_challenge_questions'] = {
                'easy': challenge_questions.get('easy_questions', []),
                'medium': challenge_questions.get('medium_questions', []),
                'hard': challenge_questions.get('hard_questions', [])
            }

            # Update metadata with final challenge info
            metadata['final_challenge_generated'] = True
            metadata['final_challenge_time_ms'] = final_challenge_time_ms
            metadata['total_questions'] = easy_count + medium_count + hard_count

        except Exception as e:
            logger.error(f"⚠️ Final Challenge generation failed (non-critical): {str(e)}")
            # Don't fail the entire course generation if final challenge fails
            course_data['final_challenge_questions'] = None
            metadata['final_challenge_generated'] = False
            metadata['final_challenge_error'] = str(e)

        # Calculate total time
        total_time_ms = int((time.time() - start_time) * 1000)
        metadata['generation_time_ms'] = total_time_ms

        # Determine if requires review (low confidence or fallback used)
        requires_review = metadata['confidence_score'] < 0.7

        logger.info(
            f"✅ Course generated successfully in {total_time_ms}ms "
            f"(cost: ${metadata['cost_usd']:.6f}, confidence: {metadata['confidence_score']:.0%})"
        )

        return CourseGenerationResponse(
            success=True,
            course_data=course_data,
            metadata=metadata,
            requires_review=requires_review,
            warnings=[]
        )

    except ValueError as e:
        logger.error(f"❌ Validation error: {e}")
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": str(e),
                "error_code": "VALIDATION_ERROR",
                "retry_possible": False
            }
        )

    except Exception as e:
        logger.error(f"❌ Generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Course generation failed",
                "error_code": "GENERATION_ERROR",
                "details": str(e),
                "retry_possible": True
            }
        )


@router.post("/quiz", response_model=dict)
async def generate_quiz(request: QuizRequest):
    logger.info(f"📥 Quiz request - content: {len(request.content) if request.content else 'None'}, title: {request.title}, difficulty: {request.difficulty}")
    try:
        logger.info(f"📝 Quiz generation request: '{request.title}', difficulty: {request.difficulty}")

        start_time = time.time()

        quiz_data = await gemini_service.generate_quiz(
            module_content=request.content,
            module_title=request.title,
            difficulty=request.difficulty
        )

        total_time_ms = int((time.time() - start_time) * 1000)

        logger.info(f"✅ Quiz generated successfully in {total_time_ms}ms")

        return {
            "success": True,
            "questions": quiz_data.get("questions", []),
            "generation_time_ms": total_time_ms
        }

    except Exception as e:
        logger.error(f"❌ Quiz generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/final-challenge",
    response_model=dict,
    summary="Generate Final Challenge Questions",
    description="Generate 30 questions for Final Challenge distributed across 3 difficulty levels"
)
async def generate_final_challenge(request: FinalChallengeRequest):
    """
    Generate 30 Final Challenge questions based on entire course content

    **Distribution:**
    - 10 easy questions (basic concepts, definitions)
    - 10 medium questions (application, interpretation)
    - 10 hard questions (synthesis, critical thinking)

    **Returns:**
    - easy_questions: List of 10 easy questions
    - medium_questions: List of 10 medium questions
    - hard_questions: List of 10 hard questions
    - generation_time_ms: Time taken to generate
    """
    start_time = time.time()

    try:
        logger.info(f"🎯 Final Challenge generation request: Course ID {request.course_id} - '{request.course_title}'")
        logger.info(f"📚 Course has {len(request.course_modules)} modules")

        # Generate the 30 questions using Gemini
        questions_data = await gemini_service.generate_final_challenge_questions(
            course_content=request.course_content,
            course_title=request.course_title,
            course_modules=request.course_modules
        )

        total_time_ms = int((time.time() - start_time) * 1000)

        # Validate we got exactly 10 questions per level
        easy_count = len(questions_data.get('easy_questions', []))
        medium_count = len(questions_data.get('medium_questions', []))
        hard_count = len(questions_data.get('hard_questions', []))

        logger.info(
            f"✅ Final Challenge generated successfully in {total_time_ms}ms - "
            f"Easy: {easy_count}, Medium: {medium_count}, Hard: {hard_count}"
        )

        if easy_count != 10 or medium_count != 10 or hard_count != 10:
            logger.warning(
                f"⚠️ Question count mismatch! Expected 10/10/10, got {easy_count}/{medium_count}/{hard_count}"
            )

        return {
            "success": True,
            "easy_questions": questions_data.get('easy_questions', []),
            "medium_questions": questions_data.get('medium_questions', []),
            "hard_questions": questions_data.get('hard_questions', []),
            "generation_time_ms": total_time_ms,
            "metadata": {
                "course_id": request.course_id,
                "course_title": request.course_title,
                "total_questions": easy_count + medium_count + hard_count,
                "provider": "gemini",
                "model": "gemini-2.5-flash"
            }
        }

    except Exception as e:
        logger.error(f"❌ Final Challenge generation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Final Challenge generation failed",
                "error_code": "CHALLENGE_GENERATION_ERROR",
                "details": str(e),
                "retry_possible": True
            }
        )


@router.get("/test", summary="Test endpoint")
async def test_endpoint():
    """Simple test endpoint"""
    return {"status": "OK", "message": "EduAI AI Service is running"}
