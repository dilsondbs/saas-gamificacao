import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, activity, stats }) {
    const getTypeIcon = (type) => {
        const icons = {
            video: '🎥',
            quiz: '❓',
            reading: '📖',
            assignment: '📝',
            project: '🚀'
        };
        return icons[type] || '📋';
    };

    const getTypeBadge = (activityType) => {
        const badges = {
            video: 'bg-gradient-to-r from-red-500 to-red-600',
            quiz: 'bg-gradient-to-r from-blue-500 to-blue-600',
            reading: 'bg-gradient-to-r from-green-500 to-green-600',
            assignment: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
            project: 'bg-gradient-to-r from-purple-500 to-purple-600'
        };
        return badges[activityType] || 'bg-gradient-to-r from-gray-500 to-gray-600';
    };

    const getTypeLabel = (activityType) => {
        const labels = {
            video: 'Vídeo',
            quiz: 'Quiz',
            reading: 'Leitura',
            assignment: 'Tarefa',
            project: 'Projeto'
        };
        return labels[activityType] || 'Atividade';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {getTypeIcon(activity.type)} {activity.title}
                        </h1>
                        <p className="text-gray-600 mt-1">Detalhes e estatísticas da atividade</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            href={route('instructor.activities.edit', activity.id)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                            ✏️ Editar
                        </Link>
                        <Link
                            href={route('instructor.activities.index')}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                            ← Voltar
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={activity.title} />

            <div className="py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Activity Info Card */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-4">
                                        <span className={`inline-flex items-center px-4 py-2 text-sm font-semibold text-white rounded-full ${getTypeBadge(activity.type)}`}>
                                            {getTypeIcon(activity.type)} {getTypeLabel(activity.type)}
                                        </span>
                                        {activity.is_required && (
                                            <span className="ml-3 inline-flex items-center px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                ⚠️ Obrigatória
                                            </span>
                                        )}
                                        <span className={`ml-3 inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                            activity.is_active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {activity.is_active ? '✅ Ativa' : '⏸️ Inativa'}
                                        </span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{activity.title}</h1>
                                    {activity.description && (
                                        <p className="text-gray-600 mb-4">{activity.description}</p>
                                    )}
                                    <div className="flex items-center text-sm text-gray-500">
                                        <span>📚 {activity.course?.title}</span>
                                        <span className="mx-3">•</span>
                                        <span>⭐ {activity.points_value} pontos</span>
                                        <span className="mx-3">•</span>
                                        <span>⏱️ {activity.duration_minutes || 0} minutos</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                        👥 {stats?.total_students || 0}
                                    </div>
                                    <div className="text-sm font-medium text-blue-700">Total de Alunos</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                    <div className="text-3xl font-bold text-green-600 mb-2">
                                        ✅ {stats?.completed_count || 0}
                                    </div>
                                    <div className="text-sm font-medium text-green-700">Completaram</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                    <div className="text-3xl font-bold text-purple-600 mb-2">
                                        📊 {stats?.completion_rate || 0}%
                                    </div>
                                    <div className="text-sm font-medium text-purple-700">Taxa de Conclusão</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                                    <div className="text-3xl font-bold text-orange-600 mb-2">
                                        ⭐ {stats?.average_score || 0}
                                    </div>
                                    <div className="text-sm font-medium text-orange-700">Nota Média</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Progress */}
                    {activity.user_activities && activity.user_activities.length > 0 && (
                        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <span className="mr-3">📈</span>
                                    Progresso dos Alunos
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">Como os alunos estão se saindo nesta atividade</p>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-4">
                                    {activity.user_activities.map((userActivity) => (
                                        <div key={userActivity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                                                    <span className="text-lg font-bold text-white">
                                                        {userActivity.user?.name?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{userActivity.user?.name}</p>
                                                    <p className="text-sm text-gray-600">{userActivity.user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {userActivity.completed_at ? (
                                                    <div>
                                                        <div className="text-green-600 font-semibold">✅ Concluída</div>
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(userActivity.completed_at).toLocaleDateString('pt-BR')}
                                                        </div>
                                                        {userActivity.score && (
                                                            <div className="text-sm font-medium text-blue-600">
                                                                Nota: {userActivity.score}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : userActivity.started_at ? (
                                                    <div>
                                                        <div className="text-yellow-600 font-semibold">🟡 Em Progresso</div>
                                                        <div className="text-sm text-gray-500">
                                                            Iniciada em {new Date(userActivity.started_at).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500 font-semibold">⚪ Não Iniciada</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Content */}
                    {activity.content && Object.keys(activity.content).length > 0 && (
                        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <span className="mr-3">📄</span>
                                    Conteúdo da Atividade
                                </h2>
                            </div>
                            <div className="p-6">
                                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                    {JSON.stringify(activity.content, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}