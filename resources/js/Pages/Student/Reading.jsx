import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Função para remover HTML e truncar texto
const stripHtmlAndTruncate = (html, maxLength = 400) => {
    if (!html) return '';

    // Remove tags HTML
    const text = html.replace(/<[^>]*>/g, '');

    // Decodifica entidades HTML
    const div = document.createElement('div');
    div.innerHTML = text;
    const decoded = div.textContent || div.innerText || '';

    // Trunca e adiciona ...
    if (decoded.length > maxLength) {
        return decoded.substring(0, maxLength).trim() + '...';
    }

    return decoded;
};

export default function Reading({ auth, activity, course, userActivity, hasCompleted }) {
    const user = auth.user;
    const [isReading, setIsReading] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    const [startTime] = useState(new Date());
    
    const { post, processing } = useForm();

    // Simular progresso de leitura
    useEffect(() => {
        if (isReading && !hasCompleted) {
            const interval = setInterval(() => {
                setReadingProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 1;
                });
            }, 200); // 20 segundos para completar a leitura

            return () => clearInterval(interval);
        }
    }, [isReading, hasCompleted]);

    const startReading = () => {
        setIsReading(true);
    };

    const completeReading = () => {
        post(route('student.quiz.submit', activity.id), {
            answers: {}, // Atividades de leitura não têm respostas
            reading_completed: true,
            time_spent: Math.floor((new Date() - startTime) / 1000) // Tempo em segundos
        });
    };

    // Conteúdo da leitura baseado no módulo e tipo
    const getReadingContent = () => {
        // ✅ PRIORIDADE 1: Usar HTML rico da atividade (gerado pela IA)
        if (activity.content?.content && typeof activity.content.content === 'string') {
            console.log('🎨 Usando HTML rico da atividade');
            return {
                title: activity.title,
                content: activity.content.content,
                wordCount: activity.content.content.length,
                estimatedTime: Math.ceil(activity.content.content.length / 1000) || 5
            };
        }

        const module = activity.content?.module || 'Módulo Geral';
        const realContent = activity.content?.real_content;
        const isAIGenerated = activity.content?.module; // Se tem módulo, foi gerado pela IA

        // Se há conteúdo real extraído do material, usar ele
        if (realContent && realContent.content) {
            return {
                title: realContent.title || activity.title,
                content: `
                    <h2>📖 ${realContent.title || activity.title}</h2>
                    <p><strong>Módulo:</strong> ${module}</p>
                    
                    <div class="content-section">
                        <h3>🎯 Conteúdo do Material</h3>
                        <div class="real-content">
                            ${realContent.content.replace(/\n/g, '</p><p>')}
                        </div>
                    </div>

                    <div class="content-section">
                        <h3>💡 Para Refletir</h3>
                        <p>Após a leitura deste conteúdo, reflita sobre:</p>
                        <ul>
                            <li>Quais são os pontos principais apresentados?</li>
                            <li>Como esse conhecimento se aplica na prática?</li>
                            <li>Que questões surgem a partir desta leitura?</li>
                        </ul>
                    </div>

                    <div class="content-section">
                        <h3>📊 Informações</h3>
                        <ul>
                            <li><strong>Palavras:</strong> ${realContent.word_count} palavras</li>
                            <li><strong>Tempo estimado:</strong> ${activity.duration_minutes} minutos</li>
                            <li><strong>Fonte:</strong> Material do curso</li>
                        </ul>
                    </div>
                `
            };
        } else if (isAIGenerated) {
            return {
                title: activity.title,
                content: `
                    <h2>📖 ${activity.title}</h2>
                    <p><strong>Módulo:</strong> ${module}</p>
                    
                    <div class="content-section">
                        <h3>🎯 Objetivo desta Lição</h3>
                        <p>${activity.description}</p>
                    </div>

                    <div class="content-section">
                        <h3>📚 Conteúdo Principal</h3>
                        <p>Nesta seção, você aprenderá sobre os conceitos fundamentais relacionados a <strong>${module}</strong>. 
                        Este material introdutório foi cuidadosamente elaborado para fornecer uma base sólida de conhecimento.</p>
                        
                        <h4>🔍 Pontos Importantes:</h4>
                        <ul>
                            <li>Compreensão dos conceitos básicos de ${module}</li>
                            <li>Aplicação prática dos conhecimentos adquiridos</li>
                            <li>Preparação para atividades e avaliações subsequentes</li>
                            <li>Desenvolvimento de pensamento crítico na área</li>
                        </ul>

                        <h4>💡 Para Refletir:</h4>
                        <p>Como esses conceitos se aplicam em situações do mundo real? 
                        Pense em exemplos práticos onde você poderia utilizar esse conhecimento.</p>

                        <h4>🔗 Conexões:</h4>
                        <p>Este conteúdo se conecta diretamente com as próximas atividades do curso, 
                        especialmente os quizzes e exercícios práticos que validarão seu aprendizado.</p>
                    </div>

                    <div class="content-section">
                        <h3>✅ Próximos Passos</h3>
                        <p>Após completar esta leitura, você estará preparado para:</p>
                        <ul>
                            <li>Participar de discussões sobre o tema</li>
                            <li>Resolver questões relacionadas ao ${module}</li>
                            <li>Aplicar os conceitos em exercícios práticos</li>
                        </ul>
                    </div>
                `
            };
        } else {
            // Conteúdo para atividades não geradas por IA (como materiais originais)
            return {
                title: activity.title,
                content: `
                    <h2>📖 ${activity.title}</h2>
                    
                    <div class="content-section">
                        <h3>🎯 Descrição</h3>
                        <p>${activity.description || 'Material de estudo importante para seu aprendizado.'}</p>
                    </div>

                    <div class="content-section">
                        <h3>📚 Conteúdo de Estudo</h3>
                        <p>Este é um material fundamental para o curso. Dedique tempo suficiente para absorver 
                        completamente as informações apresentadas.</p>
                        
                        <p><strong>Dica de Estudo:</strong> Faça anotações dos pontos mais importantes e 
                        questione-se sobre como aplicar esse conhecimento.</p>
                    </div>

                    <div class="content-section">
                        <h3>⏰ Tempo Estimado</h3>
                        <p>Tempo sugerido para esta atividade: <strong>${activity.duration_minutes} minutos</strong></p>
                    </div>
                `
            };
        }
    };

    const content = getReadingContent();

    // ✅ MODO REVISÃO: Se já completou, mostrar conteúdo direto sem progressão
    // Forçar início automático da leitura no modo revisão
    useEffect(() => {
        if (hasCompleted && !isReading) {
            setIsReading(true);
            setReadingProgress(100); // Já completado, progresso 100%
        }
    }, [hasCompleted]);

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {hasCompleted ? '📖 Revisão: ' : '📖 '}{activity.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm">
                        {hasCompleted && (
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                ✅ Concluída
                            </div>
                        )}
                        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                            🏆 {activity.points_value} pts
                        </div>
                        <div className="text-gray-600">
                            ⏱️ {activity.duration_minutes} min
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Leitura: ${activity.title}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Progress Bar - Ocultar no modo revisão */}
                    {isReading && readingProgress < 100 && !hasCompleted && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Progresso da Leitura</span>
                                <span className="text-lg font-bold text-purple-600">{Math.round(readingProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                                <div
                                    className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 h-4 rounded-full transition-all duration-300 relative overflow-hidden"
                                    style={{ width: `${readingProgress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 text-center">
                                Continue lendo para ganhar os pontos desta atividade!
                            </div>
                        </div>
                    )}

                    {/* Badge de Revisão */}
                    {hasCompleted && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-2xl">✅</span>
                                <span className="text-lg font-medium text-green-800">
                                    Modo Revisão - Você já completou esta leitura e ganhou {activity.points_value} pontos
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Reading Content */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-8">
                            {!isReading ? (
                                /* Start Reading */
                                <div className="text-center">
                                    <div className="text-6xl mb-6">📖</div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                        {content.title}
                                    </h1>
                                    <p className="text-lg text-gray-600 mb-8">
                                        {stripHtmlAndTruncate(activity.description, 400)}
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">📚</div>
                                            <div className="text-sm text-gray-600 mt-2">Material de Estudo</div>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">⏱️ {activity.duration_minutes}min</div>
                                            <div className="text-sm text-gray-600 mt-2">Tempo Estimado</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">🏆 {activity.points_value}</div>
                                            <div className="text-sm text-gray-600 mt-2">Pontos Possíveis</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={startReading}
                                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        <span className="mr-2">🚀</span>
                                        Iniciar Leitura
                                    </button>
                                </div>
                            ) : (
                                /* Reading Content */
                                <div>
                                    <div
                                        className="prose prose-lg prose-purple max-w-none
                                                   text-justify
                                                   prose-headings:text-purple-900 prose-headings:font-bold
                                                   prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
                                                   prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6 prose-h2:border-b-2 prose-h2:border-purple-200 prose-h2:pb-2
                                                   prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-4
                                                   prose-p:text-gray-700 prose-p:mb-4 prose-p:leading-relaxed prose-p:text-justify
                                                   prose-strong:text-purple-800 prose-strong:font-bold prose-strong:bg-yellow-100 prose-strong:px-1.5 prose-strong:py-0.5 prose-strong:rounded
                                                   prose-em:text-purple-600 prose-em:font-semibold prose-em:not-italic prose-em:bg-blue-50 prose-em:px-1
                                                   prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                                                   prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                                                   prose-li:mb-2 prose-li:text-gray-700 prose-li:text-justify
                                                   prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                                                   prose-blockquote:border-l-4 prose-blockquote:border-purple-500
                                                   prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-purple-50 prose-blockquote:py-3 prose-blockquote:my-4
                                                   prose-code:bg-purple-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
                                                   prose-code:text-sm prose-code:text-purple-800 prose-code:font-semibold
                                                   prose-table:border-collapse
                                                   prose-table:border-2
                                                   prose-table:border-purple-300
                                                   prose-table:w-full
                                                   prose-table:my-6
                                                   prose-thead:bg-purple-100
                                                   prose-th:border-2
                                                   prose-th:border-purple-300
                                                   prose-th:px-4
                                                   prose-th:py-3
                                                   prose-th:text-left
                                                   prose-th:font-bold
                                                   prose-th:text-purple-900
                                                   prose-td:border
                                                   prose-td:border-purple-200
                                                   prose-td:px-4
                                                   prose-td:py-3
                                                   prose-td:text-gray-700"
                                        dangerouslySetInnerHTML={{ __html: content.content }}
                                        style={{
                                            lineHeight: '1.9',
                                            fontSize: '1.05rem',
                                            textAlign: 'justify',
                                            hyphens: 'auto',
                                            WebkitHyphens: 'auto',
                                            MozHyphens: 'auto'
                                        }}
                                    />

                                    {readingProgress >= 100 && !hasCompleted && (
                                        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                                            <div className="text-4xl mb-4">🎉</div>
                                            <h3 className="text-xl font-bold text-green-800 mb-2">
                                                Leitura Concluída!
                                            </h3>
                                            <p className="text-green-700 mb-4">
                                                Parabéns! Você completou toda a leitura.
                                            </p>

                                            <button
                                                onClick={completeReading}
                                                disabled={processing}
                                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                                            >
                                                {processing ? (
                                                    <>
                                                        <span className="animate-spin mr-2">⏳</span>
                                                        Finalizando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="mr-2">✅</span>
                                                        Finalizar e Ganhar {activity.points_value} Pontos
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => router.get(route('student.courses.show', course.id))}
                            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-all font-medium"
                        >
                            ← Voltar ao Curso
                        </button>

                        {hasCompleted ? (
                            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                <span>✅</span>
                                <span>Modo Revisão - Pontos já conquistados</span>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                💡 Leia com atenção para absorver melhor o conteúdo
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <style>{`
                .prose h2 { color: #1f2937; margin-top: 2rem; margin-bottom: 1rem; }
                .prose h3 { color: #374151; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                .prose h4 { color: #4b5563; margin-top: 1rem; margin-bottom: 0.5rem; }
                .prose p { margin-bottom: 1rem; }
                .prose ul { margin: 1rem 0; padding-left: 1.5rem; }
                .prose li { margin-bottom: 0.5rem; }
                .content-section { margin: 2rem 0; padding: 1.5rem; background: #f9fafb; border-radius: 0.75rem; border-left: 4px solid #8b5cf6; }
            `}</style>
        </AuthenticatedLayout>
    );
}