import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

// Função para remover HTML e truncar texto
const stripHtmlAndTruncate = (html, maxLength = 300) => {
    console.log('🔍 stripHtmlAndTruncate chamado:', { html: html?.substring(0, 100), maxLength });

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

export default function Show({ auth, activity, userProgress }) {
    const [loading, setLoading] = useState(false);

    const handleCompleteActivity = () => {
        setLoading(true);
        // Here you would implement activity completion logic
        // For now, just redirect back
        setTimeout(() => {
            router.get(route('student.courses.show', activity.course.id));
        }, 1000);
    };

    const getActivityIcon = (type) => {
        const icons = {
            'lesson': '📚',
            'quiz': '❓',
            'video': '🎥',
            'reading': '📖',
            'assignment': '📝',
            'project': '🚀'
        };
        return icons[type] || '📄';
    };

    const getActivityTypeLabel = (type) => {
        const labels = {
            'lesson': 'Aula',
            'quiz': 'Quiz',
            'video': 'Vídeo',
            'reading': 'Leitura',
            'assignment': 'Tarefa',
            'project': 'Projeto'
        };
        return labels[type] || type;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {getActivityIcon(activity.type)} {activity.title}
                    </h2>
                    {userProgress && userProgress.completed && (
                        <div className="text-sm text-green-600 font-medium">
                            ✅ Concluído
                        </div>
                    )}
                </div>
            }
        >
            <Head title={`${activity.title} - Atividade`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Activity Header */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-3xl mr-4">
                                    {getActivityIcon(activity.type)}
                                </span>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {activity.title}
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        {getActivityTypeLabel(activity.type)} • {activity.points_value || 10} pontos
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <Link
                                    href={route('student.courses.show', activity.course.id)}
                                    className="hover:text-blue-600"
                                >
                                    📚 {activity.course.title}
                                </Link>
                            </div>

                            {userProgress && userProgress.completed && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center">
                                        <div className="text-green-500 mr-3">
                                            <span className="text-xl">🎉</span>
                                        </div>
                                        <div>
                                            <p className="text-green-800 font-medium">
                                                Atividade Concluída!
                                            </p>
                                            <p className="text-green-700 text-sm">
                                                Concluída em: {new Date(userProgress.completed_at).toLocaleDateString('pt-BR')}
                                                {userProgress.score && ` • Pontuação: ${userProgress.score}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Content */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                📖 Descrição da Atividade
                            </h3>

                            <div className="prose max-w-none text-gray-700 mb-6">
                                {activity.description ? (
                                    <p>{console.log('📝 activity.description:', activity.description?.substring(0, 100))}{stripHtmlAndTruncate(activity.description, 300)}</p>
                                ) : (
                                    <p className="text-gray-500 italic">
                                        Nenhuma descrição disponível para esta atividade.
                                    </p>
                                )}
                            </div>

                            {/* Activity Content */}
                            {activity.content && (
                                <div className="border-t pt-6">
                                    <h4 className="text-md font-semibold text-gray-900 mb-3">
                                        📋 Conteúdo
                                    </h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700">
                                            {typeof activity.content === 'object' && activity.content?.content
                                                ? stripHtmlAndTruncate(activity.content.content, 400)
                                                : stripHtmlAndTruncate(activity.description || 'Sem descrição disponível', 400)
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Activity Type Specific Content */}
                            {activity.type === 'lesson' && (
                                <div className="border-t pt-6">
                                    <h4 className="text-md font-semibold text-gray-900 mb-3">
                                        🎓 Conteúdo da Aula
                                    </h4>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-blue-800">
                                            Esta é uma aula teórica. Leia o conteúdo com atenção e
                                            certifique-se de entender todos os conceitos antes de prosseguir.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activity.type === 'quiz' && (
                                <div className="border-t pt-6">
                                    <h4 className="text-md font-semibold text-gray-900 mb-3">
                                        ❓ Quiz
                                    </h4>
                                    <div className="bg-yellow-50 rounded-lg p-4">
                                        <p className="text-yellow-800 mb-3">
                                            Este é um quiz para testar seus conhecimentos.
                                        </p>
                                        {!userProgress?.completed && (
                                            <SecondaryButton className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                                                🎯 Iniciar Quiz
                                            </SecondaryButton>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                        <Link href={route('student.courses.show', activity.course.id)}>
                            <SecondaryButton>
                                ← Voltar ao Curso
                            </SecondaryButton>
                        </Link>

                        <div className="space-x-3">
                            {!userProgress?.completed ? (
                                <PrimaryButton
                                    onClick={handleCompleteActivity}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Concluindo...
                                        </>
                                    ) : (
                                        '✅ Marcar como Concluído'
                                    )}
                                </PrimaryButton>
                            ) : (
                                <SecondaryButton>
                                    🔄 Revisar Atividade
                                </SecondaryButton>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}