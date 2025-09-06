import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Leaderboard({ auth, topStudents, userPosition, stats }) {
    const user = auth.user;

    const getRankIcon = (position) => {
        switch(position) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '🏅';
        }
    };

    const getRankColor = (position) => {
        switch(position) {
            case 1: return 'from-yellow-400 to-yellow-600';
            case 2: return 'from-gray-300 to-gray-500';
            case 3: return 'from-orange-400 to-orange-600';
            default: return 'from-blue-400 to-blue-600';
        }
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        🏆 Ranking de Estudantes
                    </h2>
                    <div className="text-sm text-gray-600">
                        Sua posição: #{userPosition}
                    </div>
                </div>
            }
        >
            <Head title="Ranking de Estudantes" />

            <div className="py-8">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg mb-8 overflow-hidden">
                        <div className="p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Ranking Global 🌟
                                    </h1>
                                    <p className="text-purple-100 text-lg">
                                        Veja como você se compara com outros estudantes!
                                    </p>
                                </div>
                                <div className="hidden md:block text-6xl opacity-20">
                                    🏆
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="text-4xl mr-4">👥</div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Total de Estudantes</h3>
                                    <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="text-4xl mr-4">📊</div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Média de Pontos</h3>
                                    <p className="text-2xl font-bold text-green-600">{Math.round(stats.averagePoints || 0)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="text-4xl mr-4">🏆</div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Recorde Atual</h3>
                                    <p className="text-2xl font-bold text-purple-600">{stats.topScore || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Position Highlight */}
                    {userPosition > 3 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="text-2xl mr-3">🎯</div>
                                    <div>
                                        <h3 className="font-medium text-blue-900">Sua Posição Atual</h3>
                                        <p className="text-blue-700 text-sm">
                                            Você está em #{userPosition} com {user.total_points} pontos
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">#{userPosition}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Leaderboard */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="text-2xl mr-2">🏆</span>
                                Top Estudantes
                            </h3>
                            
                            <div className="space-y-4">
                                {topStudents && topStudents.length > 0 ? (
                                    topStudents.map((student, index) => {
                                        const position = index + 1;
                                        const isCurrentUser = student.id === user.id;
                                        
                                        return (
                                            <div 
                                                key={student.id}
                                                className={`relative overflow-hidden rounded-lg transition-all duration-200 ${
                                                    isCurrentUser 
                                                        ? 'ring-2 ring-blue-500 transform scale-105' 
                                                        : 'hover:shadow-md'
                                                }`}
                                            >
                                                {/* Background Gradient */}
                                                <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(position)} opacity-10`}></div>
                                                
                                                <div className="relative p-4 bg-white border border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            {/* Position Badge */}
                                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(position)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                                                <span className="text-sm">{position}</span>
                                                            </div>
                                                            
                                                            {/* Rank Icon */}
                                                            <div className="text-3xl">
                                                                {getRankIcon(position)}
                                                            </div>
                                                            
                                                            {/* Student Info */}
                                                            <div>
                                                                <h4 className={`font-bold text-lg ${
                                                                    isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                                                                }`}>
                                                                    {student.name}
                                                                    {isCurrentUser && (
                                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                                            Você
                                                                        </span>
                                                                    )}
                                                                </h4>
                                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                                    <span>🏆 {student.total_points} pontos</span>
                                                                    {position <= 3 && (
                                                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                                                            Top 3
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Points Display */}
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-gray-900">
                                                                {student.total_points}
                                                            </div>
                                                            <div className="text-xs text-gray-500">pontos</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-6xl mb-4">🏆</div>
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                                            Nenhum estudante encontrado
                                        </h3>
                                        <p className="text-gray-600">
                                            Seja o primeiro a pontuar!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Motivation Section */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                💪 Como Subir no Ranking?
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <div className="text-2xl mb-2">📚</div>
                                    <h4 className="font-medium mb-1">Complete Cursos</h4>
                                    <p className="text-gray-600">Matricule-se em cursos e complete todas as atividades</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <div className="text-2xl mb-2">🎯</div>
                                    <h4 className="font-medium mb-1">Faça Quizzes</h4>
                                    <p className="text-gray-600">Acerte pelo menos 70% das questões para ganhar pontos</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <div className="text-2xl mb-2">🔥</div>
                                    <h4 className="font-medium mb-1">Seja Consistente</h4>
                                    <p className="text-gray-600">Estude regularmente para manter sua posição</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}