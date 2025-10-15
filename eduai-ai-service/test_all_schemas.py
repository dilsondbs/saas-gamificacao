"""Test ALL schemas for OpenAPI generation"""
from fastapi import FastAPI, File, UploadFile, Form
from app.models.schemas import (
    CourseGenerationRequest,
    CourseGenerationResponse,
    ErrorResponse,
    HealthCheckResponse
)

app = FastAPI(title="Test All Schemas")

@app.post("/generate/course", response_model=CourseGenerationResponse)
async def generate_course(
    file: UploadFile = File(...),
    title: str = Form(...),
    difficulty: str = Form(default="intermediate"),
    target_audience: str = Form(default=None),
    premium_quality: bool = Form(default=False),
    provider: str = Form(default="auto")
):
    pass

@app.get("/health", response_model=HealthCheckResponse)
def health():
    pass

if __name__ == "__main__":
    print("Testing OpenAPI with ALL schemas...")
    try:
        schema = app.openapi()
        print(f"SUCCESS! Generated {len(schema.get('paths', {}))} paths")
        print(f"Components: {len(schema.get('components', {}).get('schemas', {}))} schemas")

        # Print all schema names
        schemas = schema.get('components', {}).get('schemas', {})
        for schema_name in schemas.keys():
            print(f"  - {schema_name}")

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
