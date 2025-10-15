import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AiUsageIndex({
    auth,
    logs,
    stats,
    statsByAction,
    statsByTenant,
    dailyUsage,
    tenants,
    actions,
    filters
}) {
    const [selectedTenant, setSelectedTenant] = useState(filters.tenant_id || '');
    const [selectedAction, setSelectedAction] = useState(filters.action || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const applyFilters = () => {
        router.get(route('central.ai-usage'), {
            tenant_id: selectedTenant,
            action: selectedAction,
            start_date: startDate,
            end_date: endDate,
        }, {
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setSelectedTenant('');
        setSelectedAction('');
        setStartDate('');
        setEndDate('');
        router.get(route('central.ai-usage'));
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'USD',
        }).format(value || 0);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('pt-BR').format(value || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const getActionLabel = (action) => {
        const labels = {
            'generate_course': 'Gerar Curso',
            'generate_activities': 'Gerar Atividades',
            'generate_badges': 'Gerar Badges',
            'generate_canvas': 'Gerar Canvas',
        };
        return labels[action] || action;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            isCentral={true}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Uso da API Gemini</h2>}
        >
            <Head title="Uso da API Gemini" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="text-sm font-medium text-gray-500 truncate">
                                    Total de Chamadas
                                </div>
                                <div className="mt-1 text-2xl font-semibold text-gray-900">
                                    {formatNumber(stats.total_calls)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="text-sm font-medium text-gray-500 truncate">
                                    Custo Total
                                </div>
                                <div className="mt-1 text-2xl font-semibold text-gray-900">
                                    {formatCurrency(stats.total_cost)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="text-sm font-medium text-gray-500 truncate">
                                    Total de Tokens
                                </div>
                                <div className="mt-1 text-2xl font-semibold text-gray-900">
                                    {formatNumber(stats.total_tokens)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="text-sm font-medium text-gray-500 truncate">
                                    Tokens de Entrada
                                </div>
                                <div className="mt-1 text-2xl font-semibold text-gray-900">
                                    {formatNumber(stats.total_input_tokens)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="text-sm font-medium text-gray-500 truncate">
                                    Tokens de Saída
                                </div>
                                <div className="mt-1 text-2xl font-semibold text-gray-900">
                                    {formatNumber(stats.total_output_tokens)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                                    <select
                                        value={selectedTenant}
                                        onChange={(e) => setSelectedTenant(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Todos</option>
                                        {tenants.map(tenant => (
                                            <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ação</label>
                                    <select
                                        value={selectedAction}
                                        onChange={(e) => setSelectedAction(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Todas</option>
                                        {actions.map(action => (
                                            <option key={action} value={action}>{getActionLabel(action)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Data Inicial</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Data Final</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={applyFilters}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Aplicar Filtros
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                                >
                                    Limpar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats by Action */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Uso por Tipo de Ação</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chamadas</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens Entrada</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens Saída</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {statsByAction.map((stat, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {getActionLabel(stat.action)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatNumber(stat.calls)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatNumber(stat.input_tokens)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatNumber(stat.output_tokens)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatCurrency(stat.total_cost)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Stats by Tenant */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Top 10 Clientes por Uso</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chamadas</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total de Tokens</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {statsByTenant.map((stat, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {stat.tenant?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatNumber(stat.calls)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatNumber(stat.total_tokens)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatCurrency(stat.total_cost)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico de Chamadas</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens In</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens Out</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {logs.data.map((log) => (
                                            <tr key={log.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(log.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.tenant?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {log.user?.name || 'Sistema'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {getActionLabel(log.action)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatNumber(log.input_tokens)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatNumber(log.output_tokens)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatCurrency(log.cost_usd)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {logs.links && logs.links.length > 3 && (
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        Mostrando {logs.from} a {logs.to} de {logs.total} registros
                                    </div>
                                    <div className="flex gap-2">
                                        {logs.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-gray-200 hover:bg-gray-300'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
