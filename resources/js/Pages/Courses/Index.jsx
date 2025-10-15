import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, AcademicCapIcon, UserGroupIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CoursesIndex({ auth, courses, filters, canCreate }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('courses.index'), { search, status }, { preserveState: true });
    };

    const getStatusColor = (courseStatus) => {
        switch (courseStatus) {
            case 'published': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (courseStatus) => {
        switch (courseStatus) {
            case 'published': return 'Publicado';
            case 'draft': return 'Rascunho';
            case 'archived': return 'Arquivado';
            default: return courseStatus;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Meus Cursos
                    </h2>
                    {canCreate && (
                        <Link
                            href={route('courses.create')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Criar Curso
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Cursos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Search and Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Buscar cursos..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="sm:w-48">
                                    <select
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="">Todos os status</option>
                                        <option value="draft">Rascunho</option>
                                        <option value="published">Publicado</option>
                                        <option value="archived">Arquivado</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Buscar
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Courses Grid */}
                    {courses.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.data.map((course) => (
                                <div key={course.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition-shadow duration-200">
                                    <div className="p-6">
                                        {/* Course Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center">
                                                <AcademicCapIcon className="h-8 w-8 text-indigo-600 mr-3" />
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                        <Link
                                                            href={route('courses.show', course.id)}
                                                            className="hover:text-indigo-600 transition-colors"
                                                        >
                                                            {course.title}
                                                        </Link>
                                                    </h3>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}
                                                    >
                                                        {getStatusText(course.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Course Description */}
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {course.description}
                                        </p>

                                        {/* Course Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <UserGroupIcon className="h-4 w-4 mr-1" />
                                                {course.enrollments_count} alunos
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <ClockIcon className="h-4 w-4 mr-1" />
                                                {course.activities_count} atividades
                                            </div>
                                        </div>

                                        {/* Progress Bar (for completion rate) */}
                                        {course.enrollments_count > 0 && (
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-medium text-gray-700">Taxa de Conclusão</span>
                                                    <span className="text-xs text-gray-500">{course.completion_rate}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${course.completion_rate}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex justify-between items-center">
                                            <Link
                                                href={route('courses.show', course.id)}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Ver Detalhes
                                            </Link>

                                            {(auth.user.role === 'instructor' && course.instructor_id === auth.user.id) || auth.user.role === 'admin' ? (
                                                <Link
                                                    href={route('courses.edit', course.id)}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Editar
                                                </Link>
                                            ) : null}
                                        </div>

                                        {/* Instructor Info */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs text-gray-500">
                                                Instrutor: {course.instructor?.name || 'N/A'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Criado em: {new Date(course.created_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:p-6 text-center">
                                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum curso encontrado</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filters.search || filters.status
                                        ? 'Tente ajustar os filtros de busca.'
                                        : 'Comece criando seu primeiro curso.'}
                                </p>
                                {canCreate && !filters.search && !filters.status && (
                                    <div className="mt-6">
                                        <Link
                                            href={route('courses.create')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Criar Primeiro Curso
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {courses.data.length > 0 && (
                        <div className="mt-6">
                            <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
                                <div className="hidden sm:block">
                                    <p className="text-sm text-gray-700">
                                        Mostrando <span className="font-medium">{courses.from}</span> a{' '}
                                        <span className="font-medium">{courses.to}</span> de{' '}
                                        <span className="font-medium">{courses.total}</span> resultados
                                    </p>
                                </div>
                                <div className="flex-1 flex justify-between sm:justify-end">
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
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}