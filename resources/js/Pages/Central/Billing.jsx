import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Billing({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            isCentral={true}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Billing & Faturamento</h2>}
        >
            <Head title="Billing" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Gestão de Faturamento
                                </h3>
                                <p className="text-gray-600">
                                    Gerencie planos, faturamento e receitas do seu SaaS.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">$</span>
                                                </div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Receita Mensal
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        R$ 4.500,00
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">📈</span>
                                                </div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Crescimento MRR
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        +12%
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
                                                    <span className="text-white font-bold text-sm">⏳</span>
                                                </div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Trials Ativos
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        8
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50 overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">⚠</span>
                                                </div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Churn Rate
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        2.1%
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Planos de Preços
                                        </h3>
                                        <div className="mt-4 space-y-4">
                                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Básico</h4>
                                                    <p className="text-sm text-gray-500">Até 50 usuários, 10 cursos</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-bold text-gray-900">R$ 99</span>
                                                    <span className="text-gray-500">/mês</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Premium</h4>
                                                    <p className="text-sm text-gray-500">Até 200 usuários, 50 cursos</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-bold text-gray-900">R$ 299</span>
                                                    <span className="text-gray-500">/mês</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Enterprise</h4>
                                                    <p className="text-sm text-gray-500">Usuários ilimitados</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-bold text-gray-900">R$ 599</span>
                                                    <span className="text-gray-500">/mês</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Faturas Recentes
                                        </h3>
                                        <div className="mt-4 space-y-4">
                                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Escola ABC</p>
                                                    <p className="text-sm text-gray-500">Plano Premium</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-green-600">R$ 299,00</p>
                                                    <p className="text-sm text-gray-500">Pago</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Instituto XYZ</p>
                                                    <p className="text-sm text-gray-500">Plano Básico</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-green-600">R$ 99,00</p>
                                                    <p className="text-sm text-gray-500">Pago</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Escola DEF</p>
                                                    <p className="text-sm text-gray-500">Plano Enterprise</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-yellow-600">R$ 599,00</p>
                                                    <p className="text-sm text-gray-500">Pendente</p>
                                                </div>
                                            </div>
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