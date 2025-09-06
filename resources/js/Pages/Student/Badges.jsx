import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Badges({ auth, userBadges, availableBadges, progressBadges }) {
    const user = auth.user;

    const formatCriteria = (badge) => {
        if (!badge.criteria) return 'Sem critérios definidos';
        
        const { type, target_value } = badge.criteria;
        
        switch (type) {
            case 'completion':
                return `Completar ${target_value} curso(s)`;
            case 'points':
                return `Acumular ${target_value} pontos`;
            case 'streak':
                return `${target_value} dias consecutivos de acesso`;
            case 'special':
                return badge.criteria.description || 'Badge especial';
            default:
                return `Meta: ${target_value}`;
        }
    };

    const BadgeCard = ({ badge, isCompleted = false, progress = null, target = null }) => {
        const progressPercentage = progress && target ? Math.min((progress / target) * 100, 100) : 0;
        
        return (
            <div className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                isCompleted ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400' : 'bg-white border border-gray-200'
            }`}>
                {isCompleted && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✓
                    </div>
                )}
                
                <div className="p-6 text-center">
                    <div className={`text-6xl mb-4 ${isCompleted ? 'animate-pulse' : 'opacity-50'}`}>
                        {badge.icon}
                    </div>
                    
                    <h3 className={`text-lg font-bold mb-2 ${
                        isCompleted ? 'text-yellow-800' : 'text-gray-700'
                    }`}>
                        {badge.name}
                    </h3>
                    
                    <p className={`text-sm mb-4 ${
                        isCompleted ? 'text-yellow-700' : 'text-gray-600'
                    }`}>
                        {badge.description}
                    </p>
                    
                    {progress !== null && target !== null && (
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progresso</span>
                                <span>{progress}/{target}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                        isCompleted ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {Math.round(progressPercentage)}% completo
                            </div>
                        </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                        {badge.requirement || (badge.criteria ? formatCriteria(badge) : 'Sem critérios definidos')}
                    </div>
                    
                    {isCompleted && (
                        <div className="mt-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            🎉 Conquistado!
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const completedBadges = progressBadges.filter(badge => badge.completed);
    const inProgressBadges = progressBadges.filter(badge => !badge.completed);

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        🏅 Minhas Badges
                    </h2>
                    <div className="text-sm text-gray-600">
                        {completedBadges.length} de {progressBadges.length} conquistadas
                    </div>
                </div>
            }
        >
            <Head title="Minhas Badges" />

            <div className="py-8">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Coleção de Badges 🏆
                                    </h1>
                                    <p className="text-purple-100 text-lg">
                                        Conquiste badges completando atividades e atingindo marcos!
                                    </p>
                                </div>
                                <div className="hidden md:block text-6xl opacity-20">
                                    🏅
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Overview */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Progresso Geral</h3>
                            <div className="text-lg font-medium text-gray-600">
                                {completedBadges.length}/{progressBadges.length}
                            </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                            <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${(completedBadges.length / progressBadges.length) * 100}%` }}
                            ></div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-gray-600">
                            <div>
                                <div className="text-2xl font-bold text-green-600">{completedBadges.length}</div>
                                <div>Conquistadas</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{inProgressBadges.length}</div>
                                <div>Em Progresso</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{user.total_points}</div>
                                <div>Pontos Totais</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {Math.round((completedBadges.length / progressBadges.length) * 100)}%
                                </div>
                                <div>Completo</div>
                            </div>
                        </div>
                    </div>

                    {/* Completed Badges */}
                    {completedBadges.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="text-2xl mr-2">🎉</span>
                                Badges Conquistadas ({completedBadges.length})
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {completedBadges.map((badge, index) => (
                                    <BadgeCard 
                                        key={index} 
                                        badge={badge} 
                                        isCompleted={true}
                                        progress={badge.progress}
                                        target={badge.target}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* In Progress Badges */}
                    {inProgressBadges.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="text-2xl mr-2">🎯</span>
                                Em Progresso ({inProgressBadges.length})
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {inProgressBadges.map((badge, index) => (
                                    <BadgeCard 
                                        key={index} 
                                        badge={badge} 
                                        isCompleted={false}
                                        progress={badge.progress}
                                        target={badge.target}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Badges Yet */}
                    {completedBadges.length === 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                            <div className="text-6xl mb-4">🏅</div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                Nenhuma badge conquistada ainda
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Complete quizzes e atividades para conquistar suas primeiras badges!
                            </p>
                            <button
                                onClick={() => window.location.href = route('student.courses')}
                                className="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors duration-200"
                            >
                                🚀 Começar Agora
                            </button>
                        </div>
                    )}

                    {/* How to Earn Badges */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                            💡 Como Conquistar Badges?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="bg-white p-4 rounded-lg shadow text-center">
                                <div className="text-3xl mb-2">🎯</div>
                                <h4 className="font-medium mb-1">Complete Quizzes</h4>
                                <p className="text-gray-600">Faça quizzes e acerte pelo menos 70%</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow text-center">
                                <div className="text-3xl mb-2">🏆</div>
                                <h4 className="font-medium mb-1">Acumule Pontos</h4>
                                <p className="text-gray-600">Ganhe pontos para desbloquear badges especiais</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow text-center">
                                <div className="text-3xl mb-2">📚</div>
                                <h4 className="font-medium mb-1">Estude Regularmente</h4>
                                <p className="text-gray-600">Mantenha consistência nos estudos</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow text-center">
                                <div className="text-3xl mb-2">🌟</div>
                                <h4 className="font-medium mb-1">Alcance Marcos</h4>
                                <p className="text-gray-600">Atinja metas específicas de progresso</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}