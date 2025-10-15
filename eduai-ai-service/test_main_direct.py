"""Test main.py OpenAPI generation directly"""
import sys
sys.dont_write_bytecode = True  # Disable .pyc files

try:
    print("Importing app.main...")
    from app.main import app

    print("Generating OpenAPI schema...")
    schema = app.openapi()

    print("SUCCESS!")
    print(f"Paths: {len(schema.get('paths', {}))} endpoints")
    print(f"Components: {len(schema.get('components', {}).get('schemas', {}))} schemas")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
