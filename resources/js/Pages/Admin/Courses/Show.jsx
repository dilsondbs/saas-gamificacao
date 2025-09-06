import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ auth, course }) {
    const handleDelete = () => {
        if (confirm(`Tem certeza que deseja excluir o curso "${course.title}"?`)) {
            router.delete(route('admin.courses.destroy', course.id));
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            published: 'bg-green-100 text-green-800',
            draft: 'bg-yellow-100 text-yellow-800',
            archived: 'bg-gray-100 text-gray-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const texts = {
            published: '✅ Publicado',
            draft: '📝 Rascunho',
            archived: '📁 Arquivado'
        };
        return texts[status] || status;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        📚 Detalhes do Curso
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route('admin.courses.index')}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            ← Voltar
                        </Link>
                        <Link
                            href={route('admin.courses.edit', course.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            ✏️ Editar
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Curso: ${course.title}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Main Course Info */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
                                    <p className="text-gray-600 mb-4">{course.description}</p>
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(course.status)}`}>
                                        {getStatusText(course.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
                                    <dl className="space-y-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Instrutor</dt>
                                            <dd className="text-sm text-gray-900">{course.instructor?.name || 'N/A'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email do Instrutor</dt>
                                            <dd className="text-sm text-gray-900">{course.instructor?.email || 'N/A'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Pontos por Conclusão</dt>
                                            <dd className="text-sm text-gray-900">⭐ {course.points_per_completion || 0} pontos</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Criado em</dt>
                                            <dd className="text-sm text-gray-900">
                                                {course.created_at ? new Date(course.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Atualizado em</dt>
                                            <dd className="text-sm text-gray-900">
                                                {course.updated_at ? new Date(course.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Estatísticas</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-blue-600">{course.enrollments_count || 0}</div>
                                            <div className="text-sm text-blue-800">👥 Matrículas</div>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-purple-600">{course.activities_count || 0}</div>
                                            <div className="text-sm text-purple-800">📋 Atividades</div>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-green-600">{course.completed_count || 0}</div>
                                            <div className="text-sm text-green-800">✅ Concluídos</div>
                                        </div>
                                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-yellow-600">{course.average_rating || '0.0'}</div>
                                            <div className="text-sm text-yellow-800">⭐ Avaliação</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activities Section */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Atividades do Curso</h3>
                                <Link
                                    href="#"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition text-sm"
                                >
                                    + Nova Atividade
                                </Link>
                            </div>
                            
                            {course.activities && course.activities.length > 0 ? (
                                <div className="space-y-3">
                                    {course.activities.map((activity, index) => (
                                        <div key={activity.id || index} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{activity.title || `Atividade ${index + 1}`}</h4>
                                                    <p className="text-sm text-gray-600">{activity.description || 'Sem descrição'}</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button className="text-indigo-600 hover:text-indigo-900 text-sm">👁️ Ver</button>
                                                    <button className="text-yellow-600 hover:text-yellow-900 text-sm">✏️ Editar</button>
                                                    <button className="text-red-600 hover:text-red-900 text-sm">🗑️ Excluir</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Nenhuma atividade encontrada para este curso.</p>
                                    <Link
                                        href="#"
                                        className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-900 text-sm"
                                    >
                                        + Criar primeira atividade
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enrolled Students */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Estudantes Matriculados</h3>
                            
                            {course.enrollments && course.enrollments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progresso</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matrícula</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {course.enrollments.map((enrollment, index) => (
                                                <tr key={enrollment.id || index}>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                        {enrollment.user?.name || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500">
                                                        {enrollment.user?.email || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500">
                                                        {enrollment.progress || 0}% concluído
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500">
                                                        {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString('pt-BR') : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Nenhum estudante matriculado neste curso ainda.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}