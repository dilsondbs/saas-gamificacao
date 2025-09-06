import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, user, stats, recentActivities }) {
    const getRoleBadge = (userRole) => {
        const badges = {
            admin: 'bg-red-100 text-red-800',
            instructor: 'bg-purple-100 text-purple-800',
            student: 'bg-green-100 text-green-800'
        };
        return badges[userRole] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        👁️ Perfil de {user.name}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.users.edit', user.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            ✏️ Editar
                        </Link>
                        <Link
                            href={route('admin.users.index')}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            ← Voltar à Lista
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Perfil: ${user.name}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* User Profile Card */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-8 bg-gradient-to-r from-indigo-500 to-purple-600">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="ml-6 text-white">
                                    <h1 className="text-2xl font-bold">{user.name}</h1>
                                    <p className="text-indigo-100 text-lg">{user.email}</p>
                                    <div className="mt-2">
                                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadge(user.role)} bg-opacity-90`}>
                                            {user.role === 'admin' ? '👑 Administrador' :
                                             user.role === 'instructor' ? '👨‍🏫 Instrutor' : '🎓 Estudante'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-500">Membro desde</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-500">Email verificado</p>
                                    <p className={`text-lg font-semibold ${user.email_verified_at ? 'text-green-600' : 'text-red-600'}`}>
                                        {user.email_verified_at ? '✅ Sim' : '❌ Não'}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className="text-lg font-semibold text-green-600">🟢 Ativo</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards - Only for students */}
                    {user.role === 'student' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="text-3xl">⭐</div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Total de Pontos</p>
                                            <p className="text-2xl font-bold text-yellow-600">{stats.total_points}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="text-3xl">📚</div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Matrículas</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {stats.enrollments_count}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {stats.completed_courses} concluídos
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="text-3xl">🏅</div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Badges</p>
                                            <p className="text-2xl font-bold text-purple-600">{stats.badges_count}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="text-3xl">✅</div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Atividades</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {stats.activities_completed}
                                            </p>
                                            <p className="text-xs text-gray-500">concluídas</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Recent Activities - Only for students */}
                        {user.role === 'student' && (
                            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <span className="text-xl mr-2">🎯</span>
                                        Atividades Recentes
                                    </h3>
                                    
                                    {recentActivities && recentActivities.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentActivities.map((activity, index) => (
                                                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                            <span className="text-green-600 font-bold">✓</span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 flex-1">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {activity.activity?.title || 'Atividade'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Concluída em {new Date(activity.completed_at).toLocaleDateString('pt-BR')}
                                                        </div>
                                                        {activity.score && (
                                                            <div className="text-xs text-blue-600 font-medium">
                                                                Nota: {activity.score}%
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-semibold text-yellow-600">
                                                            +{activity.activity?.points_value || 0} pts
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="text-gray-400 text-4xl mb-2">📋</div>
                                            <p className="text-gray-500">Nenhuma atividade concluída ainda</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* User Actions */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-xl mr-2">⚙️</span>
                                    Ações Administrativas
                                </h3>
                                
                                <div className="space-y-4">
                                    <Link
                                        href={route('admin.users.edit', user.id)}
                                        className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                    >
                                        <div className="text-blue-500 text-2xl mr-3">✏️</div>
                                        <div>
                                            <div className="font-medium text-blue-900">Editar Usuário</div>
                                            <div className="text-sm text-blue-600">
                                                Alterar informações, papel ou pontos
                                            </div>
                                        </div>
                                    </Link>

                                    {user.role === 'student' && (
                                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                            <div className="text-green-500 text-2xl mr-3">📈</div>
                                            <div>
                                                <div className="font-medium text-green-900">Progresso do Estudante</div>
                                                <div className="text-sm text-green-600">
                                                    Acompanhe o desenvolvimento do aluno
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!user.email_verified_at && (
                                        <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                                            <div className="text-yellow-500 text-2xl mr-3">📧</div>
                                            <div>
                                                <div className="font-medium text-yellow-900">Email Não Verificado</div>
                                                <div className="text-sm text-yellow-600">
                                                    Considere reenviar o email de verificação
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {user.id !== auth.user.id && (
                                        <div className="flex items-center p-3 bg-red-50 rounded-lg">
                                            <div className="text-red-500 text-2xl mr-3">🗑️</div>
                                            <div>
                                                <div className="font-medium text-red-900">Zona Perigosa</div>
                                                <div className="text-sm text-red-600">
                                                    Excluir usuário - ação irreversível
                                                </div>
                                            </div>
                                        </div>
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