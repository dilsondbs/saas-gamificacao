"""Teste Simples - Gemini Service"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.gemini_service import gemini_service
from app.models.schemas import ExtractedContent


async def test():
    print("\n" + "="*60)
    print("TESTE GEMINI SERVICE")
    print("="*60 + "\n")

    test_content = """
    Python e uma linguagem de programacao de alto nivel.
    Principais caracteristicas:
    - Sintaxe simples
    - Interpretada
    - Multiplataforma
    """

    extracted = ExtractedContent(
        text=test_content,
        char_count=len(test_content),
        word_count=len(test_content.split()),
        quality_score=0.9,
        extraction_method="test"
    )

    print(f"Conteudo: {extracted.char_count} chars")
    print("Gerando curso...\n")

    try:
        course_data, metadata = await gemini_service.generate_course(
            extracted=extracted,
            title="Curso de Python para Iniciantes",
            difficulty="beginner",
            target_audience="Estudantes"
        )

        print("SUCESSO!\n")
        print(f"Provider: {metadata['provider']}")
        print(f"Model: {metadata['model']}")
        print(f"Titulo: {course_data['title']}")
        print(f"Modulos: {len(course_data['modules'])}")

        total_lessons = sum(len(m.get('lessons', [])) for m in course_data['modules'])
        print(f"Licoes: {total_lessons}")

        score = 0
        if len(course_data['modules']) >= 3:
            score += 30
        if total_lessons >= 10:
            score += 30
        if len(course_data.get('description', '')) > 50:
            score += 20
        if 'learning_objectives' in course_data:
            score += 20

        print(f"\nQUALIDADE: {score}%")

        if score >= 70:
            print("Status: EXCELENTE")
        else:
            print("Status: REGULAR")

        return True

    except Exception as e:
        print(f"ERRO: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(test())
    print("\n" + "="*60)
    print("TESTE CONCLUIDO" if success else "TESTE FALHOU")
    print("="*60 + "\n")
