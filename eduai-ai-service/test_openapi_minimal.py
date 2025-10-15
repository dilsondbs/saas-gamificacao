"""Test minimal OpenAPI generation"""
from fastapi import FastAPI
from app.models.schemas import CourseGenerationResponse, HealthCheckResponse

app = FastAPI()

@app.get("/health", response_model=HealthCheckResponse)
def health():
    return {
        "status": "healthy",
        "service": "test",
        "version": "1.0",
        "uptime_seconds": 0,
        "providers": {"openai": "available"},
        "timestamp": 1234.56
    }

if __name__ == "__main__":
    print("Testing OpenAPI schema generation...")
    try:
        schema = app.openapi()
        print("SUCCESS: OpenAPI schema generated!")
        print(f"Title: {schema['info']['title']}")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
