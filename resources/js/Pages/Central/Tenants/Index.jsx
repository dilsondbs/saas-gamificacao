import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function TenantsIndex({ auth, tenants }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            isCentral={true}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gerenciar Tenants</h2>}
        >
            <Head title="Tenants" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Lista de Tenants
                                </h3>
                                <Link
                                    href="/central/tenants/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Criar Novo Tenant
                                </Link>
                            </div>

                            {tenants.data && tenants.data.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tenant
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Plano
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Domínio
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Ações
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {tenants.data.map((tenant) => (
                                                <tr key={tenant.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {tenant.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {tenant.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            tenant.plan === 'enterprise' 
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : tenant.plan === 'premium'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {tenant.plan}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            tenant.is_active 
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {tenant.is_active ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {tenant.domains && tenant.domains[0] 
                                                            ? tenant.domains[0].domain 
                                                            : 'Sem domínio'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <Link
                                                            href={`/central/tenants/${tenant.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                        >
                                                            Ver
                                                        </Link>
                                                        <Link
                                                            href={`/central/tenants/${tenant.id}/edit`}
                                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                                        >
                                                            Editar
                                                        </Link>
                                                        <button className="text-red-600 hover:text-red-900">
                                                            Excluir
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Nenhum tenant encontrado.</p>
                                    <Link
                                        href="/central/tenants/create"
                                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Criar Primeiro Tenant
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}