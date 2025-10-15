import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function TenantEdit({ auth, tenant }) {
    const { data, setData, put, processing, errors } = useForm({
        name: tenant.name || '',
        slug: tenant.slug || '',
        description: tenant.description || '',
        plan: tenant.plan || 'basic',
        max_users: tenant.max_users || 1,
        max_courses: tenant.max_courses || 1,
        max_storage_mb: tenant.max_storage_mb || 50,
        is_active: tenant.is_active || false,
    });

    // Definir limites por plano
    const planLimits = {
        teste: { max_users: 1, max_courses: 1, max_storage_mb: 50 },
        basic: { max_users: 50, max_courses: 10, max_storage_mb: 1024 },
        premium: { max_users: 200, max_courses: 50, max_storage_mb: 10240 },
        enterprise: { max_users: 999999, max_courses: 999999, max_storage_mb: 102400 },
    };

    // Atualizar limites quando o plano mudar
    const handlePlanChange = (newPlan) => {
        setData({
            ...data,
            plan: newPlan,
            max_users: planLimits[newPlan]?.max_users || data.max_users,
            max_courses: planLimits[newPlan]?.max_courses || data.max_courses,
            max_storage_mb: planLimits[newPlan]?.max_storage_mb || data.max_storage_mb,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/central/tenants/${tenant.id}`);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            isCentral={true}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Editar Tenant</h2>}
        >
            <Head title={`Editar: ${tenant.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Nome */}
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

                                    {/* Slug */}
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

                                    {/* Descrição */}
                                    <div className="md:col-span-2">
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

                                    {/* Plano */}
                                    <div>
                                        <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                                            Plano
                                        </label>
                                        <select
                                            name="plan"
                                            id="plan"
                                            value={data.plan}
                                            onChange={(e) => handlePlanChange(e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="teste">TESTE (Grátis)</option>
                                            <option value="basic">BÁSICO</option>
                                            <option value="premium">PREMIUM</option>
                                            <option value="enterprise">ENTERPRISE</option>
                                        </select>
                                        {errors.plan && <p className="mt-1 text-sm text-red-600">{errors.plan}</p>}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <div className="mt-2">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_active}
                                                    onChange={(e) => setData('is_active', e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Tenant ativo</span>
                                            </label>
                                        </div>
                                        {errors.is_active && <p className="mt-1 text-sm text-red-600">{errors.is_active}</p>}
                                    </div>
                                </div>

                                {/* Limites */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Limites do Plano</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="max_users" className="block text-sm font-medium text-gray-700">
                                                Máximo de Usuários
                                            </label>
                                            <input
                                                type="number"
                                                name="max_users"
                                                id="max_users"
                                                value={data.max_users === 999999 ? 'Ilimitado' : data.max_users}
                                                onChange={(e) => setData('max_users', parseInt(e.target.value) || 1)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                min="1"
                                                disabled={data.plan !== 'custom'}
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                {data.plan !== 'custom' ? 'Definido pelo plano selecionado' : 'Personalizado'}
                                            </p>
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
                                                value={data.max_courses === 999999 ? 'Ilimitado' : data.max_courses}
                                                onChange={(e) => setData('max_courses', parseInt(e.target.value) || 1)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                min="1"
                                                disabled={data.plan !== 'custom'}
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                {data.plan !== 'custom' ? 'Definido pelo plano selecionado' : 'Personalizado'}
                                            </p>
                                            {errors.max_courses && <p className="mt-1 text-sm text-red-600">{errors.max_courses}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="max_storage_mb" className="block text-sm font-medium text-gray-700">
                                                Armazenamento Máximo (GB)
                                            </label>
                                            <input
                                                type="text"
                                                name="max_storage_mb"
                                                id="max_storage_mb"
                                                value={`${(data.max_storage_mb / 1000).toFixed(1)} GB`}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                                                disabled={true}
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Definido pelo plano selecionado
                                            </p>
                                            {errors.max_storage_mb && <p className="mt-1 text-sm text-red-600">{errors.max_storage_mb}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t">
                                    <Link
                                        href={`/central/tenants/${tenant.id}`}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
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