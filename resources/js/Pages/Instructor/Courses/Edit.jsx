import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Edit({ auth, course }) {
    const { data, setData, put, processing, errors } = useForm({
        title: course.title || '',
        description: course.description || '',
        status: course.status || 'draft',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('instructor.courses.update', course.id));
    };

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
            router.delete(route('instructor.courses.destroy', course.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    ✏️ Editar Curso: {course.title}
                </h2>
            }
        >
            <Head title={`Editar: ${course.title}`} />

            <div className="py-8">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Título do Curso *
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={data.title}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Digite o título do curso"
                                />
                                {errors.title && (
                                    <div className="text-red-600 text-sm mt-1">{errors.title}</div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={data.description}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Digite a descrição do curso"
                                />
                                {errors.description && (
                                    <div className="text-red-600 text-sm mt-1">{errors.description}</div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status do Curso
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="draft">📝 Rascunho (não visível para alunos)</option>
                                    <option value="published">✅ Publicado (visível para alunos)</option>
                                </select>
                                {errors.status && (
                                    <div className="text-red-600 text-sm mt-1">{errors.status}</div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
                                >
                                    🗑️ Excluir Curso
                                </button>
                                
                                <div className="flex space-x-2">
                                    <a
                                        href={route('instructor.courses.show', course.id)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition"
                                    >
                                        Cancelar
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
                                    >
                                        {processing ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Course Stats */}
                    <div className="mt-6 bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Estatísticas do Curso</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{course.enrollments_count || 0}</div>
                                    <div className="text-sm text-gray-500">Alunos Matriculados</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{course.activities_count || 0}</div>
                                    <div className="text-sm text-gray-500">Atividades</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {new Date(course.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="text-sm text-gray-500">Data de Criação</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}