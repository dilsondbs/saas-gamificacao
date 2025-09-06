import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth, instructors = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        instructor_id: '',
        status: 'draft',
        points_per_completion: 100,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.courses.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        📚 Criar Novo Curso
                    </h2>
                    <Link
                        href={route('admin.courses.index')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        ← Voltar
                    </Link>
                </div>
            }
        >
            <Head title="Criar Curso" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Título do Curso <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Digite o título do curso..."
                                        required
                                    />
                                    {errors.title && <div className="text-red-600 text-sm mt-1">{errors.title}</div>}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descrição <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Descreva o curso..."
                                        required
                                    />
                                    {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
                                </div>

                                {/* Instructor */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instrutor <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.instructor_id}
                                        onChange={(e) => setData('instructor_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Selecione um instrutor...</option>
                                        {instructors.map((instructor) => (
                                            <option key={instructor.id} value={instructor.id}>
                                                {instructor.name} ({instructor.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.instructor_id && <div className="text-red-600 text-sm mt-1">{errors.instructor_id}</div>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="draft">📝 Rascunho</option>
                                            <option value="published">✅ Publicado</option>
                                            <option value="archived">📁 Arquivado</option>
                                        </select>
                                        {errors.status && <div className="text-red-600 text-sm mt-1">{errors.status}</div>}
                                    </div>

                                    {/* Points */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pontos por Conclusão
                                        </label>
                                        <input
                                            type="number"
                                            value={data.points_per_completion}
                                            onChange={(e) => setData('points_per_completion', parseInt(e.target.value) || 0)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            min="0"
                                            placeholder="100"
                                        />
                                        {errors.points_per_completion && <div className="text-red-600 text-sm mt-1">{errors.points_per_completion}</div>}
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                                    <Link
                                        href={route('admin.courses.index')}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded transition"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
                                    >
                                        {processing ? '⏳ Criando...' : '✅ Criar Curso'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}