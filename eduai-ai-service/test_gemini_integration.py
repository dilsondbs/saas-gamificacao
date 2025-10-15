"""
Teste de Integração - Gemini Service
Verifica se o Gemini Service está funcionando corretamente
"""

import asyncio
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.gemini_service import gemini_service
from app.models.schemas import ExtractedContent


async def test_gemini_service():
    """Testa geração de curso com Gemini"""

    print("=" * 60)
    print("TESTE DE INTEGRACAO - GEMINI SERVICE")
    print("=" * 60)
    print()

    # Dados de teste
    test_content = """
    Introdução à Programação Python

    Python é uma linguagem de programação de alto nível, interpretada e de propósito geral.
    É conhecida por sua sintaxe clara e legível, o que a torna ideal para iniciantes.

    Principais Características:
    - Sintaxe simples e intuitiva
    - Interpretada (não precisa compilar)
    - Multiplataforma (Windows, Mac, Linux)
    - Bibliotecas ricas para diversas áreas
    - Comunidade ativa e suporte

    Aplicações do Python:
    1. Desenvolvimento Web (Django, Flask)
    2. Ciência de Dados (Pandas, NumPy)
    3. Machine Learning (TensorFlow, scikit-learn)
    4. Automação de tarefas
    5. Análise de dados

    Conceitos Básicos:
    - Variáveis e Tipos de Dados
    - Estruturas de Controle (if, for, while)
    - Funções
    - Classes e Objetos
    - Módulos e Pacotes
    """

    extracted = ExtractedContent(
        text=test_content,
        char_count=len(test_content),
        word_count=len(test_content.split()),
        quality_score=0.9,
        extraction_method="test"
    )

    print("📄 Conteúdo de Teste:")
    print(f"   - Caracteres: {extracted.char_count}")
    print(f"   - Palavras: {extracted.word_count}")
    print(f"   - Qualidade: {extracted.quality_score:.0%}")
    print()

    print("🚀 Iniciando geração de curso com Gemini...")
    print()

    try:
        # Chamar o serviço Gemini
        course_data, metadata = await gemini_service.generate_course(
            extracted=extracted,
            title="Curso de Python para Iniciantes",
            difficulty="beginner",
            target_audience="Estudantes sem experiência em programação"
        )

        print("✅ SUCESSO! Curso gerado com Gemini")
        print()
        print("=" * 60)
        print("📊 RESULTADOS")
        print("=" * 60)
        print()

        # Metadata
        print("🔧 Metadata:")
        print(f"   - Provider: {metadata['provider']}")
        print(f"   - Model: {metadata['model']}")
        print(f"   - Confidence: {metadata['confidence_score']:.0%}")
        if 'tokens_used' in metadata:
            print(f"   - Tokens Input: {metadata['tokens_used']['input']}")
            print(f"   - Tokens Output: {metadata['tokens_used']['output']}")
        print()

        # Course Data
        print("📚 Dados do Curso:")
        print(f"   - Título: {course_data['title']}")
        print(f"   - Descrição: {course_data['description'][:100]}...")
        print(f"   - Dificuldade: {course_data['difficulty']}")
        print(f"   - Horas Estimadas: {course_data.get('estimated_hours', 'N/A')}")
        print(f"   - Módulos: {len(course_data['modules'])}")
        print()

        # Módulos
        print("📖 Estrutura dos Módulos:")
        total_lessons = 0
        for i, module in enumerate(course_data['modules'], 1):
            lessons_count = len(module.get('lessons', []))
            total_lessons += lessons_count
            print(f"   {i}. {module['title']}")
            print(f"      └─ {lessons_count} lições")

        print()
        print(f"📊 TOTAL: {len(course_data['modules'])} módulos, {total_lessons} lições")
        print()

        # Score de Qualidade
        score = 0
        max_score = 100

        # Critérios de qualidade
        if len(course_data['modules']) >= 3:
            score += 20
            print("✅ [+20] 3+ módulos")
        else:
            print("❌ [  0] Menos de 3 módulos")

        if total_lessons >= 10:
            score += 20
            print("✅ [+20] 10+ lições")
        else:
            print("❌ [  0] Menos de 10 lições")

        if len(course_data['description']) > 50:
            score += 15
            print("✅ [+15] Descrição completa")
        else:
            print("❌ [  0] Descrição curta")

        if 'learning_objectives' in course_data and len(course_data['learning_objectives']) > 0:
            score += 15
            print("✅ [+15] Objetivos de aprendizado")
        else:
            print("❌ [  0] Sem objetivos")

        # Verificar se lições têm conteúdo
        has_content = any(
            len(lesson.get('content', '')) > 50
            for module in course_data['modules']
            for lesson in module.get('lessons', [])
        )
        if has_content:
            score += 30
            print("✅ [+30] Lições com conteúdo detalhado")
        else:
            print("❌ [  0] Lições sem conteúdo")

        print()
        print("=" * 60)
        print(f"🎯 SCORE DE QUALIDADE: {score}/{max_score} ({score}%)")
        print("=" * 60)

        if score >= 80:
            print("🌟 EXCELENTE! Qualidade premium")
        elif score >= 60:
            print("👍 BOM! Qualidade aceitável")
        else:
            print("⚠️  REGULAR. Precisa melhorias")

        print()
        return True

    except Exception as e:
        print("❌ ERRO ao gerar curso:")
        print(f"   {type(e).__name__}: {str(e)}")
        print()
        import traceback
        print("Traceback:")
        traceback.print_exc()
        return False


async def main():
    """Executa todos os testes"""
    success = await test_gemini_service()

    print()
    print("=" * 60)
    if success:
        print("✅ TESTE CONCLUÍDO COM SUCESSO!")
        print()
        print("💡 Próximos passos:")
        print("   1. Reiniciar o FastAPI")
        print("   2. Testar via interface web do Laravel")
        print("   3. Monitorar logs para verificar roteamento")
    else:
        print("❌ TESTE FALHOU!")
        print()
        print("💡 Possíveis causas:")
        print("   1. API Key do Gemini inválida ou sem quota")
        print("   2. Erro de conexão com API")
        print("   3. Problema no parsing do JSON")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
