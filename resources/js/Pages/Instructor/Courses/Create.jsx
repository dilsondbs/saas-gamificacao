import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        status: 'draft',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('instructor.courses.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    📚 Criar Novo Curso
                </h2>
            }
        >
            <Head title="Criar Curso" />

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
                                    <option value="draft">📝 Salvar como Rascunho</option>
                                    <option value="published">✅ Publicar Imediatamente</option>
                                </select>
                                {errors.status && (
                                    <div className="text-red-600 text-sm mt-1">{errors.status}</div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <a
                                    href={route('instructor.courses')}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition"
                                >
                                    Cancelar
                                </a>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
                                >
                                    {processing ? 'Criando...' : 'Criar Curso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}