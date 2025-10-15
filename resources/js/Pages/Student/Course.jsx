import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

// Função para remover HTML e truncar texto
const stripHtmlAndTruncate = (html, maxLength = 150) => {
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

export default function Course({ auth, course, activities, enrollment, progress }) {
    const user = auth.user;
    const [showCompletedOnly, setShowCompletedOnly] = useState(false);

    const filteredActivities = showCompletedOnly
        ? activities.filter(activity => activity.is_completed)
        : activities;

    const getActivityIcon = (type) => {
        const icons = {
            'reading': '📖',
            'quiz': '❓',
            'assignment': '📝',
            'video': '🎥',
            'lesson': '📚'
        };
        return icons[type] || '📌';
    };

    const getTypeLabel = (type) => {
        const labels = {
            'reading': 'Leitura',
            'quiz': 'Quiz',
            'assignment': 'Exercício',
            'video': 'Vídeo',
            'lesson': 'Lição'
        };
        return labels[type] || 'Atividade';
    };

    const handleActivityClick = (activity) => {
        // Permitir acesso a atividades concluídas OU acessíveis
        if (!activity.can_access && !activity.is_completed) {
            return;
        }

        // Usar URL manual para evitar problemas com Ziggy
        router.get(`/student/activities/${activity.id}`);
    };

    const ActivityCard = ({ activity, index }) => (
        <div
            className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                activity.is_completed
                    ? 'border-green-200 bg-green-50 cursor-pointer hover:border-green-400 hover:shadow-lg'
                    : activity.can_access
                    ? 'border-blue-200 hover:border-blue-400 hover:shadow-xl cursor-pointer'
                    : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
            onClick={() => handleActivityClick(activity)}
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            activity.is_completed 
                                ? 'bg-green-500 text-white'
                                : activity.can_access
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-200 text-gray-400'
                        }`}>
                            {activity.is_completed ? '✓' : getActivityIcon(activity.type)}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <h3 className={`font-bold text-lg ${
                                    activity.can_access ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                    {activity.title}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    activity.is_completed
                                        ? 'bg-green-100 text-green-800'
                                        : activity.can_access
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {getTypeLabel(activity.type)}
                                </span>
                            </div>
                            <p className={`text-sm ${
                                activity.can_access ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                                {stripHtmlAndTruncate(activity.description, 150)}
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className={`text-lg font-bold ${
                            activity.can_access ? 'text-yellow-600' : 'text-gray-400'
                        }`}>
                            🏆 {activity.points_value}
                        </div>
                        <div className="text-xs text-gray-500">pontos</div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                            <span className="mr-1">⏱️</span>
                            <span>{activity.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-1">📋</span>
                            <span>Ordem {activity.order}</span>
                        </div>
                        {activity.attempts > 0 && (
                            <div className="flex items-center">
                                <span className="mr-1">🔁</span>
                                <span>{activity.attempts} tentativa{activity.attempts !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {activity.is_completed ? (
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-green-600 font-medium">Concluído</span>
                                {activity.score !== null && (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                        {activity.score} ✓
                                    </span>
                                )}
                            </div>
                        ) : activity.can_access ? (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                Disponível
                            </span>
                        ) : (
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                🔒 Bloqueado
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            📚 {course.title}
                        </h2>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {progress.percentage}% concluído
                        </span>
                    </div>
                    <button
                        onClick={() => router.get(route('student.courses'))}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        ← Voltar aos Cursos
                    </button>
                </div>
            }
        >
            <Head title={`Curso: ${course.title}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Course Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden shadow-lg rounded-xl">
                        <div className="p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                                    {course.description && (
                                        <p className="text-blue-100 text-lg mb-4">{course.description}</p>
                                    )}
                                    <div className="flex items-center space-x-6 text-sm">
                                        <div className="flex items-center">
                                            <span className="mr-2">👨‍🏫</span>
                                            <span>{course.instructor?.name || 'Instrutor'}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-2">📅</span>
                                            <span>Matriculado em {new Date(enrollment.created_at).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block text-6xl opacity-20">
                                    🎓
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Seu Progresso</h3>
                                <div className="text-sm text-gray-600">
                                    {progress.completed} de {progress.total} atividades
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progresso do Curso</span>
                                    <span className="text-lg font-bold text-blue-600">{progress.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                                    <div 
                                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-4 rounded-full transition-all duration-700 relative overflow-hidden"
                                        style={{ width: `${progress.percentage}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{progress.completed}</div>
                                    <div className="text-sm text-gray-600">Atividades Concluídas</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">{progress.total - progress.completed}</div>
                                    <div className="text-sm text-gray-600">Atividades Restantes</div>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {activities.reduce((total, activity) => {
                                            return total + (activity.is_completed ? activity.points_value : 0);
                                        }, 0)}
                                    </div>
                                    <div className="text-sm text-gray-600">Pontos Ganhos</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desafio Final - Aparece apenas com 100% */}
                    {progress.percentage === 100 && (
                        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 rounded-xl shadow-2xl overflow-hidden animate-pulse">
                            <div className="p-8 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="text-6xl animate-bounce">🏆</div>
                                            <div>
                                                <h2 className="text-3xl font-bold">Desafio Final Desbloqueado!</h2>
                                                <p className="text-yellow-200 text-lg">
                                                    Complete os 3 níveis e desbloqueie o título de Mestre do Curso
                                                </p>
                                            </div>
                                        </div>

                                        {/* Indicadores de progresso do desafio */}
                                        <div className="flex items-center space-x-4 mt-4">
                                            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                                                <span>🟢</span>
                                                <span className="text-sm">Fácil</span>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                                                <span>🟡</span>
                                                <span className="text-sm">Médio</span>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                                                <span>🔴</span>
                                                <span className="text-sm">Difícil</span>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-yellow-400/30 px-3 py-1 rounded-full">
                                                <span>👑</span>
                                                <span className="text-sm font-bold">Mestre do Curso</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.visit(route('student.challenge.show', course.id))}
                                        className="hidden md:block px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-yellow-100 transition-all duration-300 transform hover:scale-110 shadow-2xl"
                                    >
                                        🚀 Iniciar Desafio Final
                                    </button>
                                </div>

                                {/* Botão mobile */}
                                <button
                                    onClick={() => router.visit(route('student.challenge.show', course.id))}
                                    className="md:hidden w-full mt-4 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-yellow-100 transition-all duration-300 shadow-2xl"
                                >
                                    🚀 Iniciar Desafio Final
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filter Controls */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Atividades do Curso</h3>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setShowCompletedOnly(false)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                                            !showCompletedOnly 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Todas ({activities.length})
                                    </button>
                                    <button
                                        onClick={() => setShowCompletedOnly(true)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                                            showCompletedOnly 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Concluídas ({progress.completed})
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Activities List */}
                        <div className="p-6">
                            {filteredActivities && filteredActivities.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredActivities.map((activity, index) => (
                                        <ActivityCard key={activity.id} activity={activity} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">
                                        {showCompletedOnly ? '🎉' : '📚'}
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                                        {showCompletedOnly 
                                            ? 'Nenhuma atividade concluída ainda'
                                            : 'Nenhuma atividade disponível'
                                        }
                                    </h3>
                                    <p className="text-gray-600">
                                        {showCompletedOnly 
                                            ? 'Complete atividades para vê-las aqui!'
                                            : 'As atividades aparecerão aqui conforme são liberadas.'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-start space-x-3">
                            <div className="text-2xl">💡</div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Como Funciona a Progressão?</h3>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• Complete as atividades em sequência para desbloquear as próximas</li>
                                    <li>• Ganhe pontos ao concluir cada atividade com sucesso</li>
                                    <li>• Atividades bloqueadas (🔒) só são liberadas após completar as anteriores</li>
                                    <li>• Você pode refazer atividades para melhorar sua pontuação</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}