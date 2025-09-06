import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index(props) {
    const auth = props.auth || {};
    const user = auth.user || {};
    const activities = props.activities || [];
    const courses = props.courses || [];
    const stats = props.stats || {};
    const filters = props.filters || {};
    
    const [search, setSearch] = useState(filters.search || '');
    const [course, setCourse] = useState(filters.course || '');
    const [type, setType] = useState(filters.type || '');

    const handleSearch = () => {
        router.get(route('instructor.activities.index'), {
            search,
            course,
            type,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getTypeIcon = (activityType) => {
        const icons = {
            video: '🎥',
            quiz: '❓',
            reading: '📖',
            assignment: '📝',
            project: '🚀'
        };
        return icons[activityType] || '📋';
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

    const ActivityCard = ({ activity }) => (
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-2">
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold text-white rounded-full ${getTypeBadge(activity?.type)}`}>
                                {getTypeIcon(activity?.type)} {getTypeLabel(activity?.type)}
                            </span>
                            {activity?.is_required && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                    ⚠️ Obrigatória
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-gray-800 transition-colors duration-300">
                            {activity?.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {activity?.description || 'Sem descrição disponível'}
                        </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            activity?.is_active 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                                : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                        }`}>
                            {activity?.is_active ? '✅ Ativa' : '⏸️ Inativa'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative p-6">
                {/* Course Info */}
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                        <span className="text-sm font-medium text-blue-700">📚 Curso:</span>
                        <span className="ml-2 text-sm font-semibold text-blue-800">{activity?.course?.title}</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            ⭐ {activity?.points_value || 0}
                        </div>
                        <div className="text-xs font-medium text-green-700">Pontos</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                            ⏱️ {activity?.duration_minutes || 0}
                        </div>
                        <div className="text-xs font-medium text-orange-700">Minutos</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                    <Link
                        href={route('instructor.activities.show', activity?.id)}
                        className="flex-1 text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        👁️ Ver
                    </Link>
                    <Link
                        href={route('instructor.activities.edit', activity?.id)}
                        className="flex-1 text-center bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        ✏️ Editar
                    </Link>
                </div>
            </div>
        </div>
    );

    const StatCard = ({ icon, title, value, color, gradient }) => (
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <div className="relative p-6">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 p-4 rounded-xl bg-gradient-to-r ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-3xl">{icon}</span>
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <p className={`text-3xl font-bold ${color} group-hover:scale-105 transition-transform duration-300`}>
                            {value}
                        </p>
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
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            📋 Minhas Atividades
                        </h1>
                        <p className="text-gray-600 mt-1">Gerencie todas as atividades dos seus cursos</p>
                    </div>
                    <Link
                        href={route('instructor.activities.create')}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        <span className="mr-2">✨</span>
                        Nova Atividade
                    </Link>
                </div>
            }
        >
            <Head title="Minhas Atividades" />

            <div className="py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard
                            icon="📋"
                            title="Total de Atividades"
                            value={stats?.total_activities || 0}
                            color="text-blue-600"
                            gradient="from-blue-500 to-blue-600"
                        />
                        <StatCard
                            icon="🎥"
                            title="Vídeos"
                            value={stats?.by_type?.video || 0}
                            color="text-red-600"
                            gradient="from-red-500 to-red-600"
                        />
                        <StatCard
                            icon="❓"
                            title="Quizzes"
                            value={stats?.by_type?.quiz || 0}
                            color="text-green-600"
                            gradient="from-green-500 to-green-600"
                        />
                        <StatCard
                            icon="📝"
                            title="Tarefas"
                            value={stats?.by_type?.assignment || 0}
                            color="text-purple-600"
                            gradient="from-purple-500 to-purple-600"
                        />
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <span className="mr-3">🔍</span>
                                Filtros e Busca
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">Encontre atividades específicas</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        🔍 Buscar por título
                                    </label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Digite o título..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        📚 Filtrar por curso
                                    </label>
                                    <select
                                        value={course}
                                        onChange={(e) => setCourse(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                    >
                                        <option value="">Todos os cursos</option>
                                        {courses.map((c) => (
                                            <option key={c?.id} value={c?.id}>
                                                {c?.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        🎯 Tipo de atividade
                                    </label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                    >
                                        <option value="">Todos os tipos</option>
                                        <option value="video">🎥 Vídeo</option>
                                        <option value="quiz">❓ Quiz</option>
                                        <option value="reading">📖 Leitura</option>
                                        <option value="assignment">📝 Tarefa</option>
                                        <option value="project">🚀 Projeto</option>
                                    </select>
                                </div>
                                
                                <div className="flex items-end space-x-2">
                                    <button
                                        onClick={handleSearch}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    >
                                        🔍 Buscar
                                    </button>
                                    <Link
                                        href={route('instructor.activities.index')}
                                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    >
                                        🔄 Limpar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activities Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                        <span className="mr-3">🎯</span>
                                        Suas Atividades
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        {activities?.length || 0} atividade(s) encontrada(s)
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-8">
                            {/* Activities Grid */}
                            {activities && activities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {activities.map((activity) => (
                                        <ActivityCard key={activity?.id} activity={activity} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="max-w-md mx-auto">
                                        <div className="text-8xl mb-6">📋</div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                            {search || course || type ? 'Nenhuma atividade encontrada' : 'Nenhuma atividade criada'}
                                        </h3>
                                        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                            {search || course || type
                                                ? 'Tente ajustar os filtros para encontrar as atividades desejadas.'
                                                : 'Crie sua primeira atividade para engajar seus alunos!'
                                            }
                                        </p>
                                        
                                        <Link
                                            href={route('instructor.activities.create')}
                                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                        >
                                            <span className="mr-3 text-xl">✨</span>
                                            Criar Primeira Atividade
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}