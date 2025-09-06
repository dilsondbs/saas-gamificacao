import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Edit({ auth, material, courses }) {
    const { data, setData, put, processing, errors } = useForm({
        title: material.title || '',
        is_active: material.is_active ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('instructor.materials.update', material.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        ✏️ Editar Material
                    </h2>
                    <Link
                        href={route('instructor.materials.show', material.id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        ← Voltar
                    </Link>
                </div>
            }
        >
            <Head title={`Editar - ${material.title}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            {/* Material Info */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">
                                            {material.file_type === 'pdf' ? '📄' : 
                                             material.file_type === 'document' ? '📝' :
                                             material.file_type === 'presentation' ? '🎬' :
                                             material.file_type === 'image' ? '🖼️' :
                                             '📁'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{material.original_name}</h3>
                                        <p className="text-sm text-gray-500">Curso: {material.course?.title}</p>
                                        <p className="text-sm text-gray-500">
                                            {Math.round(material.file_size / 1024)} KB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                        Título do Material
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Digite o título do material"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Material ativo</span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="flex items-center justify-end space-x-4">
                                    <Link
                                        href={route('instructor.materials.show', material.id)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded transition"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
                                    >
                                        {processing ? 'Salvando...' : 'Salvar Alterações'}
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