import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function CentralDashboard({ auth, stats }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            isCentral={true}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Painel Central - Gestão de Clientes</h2>}
        >
            <Head title="Painel Central" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Bem-vindo à Administração Central
                                </h3>
                                <p className="text-gray-600">
                                    Aqui você pode gerenciar todos os clientes (empresas) do seu SaaS de gamificação.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">T</span>
                                                </div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Total de Clientes
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {stats?.total_tenants || 0}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">✓</span>
                                                </div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Clientes Ativos
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {stats?.active_tenants || 0}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">$</span>
                                                </div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Receita Mensal
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        R$ {(stats?.monthly_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <a
                                    href="/central/tenants"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Gerenciar Clientes
                                </a>
                                <a
                                    href="/central/tenants/create"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Criar Novo Cliente
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}