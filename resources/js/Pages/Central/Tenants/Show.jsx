import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function TenantShow({ auth, tenant, stats }) {
    const handleToggleStatus = () => {
        router.post(`/central/tenants/${tenant.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const handleImpersonate = () => {
        // Simple form submission - most reliable for redirects
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/central/tenants/${tenant.id}/impersonate`;

        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        document.body.appendChild(form);
        form.submit();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatStorage = (mb) => {
        return `${(mb / 1024).toFixed(2)} GB`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            isCentral={true}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Detalhes do Tenant</h2>}
        >
            <Head title={`Tenant: ${tenant.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Actions */}
                    <div className="mb-6 flex justify-between items-center">
                        <Link
                            href="/central/tenants"
                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            ← Voltar
                        </Link>
                        <div className="flex space-x-2">
                            <Link
                                href={`/central/tenants/${tenant.id}/edit`}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Editar
                            </Link>
                            <button
                                onClick={handleToggleStatus}
                                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 ${
                                    tenant.is_active
                                        ? 'bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:ring-red-500'
                                        : 'bg-green-600 hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:ring-green-500'
                                }`}
                            >
                                {tenant.is_active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                                onClick={handleImpersonate}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-purple-700 focus:bg-purple-700 active:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Acessar Tenant
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Informações Básicas */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <h3 className="text-lg font-medium mb-4">Informações Básicas</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                                        <p className="text-sm text-gray-900">{tenant.name}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Slug</label>
                                        <p className="text-sm text-gray-900">{tenant.slug}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                                        <p className="text-sm text-gray-900">{tenant.description || 'Sem descrição'}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Domínio</label>
                                        <p className="text-sm text-gray-900">
                                            {tenant.domains && tenant.domains[0] 
                                                ? tenant.domains[0].domain 
                                                : 'Sem domínio'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            tenant.is_active 
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {tenant.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Criado em</label>
                                        <p className="text-sm text-gray-900">{formatDate(tenant.created_at)}</p>
                                    </div>
                                    
                                    {tenant.trial_ends_at && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Trial até</label>
                                            <p className="text-sm text-gray-900">{formatDate(tenant.trial_ends_at)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Plano e Limites */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <h3 className="text-lg font-medium mb-4">Plano e Limites</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Plano</label>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            tenant.plan === 'enterprise' 
                                                ? 'bg-purple-100 text-purple-800'
                                                : tenant.plan === 'premium'
                                                ? 'bg-blue-100 text-blue-800'
                                                : tenant.plan === 'basic'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {tenant.plan.toUpperCase()}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Máximo de Usuários</label>
                                        <p className="text-sm text-gray-900">
                                            {tenant.max_users === 999999 ? 'Ilimitado' : tenant.max_users}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Máximo de Cursos</label>
                                        <p className="text-sm text-gray-900">
                                            {tenant.max_courses === 999999 ? 'Ilimitado' : tenant.max_courses}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Storage Máximo</label>
                                        <p className="text-sm text-gray-900">{formatStorage(tenant.max_storage_mb)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estatísticas de Uso */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg lg:col-span-2">
                            <div className="p-6 text-gray-900">
                                <h3 className="text-lg font-medium mb-4">Estatísticas de Uso</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-blue-900">{stats.users_count}</div>
                                        <div className="text-sm text-blue-700">Usuários</div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            {tenant.max_users === 999999 
                                                ? 'Ilimitado' 
                                                : `${stats.users_count}/${tenant.max_users}`}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-green-900">{stats.courses_count}</div>
                                        <div className="text-sm text-green-700">Cursos</div>
                                        <div className="text-xs text-green-600 mt-1">
                                            {tenant.max_courses === 999999 
                                                ? 'Ilimitado' 
                                                : `${stats.courses_count}/${tenant.max_courses}`}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-purple-900">{stats.activities_count}</div>
                                        <div className="text-sm text-purple-700">Atividades</div>
                                        <div className="text-xs text-purple-600 mt-1">Total criado</div>
                                    </div>
                                    
                                    <div className="bg-orange-50 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-orange-900">{formatStorage(stats.storage_used_mb || 0)}</div>
                                        <div className="text-sm text-orange-700">Storage</div>
                                        <div className="text-xs text-orange-600 mt-1">
                                            {((stats.storage_used_mb || 0) / tenant.max_storage_mb * 100).toFixed(1)}% usado
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}