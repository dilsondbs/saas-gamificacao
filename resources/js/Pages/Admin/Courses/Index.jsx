import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, courses = [], stats = {}, instructors = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = () => {
        router.get(route('admin.courses.index'), {
            search,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (courseStatus) => {
        const badges = {
            published: 'bg-green-100 text-green-800',
            draft: 'bg-yellow-100 text-yellow-800',
            archived: 'bg-gray-100 text-gray-800'
        };
        return badges[courseStatus] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        📚 Gerenciamento de Cursos
                    </h2>
                    <Link
                        href={route('admin.courses.create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        + Novo Curso
                    </Link>
                </div>
            }
        >
            <Head title="Gerenciar Cursos" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="text-2xl">📚</div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Total</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.total || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="text-2xl">✅</div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Publicados</p>
                                        <p className="text-2xl font-semibold text-green-600">{stats.published || 0}</p>
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
                                        <p className="text-sm font-medium text-gray-500">Rascunhos</p>
                                        <p className="text-2xl font-semibold text-yellow-600">{stats.draft || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="text-2xl">👥</div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Matrículas</p>
                                        <p className="text-2xl font-semibold text-blue-600">{stats.enrollments || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pesquisar</label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Título do curso..."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Todos</option>
                                        <option value="published">Publicado</option>
                                        <option value="draft">Rascunho</option>
                                        <option value="archived">Arquivado</option>
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
                                        href={route('admin.courses.index')}
                                        className="w-full text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                                    >
                                        🔄 Limpar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Courses Table */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Título
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Instrutor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estatísticas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Criado em
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {courses && courses.data && courses.data.length > 0 ? courses.data.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                                <div className="text-sm text-gray-500">{course.description?.substring(0, 50)}...</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{course.instructor?.name || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(course.status)}`}>
                                                    {course.status === 'published' ? '✅ Publicado' :
                                                     course.status === 'draft' ? '📝 Rascunho' : '📁 Arquivado'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="space-y-1">
                                                    <div>👥 {course.enrollments_count || 0} matrículas</div>
                                                    <div>📋 {course.activities_count || 0} atividades</div>
                                                    <div>⭐ {course.points_per_completion || 0} pontos</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {course.created_at ? new Date(course.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Link
                                                    href={route('admin.courses.show', course.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    👁️ Ver
                                                </Link>
                                                <Link
                                                    href={route('admin.courses.edit', course.id)}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                >
                                                    ✏️ Editar
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Tem certeza que deseja excluir este curso?')) {
                                                            router.delete(route('admin.courses.destroy', course.id));
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
                                            <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                Nenhum curso encontrado
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {courses && courses.links && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {courses.prev_page_url && (
                                        <Link
                                            href={courses.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Anterior
                                        </Link>
                                    )}
                                    {courses.next_page_url && (
                                        <Link
                                            href={courses.next_page_url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Próximo
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Mostrando{' '}
                                            <span className="font-medium">{courses.from || 0}</span>
                                            {' '}até{' '}
                                            <span className="font-medium">{courses.to || 0}</span>
                                            {' '}de{' '}
                                            <span className="font-medium">{courses.total || 0}</span>
                                            {' '}resultados
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {courses.prev_page_url && (
                                                <Link
                                                    href={courses.prev_page_url}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                                >
                                                    Anterior
                                                </Link>
                                            )}
                                            {courses.next_page_url && (
                                                <Link
                                                    href={courses.next_page_url}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                                >
                                                    Próximo
                                                </Link>
                                            )}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}