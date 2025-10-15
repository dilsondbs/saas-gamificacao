import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function CourseEdit({ auth, course }) {
    const { data, setData, put, processing, errors } = useForm({
        title: course.title || '',
        description: course.description || '',
        image: null,
        status: course.status || 'draft',
        points_per_completion: course.points_per_completion || 100,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('courses.update', course.id));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center">
                    <Link
                        href={route('courses.show', course.id)}
                        className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Voltar
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Editar Curso: {course.title}
                    </h2>
                </div>
            }
        >
            <Head title={`Editar ${course.title}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">
                                Informações do Curso
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                        Título do Curso *
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            id="title"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Digite o título do seu curso"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.title && <div className="mt-2 text-sm text-red-600">{errors.title}</div>}
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Descrição *
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="description"
                                            rows={4}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Descreva o que os alunos irão aprender neste curso"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.description && <div className="mt-2 text-sm text-red-600">{errors.description}</div>}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                            Status *
                                        </label>
                                        <div className="mt-1">
                                            <select
                                                id="status"
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                required
                                            >
                                                <option value="draft">Rascunho</option>
                                                <option value="published">Publicado</option>
                                                <option value="archived">Arquivado</option>
                                            </select>
                                        </div>
                                        {errors.status && <div className="mt-2 text-sm text-red-600">{errors.status}</div>}
                                    </div>

                                    <div>
                                        <label htmlFor="points_per_completion" className="block text-sm font-medium text-gray-700">
                                            Pontos por Conclusão *
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="number"
                                                id="points_per_completion"
                                                min="1"
                                                max="1000"
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                value={data.points_per_completion}
                                                onChange={(e) => setData('points_per_completion', parseInt(e.target.value))}
                                                required
                                            />
                                        </div>
                                        {errors.points_per_completion && <div className="mt-2 text-sm text-red-600">{errors.points_per_completion}</div>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Imagem do Curso
                                    </label>

                                    {/* Current Image */}
                                    {course.image && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600 mb-2">Imagem atual:</p>
                                            <img
                                                src={`/storage/${course.image}`}
                                                alt={course.title}
                                                className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                                            />
                                        </div>
                                    )}

                                    {/* Upload New Image */}
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="image"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                >
                                                    <span>{course.image ? 'Alterar imagem' : 'Escolher arquivo'}</span>
                                                    <input
                                                        id="image"
                                                        name="image"
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={handleImageChange}
                                                    />
                                                </label>
                                                <p className="pl-1">ou arraste e solte</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF até 2MB</p>
                                        </div>
                                    </div>
                                    {data.image && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            Novo arquivo selecionado: {data.image.name}
                                        </div>
                                    )}
                                    {errors.image && <div className="mt-2 text-sm text-red-600">{errors.image}</div>}
                                </div>

                                {/* Course Activities Summary */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Resumo do Curso</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Atividades:</span>
                                            <span className="ml-2 font-medium text-gray-900">
                                                {course.activities?.length || 0}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Materiais:</span>
                                            <span className="ml-2 font-medium text-gray-900">
                                                {course.materials?.length || 0}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Criado em:</span>
                                            <span className="ml-2 font-medium text-gray-900">
                                                {new Date(course.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href={route('courses.show', course.id)}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {processing ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Additional Actions */}
                    <div className="mt-6 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Adicionais</h3>
                            <div className="space-y-4">
                                {/* Manage Activities */}
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Gerenciar Atividades</h4>
                                        <p className="text-sm text-gray-500">
                                            Adicione, edite ou remova atividades do curso
                                        </p>
                                    </div>
                                    <Link
                                        href={route('instructor.activities.index')}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Gerenciar
                                    </Link>
                                </div>

                                {/* Upload Material */}
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Enviar Material</h4>
                                        <p className="text-sm text-gray-500">
                                            Envie PDFs ou documentos para gerar atividades automaticamente
                                        </p>
                                    </div>
                                    <button
                                        disabled
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
                                    >
                                        Em breve
                                    </button>
                                </div>

                                {/* Course Analytics */}
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Relatórios e Analytics</h4>
                                        <p className="text-sm text-gray-500">
                                            Veja estatísticas detalhadas sobre o desempenho do curso
                                        </p>
                                    </div>
                                    <button
                                        disabled
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
                                    >
                                        Em breve
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}