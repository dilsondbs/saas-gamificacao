import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index(props) {
    // Debug: Log what props we receive
    console.log('Activities Index Props:', props);
    
    // Safe extraction with defaults
    const auth = props.auth || {};
    const user = auth.user || {};
    const activities = props.activities || {};
    const courses = props.courses || [];
    const stats = props.stats || {};
    const filters = props.filters || {};
    
    // Convert activities to array if it's an object with data property
    let activitiesList = [];
    if (Array.isArray(activities)) {
        activitiesList = activities;
    } else if (activities.data && Array.isArray(activities.data)) {
        activitiesList = activities.data;
    }
    
    console.log('Activities List:', activitiesList);
    const [search, setSearch] = useState(filters.search || '');
    const [course, setCourse] = useState(filters.course || '');
    const [type, setType] = useState(filters.type || '');

    const handleSearch = () => {
        router.get(route('admin.activities.index'), {
            search,
            course,
            type,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getTypeBadge = (activityType) => {
        const badges = {
            lesson: 'bg-blue-100 text-blue-800',
            video: 'bg-purple-100 text-purple-800',
            quiz: 'bg-green-100 text-green-800',
            assignment: 'bg-orange-100 text-orange-800'
        };
        return badges[activityType] || 'bg-gray-100 text-gray-800';
    };

    const getTypeIcon = (activityType) => {
        const icons = {
            lesson: '📖',
            video: '🎥',
            quiz: '❓',
            assignment: '📝'
        };
        return icons[activityType] || '📋';
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        📋 Gerenciamento de Atividades
                    </h2>
                    <Link
                        href={route('admin.activities.create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        + Nova Atividade
                    </Link>
                </div>
            }
        >
            <Head title="Gerenciar Atividades" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="text-2xl">📋</div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Total</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats?.total || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="text-2xl">📖</div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Lições</p>
                                        <p className="text-2xl font-semibold text-blue-600">{stats?.lessons || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="text-2xl">❓</div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Quizzes</p>
                                        <p className="text-2xl font-semibold text-green-600">{stats?.quizzes || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="text-2xl">📝</div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Tarefas</p>
                                        <p className="text-2xl font-semibold text-orange-600">{stats?.assignments || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pesquisar</label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Título da atividade..."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Curso</label>
                                    <select
                                        value={course}
                                        onChange={(e) => setCourse(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Todos os cursos</option>
                                        {courses && courses.length > 0 ? courses.map(c => (
                                            <option key={c?.id} value={c?.id}>{c?.title}</option>
                                        )) : null}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Todos os tipos</option>
                                        <option value="lesson">Lição</option>
                                        <option value="video">Vídeo</option>
                                        <option value="quiz">Quiz</option>
                                        <option value="assignment">Tarefa</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={handleSearch}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                                    >
                                        🔍 Buscar
                                    </button>
                                </div>

                                <div className="flex items-end">
                                    <Link
                                        href={route('admin.activities.index')}
                                        className="w-full text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                                    >
                                        🔄 Limpar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activities Table */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Atividade
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Curso
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ordem
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pontos
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Obrigatória
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {activitiesList && activitiesList.length > 0 ? activitiesList.map((activity) => (
                                        <tr key={activity?.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{activity?.title}</div>
                                                <div className="text-sm text-gray-500">{activity?.description?.substring(0, 50) || ''}...</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{activity?.course?.title || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(activity?.type)}`}>
                                                    {getTypeIcon(activity?.type)} {activity?.type === 'lesson' ? 'Lição' :
                                                     activity?.type === 'video' ? 'Vídeo' :
                                                     activity?.type === 'quiz' ? 'Quiz' : 'Tarefa'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                #{activity?.order || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ⭐ {activity?.points_value || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {activity?.is_required ? '✅ Sim' : '❌ Não'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Link
                                                    href={route('admin.activities.show', activity?.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    👁️ Ver
                                                </Link>
                                                <Link
                                                    href={route('admin.activities.edit', activity?.id)}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                >
                                                    ✏️ Editar
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Tem certeza que deseja excluir esta atividade?')) {
                                                            router.delete(route('admin.activities.destroy', activity?.id));
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    🗑️ Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                Nenhuma atividade encontrada
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}