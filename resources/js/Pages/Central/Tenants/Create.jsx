import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CreateTenant({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        plan: 'basic',
        max_users: 50,
        max_courses: 10,
        max_storage_mb: 1000,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/central/tenants');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            isCentral={true}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Criar Novo Tenant</h2>}
        >
            <Head title="Criar Tenant" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Nome do Tenant
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Ex: Escola ABC"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                                        Slug (usado no domínio)
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Ex: escola-abc"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Será usado como: {data.slug || 'slug'}.localhost
                                    </p>
                                    {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Descrição
                                    </label>
                                    <textarea
                                        name="description"
                                        id="description"
                                        rows="3"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Descrição do tenant..."
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                </div>

                                <div>
                                    <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                                        Plano
                                    </label>
                                    <select
                                        name="plan"
                                        id="plan"
                                        value={data.plan}
                                        onChange={(e) => setData('plan', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="basic">Básico</option>
                                        <option value="premium">Premium</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                    {errors.plan && <p className="mt-1 text-sm text-red-600">{errors.plan}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="max_users" className="block text-sm font-medium text-gray-700">
                                            Máximo de Usuários
                                        </label>
                                        <input
                                            type="number"
                                            name="max_users"
                                            id="max_users"
                                            value={data.max_users}
                                            onChange={(e) => setData('max_users', parseInt(e.target.value))}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            min="1"
                                        />
                                        {errors.max_users && <p className="mt-1 text-sm text-red-600">{errors.max_users}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="max_courses" className="block text-sm font-medium text-gray-700">
                                            Máximo de Cursos
                                        </label>
                                        <input
                                            type="number"
                                            name="max_courses"
                                            id="max_courses"
                                            value={data.max_courses}
                                            onChange={(e) => setData('max_courses', parseInt(e.target.value))}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            min="1"
                                        />
                                        {errors.max_courses && <p className="mt-1 text-sm text-red-600">{errors.max_courses}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="max_storage_mb" className="block text-sm font-medium text-gray-700">
                                            Storage Máximo (MB)
                                        </label>
                                        <input
                                            type="number"
                                            name="max_storage_mb"
                                            id="max_storage_mb"
                                            value={data.max_storage_mb}
                                            onChange={(e) => setData('max_storage_mb', parseInt(e.target.value))}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            min="1"
                                        />
                                        {errors.max_storage_mb && <p className="mt-1 text-sm text-red-600">{errors.max_storage_mb}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <Link
                                        href="/central/tenants"
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        {processing ? 'Criando...' : 'Criar Tenant'}
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