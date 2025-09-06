import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Assignment({ auth, activity, course, userActivity, hasCompleted }) {
    const user = auth.user;
    const [assignmentStarted, setAssignmentStarted] = useState(false);
    const [assignmentText, setAssignmentText] = useState('');
    const [startTime] = useState(new Date());
    
    const { post, processing } = useForm();

    const startAssignment = () => {
        setAssignmentStarted(true);
    };

    const submitAssignment = () => {
        if (assignmentText.trim().length < 50) {
            alert('Por favor, escreva pelo menos 50 caracteres na sua resposta.');
            return;
        }

        post(route('student.quiz.submit', activity.id), {
            answers: {},
            assignment_text: assignmentText,
            assignment_completed: true,
            time_spent: Math.floor((new Date() - startTime) / 1000)
        });
    };

    // Gerar prompt do exercício baseado no módulo
    const getAssignmentPrompt = () => {
        const module = activity.content?.module || 'o tema estudado';
        
        return {
            title: activity.title,
            instructions: `
                <h3>📝 Instruções do Exercício</h3>
                <p>${activity.description}</p>
                
                <h4>🎯 O que fazer:</h4>
                <ul>
                    <li>Reflita sobre os conceitos de <strong>${module}</strong> que você estudou</li>
                    <li>Escreva suas reflexões de forma clara e organizada</li>
                    <li>Use exemplos práticos quando possível</li>
                    <li>Demonstre sua compreensão do assunto</li>
                </ul>

                <h4>📏 Critérios:</h4>
                <ul>
                    <li>Mínimo de 50 caracteres</li>
                    <li>Resposta relacionada ao tema</li>
                    <li>Demonstração de reflexão crítica</li>
                </ul>

                <h4>💡 Prompt para sua reflexão:</h4>
                <div style="background: #e0e7ff; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #6366f1;">
                    <p><strong>Questão reflexiva:</strong></p>
                    <p>Com base no que você aprendeu sobre ${module}, descreva:</p>
                    <ol>
                        <li>Os principais conceitos que mais chamaram sua atenção</li>
                        <li>Como você poderia aplicar esse conhecimento na prática</li>
                        <li>Que dúvidas ou curiosidades surgiram durante o estudo</li>
                    </ol>
                </div>
            `
        };
    };

    const assignmentContent = getAssignmentPrompt();

    if (hasCompleted) {
        return (
            <AuthenticatedLayout
                user={user}
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        ✅ Exercício Concluído
                    </h2>
                }
            >
                <Head title={`Exercício: ${activity.title}`} />

                <div className="py-8">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                        
                        {/* Success Message */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h1 className="text-3xl font-bold text-green-800 mb-4">
                                Excelente! Exercício Concluído!
                            </h1>
                            <p className="text-lg text-green-700 mb-6">
                                Você completou com sucesso: <strong>{activity.title}</strong>
                            </p>
                            
                            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center">
                                    <span className="text-2xl mr-2">🏆</span>
                                    <span className="text-lg font-medium text-green-800">
                                        +{activity.points_value} pontos conquistados!
                                    </span>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-blue-800">
                                    <span className="font-medium">💡 Parabéns pela reflexão!</span> 
                                    <p className="mt-2 text-sm">Exercícios práticos ajudam a consolidar o aprendizado e desenvolver pensamento crítico.</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => router.get(route('student.courses.show', course.id))}
                                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200"
                            >
                                📚 Continuar Curso
                            </button>
                            <button
                                onClick={() => router.get(route('student.dashboard'))}
                                className="px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200"
                            >
                                🎯 Ver Progresso
                            </button>
                        </div>
                        
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        📝 {activity.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                            🏆 {activity.points_value} pts
                        </div>
                        <div className="text-gray-600">
                            ⏱️ {activity.duration_minutes} min
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Exercício: ${activity.title}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Assignment Content */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-8">
                            {!assignmentStarted ? (
                                /* Assignment Intro */
                                <div className="text-center">
                                    <div className="text-6xl mb-6">📝</div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                        {assignmentContent.title}
                                    </h1>
                                    <p className="text-lg text-gray-600 mb-8">
                                        {activity.description}
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                                            <div className="text-2xl font-bold text-orange-600">📋</div>
                                            <div className="text-sm text-gray-600 mt-2">Exercício Prático</div>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">⏱️ {activity.duration_minutes}min</div>
                                            <div className="text-sm text-gray-600 mt-2">Tempo Sugerido</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">🏆 {activity.points_value}</div>
                                            <div className="text-sm text-gray-600 mt-2">Pontos Possíveis</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={startAssignment}
                                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        <span className="mr-2">🚀</span>
                                        Começar Exercício
                                    </button>
                                </div>
                            ) : (
                                /* Assignment Form */
                                <div>
                                    <div 
                                        className="prose prose-lg max-w-none mb-8"
                                        dangerouslySetInnerHTML={{ __html: assignmentContent.instructions }}
                                    />

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ✍️ Sua Resposta:
                                        </label>
                                        <textarea
                                            value={assignmentText}
                                            onChange={(e) => setAssignmentText(e.target.value)}
                                            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                                            placeholder="Escreva sua reflexão aqui... (mínimo 50 caracteres)"
                                        />
                                        <div className="mt-2 flex justify-between items-center">
                                            <span className={`text-sm ${assignmentText.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                                                {assignmentText.length} caracteres
                                                {assignmentText.length >= 50 && ' ✓'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                💡 Dica: Seja específico e use exemplos
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={submitAssignment}
                                            disabled={processing || assignmentText.trim().length < 50}
                                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                                        >
                                            {processing ? (
                                                <>
                                                    <span className="animate-spin mr-2">⏳</span>
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="mr-2">📤</span>
                                                    Enviar Exercício
                                                </>
                                            )}
                                        </button>
                                    </div>
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

                        <div className="text-sm text-gray-500">
                            💭 Reflita sobre o que aprendeu e seja criativo!
                        </div>
                    </div>

                </div>
            </div>
            
            <style jsx>{`
                .prose h3 { color: #374151; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                .prose h4 { color: #4b5563; margin-top: 1rem; margin-bottom: 0.5rem; }
                .prose p { margin-bottom: 1rem; }
                .prose ul { margin: 1rem 0; padding-left: 1.5rem; }
                .prose ol { margin: 1rem 0; padding-left: 1.5rem; }
                .prose li { margin-bottom: 0.5rem; }
            `}</style>
        </AuthenticatedLayout>
    );
}