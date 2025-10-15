import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function CreateTenant({ auth, plans = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        plan: 'teste',
        max_users: 1,
        max_courses: 1,
        max_storage_mb: 50,
    });

    // Converter array de planos em objeto para facilitar acesso
    const planLimits = plans.reduce((acc, plan) => {
        acc[plan.id] = plan;
        return acc;
    }, {});

    // Atualizar limites quando o plano mudar
    useEffect(() => {
        const plan = planLimits[data.plan];
        if (plan) {
            setData({
                ...data,
                max_users: plan.max_users,
                max_courses: plan.max_courses,
                max_storage_mb: plan.max_storage_mb,
            });
        }
    }, [data.plan]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/central/tenants');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            isCentral={true}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Criar Novo Cliente</h2>}
        >
            <Head title="Criar Cliente" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Nome do Cliente
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
                                        placeholder="Descrição do cliente..."
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
                                        {plans.map((plan) => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name} - {plan.id === 'teste' && plan.price == 0 ? 'Grátis' : `R$ ${plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês`}
                                                {plan.max_users === 999999 ? ' (ilimitados usuários)' : ` (até ${plan.max_users} usuários)`}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Plano selecionado: {planLimits[data.plan]?.name} - 
                                        {planLimits[data.plan]?.id === 'teste' && planLimits[data.plan]?.price == 0 
                                            ? 'Grátis' 
                                            : `R$ ${planLimits[data.plan]?.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês`}
                                    </p>
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
                                            value={data.max_users === 999999 ? 'Ilimitado' : data.max_users}
                                            onChange={(e) => setData('max_users', parseInt(e.target.value))}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            min="1"
                                            disabled={true}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Definido automaticamente pelo plano selecionado
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
                                            onChange={(e) => setData('max_courses', parseInt(e.target.value))}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            min="1"
                                            disabled={true}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Definido automaticamente pelo plano selecionado
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
                                            Definido automaticamente pelo plano selecionado
                                        </p>
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
                                        {processing ? 'Criando...' : 'Criar Cliente'}
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