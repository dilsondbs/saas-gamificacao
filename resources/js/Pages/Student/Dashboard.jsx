import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth, stats, topStudents, recentActivities }) {
    const user = auth.user;

    const StatCard = ({ title, value, subtitle, icon, gradient, textColor = "text-white" }) => (
        <div className={`${gradient} overflow-hidden shadow-lg rounded-xl transform hover:scale-105 transition-all duration-300`}>
            <div className="p-6">
                <div className="flex items-center">
                    <div className="flex-1">
                        <h3 className={`text-lg font-medium ${textColor}`}>{title}</h3>
                        <p className={`text-3xl font-bold ${textColor} mt-1`}>{value}</p>
                        <p className={`${textColor} opacity-90 text-sm mt-1`}>{subtitle}</p>
                    </div>
                    <div className="text-5xl opacity-80">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );

    const ActivityIcon = ({ type }) => {
        const icons = {
            badge: "🏆",
            points: "⭐",
            course: "📚"
        };
        return icons[type] || "📌";
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Dashboard do Estudante
                    </h2>
                    <div className="text-sm text-gray-600">
                        {new Date().toLocaleDateString('pt-BR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Estudante" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Welcome Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden shadow-lg rounded-xl">
                        <div className="p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Olá, {user.name}! 🎓
                                    </h1>
                                    <p className="text-blue-100 text-lg">
                                        Continue sua jornada de aprendizado e conquiste novos objetivos!
                                    </p>
                                </div>
                                <div className="hidden md:block text-6xl opacity-20">
                                    🚀
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Meus Pontos"
                            value={stats?.totalPoints || 0}
                            subtitle="Total acumulado"
                            icon="🏆"
                            gradient="bg-gradient-to-br from-yellow-400 to-orange-500"
                        />
                        <StatCard
                            title="Badges"
                            value={stats?.badgesCount || 0}
                            subtitle="Conquistas desbloqueadas"
                            icon="🏅"
                            gradient="bg-gradient-to-br from-green-400 to-blue-500"
                        />
                        <StatCard
                            title="Cursos Ativos"
                            value={stats?.activeCourses || 0}
                            subtitle="Em progresso"
                            icon="📚"
                            gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                        />
                        <StatCard
                            title="Posição"
                            value={`#${stats?.rankPosition || 0}`}
                            subtitle="No ranking geral"
                            icon="🎯"
                            gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Top Students Leaderboard */}
                        <div className="lg:col-span-2 bg-white overflow-hidden shadow-lg rounded-xl">
                            <div className="p-6">
                                <div className="flex items-center mb-6">
                                    <div className="text-2xl mr-3">🏆</div>
                                    <h3 className="text-xl font-bold text-gray-900">Top 5 Estudantes</h3>
                                </div>
                                <div className="space-y-4">
                                    {topStudents && topStudents.map((student, index) => (
                                        <div 
                                            key={student.id} 
                                            className={`flex items-center p-4 rounded-lg transition-all duration-200 ${
                                                student.id === user.id 
                                                    ? 'bg-blue-50 border-2 border-blue-200 transform scale-105' 
                                                    : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                        >
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                                index === 0 ? 'bg-yellow-500' :
                                                index === 1 ? 'bg-gray-400' :
                                                index === 2 ? 'bg-orange-400' : 'bg-blue-500'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className={`font-medium ${
                                                            student.id === user.id ? 'text-blue-900' : 'text-gray-900'
                                                        }`}>
                                                            {student.name}
                                                            {student.id === user.id && (
                                                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                                    Você
                                                                </span>
                                                            )}
                                                        </h4>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900">{student.total_points}</div>
                                                        <div className="text-xs text-gray-500">pontos</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="bg-white overflow-hidden shadow-lg rounded-xl">
                            <div className="p-6">
                                <div className="flex items-center mb-6">
                                    <div className="text-2xl mr-3">📈</div>
                                    <h3 className="text-xl font-bold text-gray-900">Atividade Recente</h3>
                                </div>
                                <div className="space-y-4">
                                    {recentActivities && recentActivities.map((activity, index) => (
                                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                            <div className="flex-shrink-0 text-2xl">
                                                <ActivityIcon type={activity.type} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.description}
                                                </p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-xs text-gray-500">{activity.date}</p>
                                                    {activity.points > 0 && (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                                            +{activity.points} pts
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Progress Section */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="text-2xl mr-3">📊</div>
                                    <h3 className="text-xl font-bold text-gray-900">Meu Progresso</h3>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Semana atual
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
                                    <span className="text-sm text-gray-600">{stats?.overallProgress || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                                         style={{width: `${stats?.overallProgress || 0}%`}}></div>
                                </div>
                                {stats?.overallProgress === 0 && (
                                    <div className="mt-2 text-xs text-gray-500 text-center">
                                        💡 Comece uma atividade para ver seu progresso!
                                    </div>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{stats?.streak || 0}</div>
                                    <div className="text-sm text-gray-600">Dias consecutivos</div>
                                    {stats?.streak === 0 && (
                                        <div className="text-xs text-gray-400 mt-1">Complete uma atividade hoje!</div>
                                    )}
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{stats?.completedActivities || 0}</div>
                                    <div className="text-sm text-gray-600">Atividades concluídas</div>
                                    {stats?.totalActivities > 0 && (
                                        <div className="text-xs text-gray-400 mt-1">de {stats.totalActivities} total</div>
                                    )}
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{stats?.studyTime || '0min'}</div>
                                    <div className="text-sm text-gray-600">Tempo estudando</div>
                                    {stats?.studyTime === '0min' && (
                                        <div className="text-xs text-gray-400 mt-1">Inicie seus estudos!</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}