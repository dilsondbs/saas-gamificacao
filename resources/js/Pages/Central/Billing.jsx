import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
    Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
    Filler
);

export default function Billing({ auth, kpis, planAnalysis, planDistribution, monthlyData, topClients, expiringContracts, catalogPrices, alerts, intelligentInsights, chartData, predictions, recentActivities, flash = {} }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [editingPlan, setEditingPlan] = useState(null);
    const [showGrowthDetails, setShowGrowthDetails] = useState(false);
    const [selectedClientDetails, setSelectedClientDetails] = useState(null);
    const [planPrices, setPlanPrices] = useState({
        teste: catalogPrices?.teste || '0.00',
        basic: catalogPrices?.basic || '19.90',
        premium: catalogPrices?.premium || '49.90',
        enterprise: catalogPrices?.enterprise || '199.00'
    });

    const handlePriceEdit = (plan, price) => {
        setPlanPrices(prev => ({ ...prev, [plan]: price }));
    };

    const savePlanPrice = (plan) => {
        router.post('/central/billing/update-plan-price', {
            plan: plan,
            price: parseFloat(planPrices[plan])
        });
    };

    const cancelEdit = (plan) => {
        const originalPrices = {
            teste: catalogPrices?.teste || '0.00',
            basic: catalogPrices?.basic || '19.90',
            premium: catalogPrices?.premium || '49.90',
            enterprise: catalogPrices?.enterprise || '199.00'
        };
        setPlanPrices(prev => ({ ...prev, [plan]: originalPrices[plan] }));
        setEditingPlan(null);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const handleAlertAction = (alert) => {
        if (alert.action === 'Ver detalhes' && alert.message.includes('Crescimento acelerado')) {
            setShowGrowthDetails(true);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            suspended: 'bg-yellow-100 text-yellow-800',
            pending: 'bg-blue-100 text-blue-800'
        };
        return colors[status] || colors.pending;
    };

    const getAlertColor = (type) => {
        const colors = {
            success: 'bg-green-50 border-green-200 text-green-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            danger: 'bg-red-50 border-red-200 text-red-800'
        };
        return colors[type] || colors.warning;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            isCentral={true}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-gray-900">💰 Centro de Faturamento Avançado</h2>
                    <div className="text-sm text-gray-500">
                        Última atualização: {new Date().toLocaleString('pt-BR')}
                    </div>
                </div>
            }
        >
            <Head title="Centro de Faturamento" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* === ALERTAS === */}
                    {(flash.success || alerts?.length > 0) && (
                        <div className="mb-6 space-y-2">
                            {flash.success && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-sm">
                                    <div className="flex items-center">
                                        <span className="text-green-500 mr-2">✅</span>
                                        {flash.success}
                                    </div>
                                </div>
                            )}
                            {alerts?.map((alert, index) => (
                                <div key={index} className={`border px-4 py-3 rounded-lg shadow-sm ${getAlertColor(alert.type)}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{alert.message}</span>
                                        <button 
                                            onClick={() => handleAlertAction(alert)}
                                            className="text-sm underline hover:no-underline hover:text-blue-600 transition-colors"
                                        >
                                            {alert.action}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* === KPIs PRINCIPAIS === */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">MRR (Receita Mensal)</p>
                                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(kpis?.mrr)}</p>
                                    <p className="text-sm text-blue-600">+{kpis?.growth_rate || 0}% este mês</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-xl">📈</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">ARR (Receita Anual)</p>
                                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(kpis?.arr)}</p>
                                    <p className="text-sm text-green-600">{kpis?.total_contracts || 0} contratos ativos</p>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 text-xl">💰</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">ARPU (Receita por Usuário)</p>
                                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(kpis?.avg_revenue_per_user)}</p>
                                    <p className="text-sm text-purple-600">Média mensal</p>
                                </div>
                                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 text-xl">👥</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                                    <p className="text-3xl font-bold text-gray-900">{kpis?.churn_rate || 0}%</p>
                                    <p className="text-sm text-orange-600">Taxa de cancelamento</p>
                                </div>
                                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-600 text-xl">⚠️</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === KPIs DE ATIVIDADES E IMPACTO FINANCEIRO === */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Exclusões (Este Mês)</p>
                                    <p className="text-3xl font-bold text-gray-900">{kpis?.deleted_this_month || 0}</p>
                                    <p className="text-sm text-red-600">Tenants excluídos</p>
                                </div>
                                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 text-xl">🗑️</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Receita Perdida</p>
                                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(kpis?.lost_revenue_this_month)}</p>
                                    <p className="text-sm text-red-600">Por exclusões</p>
                                </div>
                                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 text-xl">💸</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
                                    <p className="text-3xl font-bold text-gray-900">{kpis?.created_this_month || 0}</p>
                                    <p className="text-sm text-green-600">Este mês</p>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 text-xl">🎉</span>
                                </div>
                            </div>
                        </div>

                        <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${kpis?.net_revenue_impact >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Impacto Líquido</p>
                                    <p className={`text-3xl font-bold ${kpis?.net_revenue_impact >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                                        {formatCurrency(kpis?.net_revenue_impact)}
                                    </p>
                                    <p className={`text-sm ${kpis?.net_revenue_impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {kpis?.net_revenue_impact >= 0 ? 'Crescimento líquido' : 'Perda líquida'}
                                    </p>
                                </div>
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${kpis?.net_revenue_impact >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <span className={`text-xl ${kpis?.net_revenue_impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {kpis?.net_revenue_impact >= 0 ? '📈' : '📉'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === TABS NAVEGAÇÃO === */}
                    <div className="bg-white rounded-xl shadow-lg mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 px-6">
                                {[
                                    { id: 'overview', name: 'Visão Geral', icon: '📊' },
                                    { id: 'contracts', name: 'Contratos Ativos', icon: '📋' },
                                    { id: 'activities', name: 'Histórico de Atividades', icon: '📝' },
                                    { id: 'pricing', name: 'Preços de Catálogo', icon: '💎' },
                                    { id: 'analytics', name: 'Analytics', icon: '📈' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <span>{tab.icon}</span>
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* === CONTEÚDO DAS TABS === */}
                        <div className="p-6">
                            {/* TAB: VISÃO GERAL */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* DISTRIBUIÇÃO DE PLANOS */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <span>📊</span> Distribuição de Planos
                                            </h3>
                                            <div className="space-y-3">
                                                {planDistribution?.map((plan, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded-full ${
                                                                plan.name === 'Basic' ? 'bg-green-500' :
                                                                plan.name === 'Premium' ? 'bg-blue-500' :
                                                                plan.name === 'Enterprise' ? 'bg-purple-500' : 'bg-gray-400'
                                                            }`}></div>
                                                            <span className="font-medium">{plan.name}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold">{plan.count} contratos</p>
                                                            <p className="text-sm text-gray-600">{plan.percentage}%</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* TOP CLIENTES */}
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <span>🏆</span> Top 5 Clientes
                                            </h3>
                                            <div className="space-y-3">
                                                {topClients?.map((client, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4">
                                                        <div>
                                                            <p className="font-medium">{client.name}</p>
                                                            <p className="text-sm text-gray-600">Plano {client.plan}</p>
                                                            {client.is_expiring && (
                                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                                    Vence em breve
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-right flex items-center gap-3">
                                                            <div>
                                                                <p className="font-bold text-green-600">{formatCurrency(client.price)}</p>
                                                                <p className="text-xs text-gray-500">#{index + 1}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedClientDetails(client)}
                                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition-colors"
                                                            >
                                                                Detalhes
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* RECEITA POR MÊS */}
                                    <div className="bg-white rounded-xl p-6 border">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span>📈</span> Evolução da Receita (Últimos 6 Meses)
                                        </h3>
                                        <div className="grid grid-cols-6 gap-4">
                                            {monthlyData?.map((month, index) => (
                                                <div key={index} className="text-center">
                                                    <div className={`bg-blue-100 rounded-lg p-4 relative overflow-hidden`}>
                                                        <div 
                                                            className="bg-blue-500 absolute bottom-0 left-0 right-0 transition-all duration-700"
                                                            style={{
                                                                height: `${Math.max(10, (month.revenue / Math.max(...(monthlyData?.map(m => m.revenue) || [1]))) * 80)}%`
                                                            }}
                                                        ></div>
                                                        <div className="relative z-10">
                                                            <p className="text-xs font-medium text-gray-700">{month.month}</p>
                                                            <p className="text-lg font-bold text-blue-900">{formatCurrency(month.revenue)}</p>
                                                            <p className="text-xs text-gray-600">{month.contracts} contratos</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: CONTRATOS ATIVOS */}
                            {activeTab === 'contracts' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-gray-900">Contratos Próximos ao Vencimento</h3>
                                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                            {kpis?.expiring_contracts_count || 0} contratos
                                        </span>
                                    </div>

                                    <div className="bg-white rounded-xl border overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {expiringContracts?.map((contract, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <p className="text-sm font-medium text-gray-900">{contract.tenant_name}</p>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                {contract.plan}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                            {formatCurrency(contract.price)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {new Date(contract.expires_at).toLocaleDateString('pt-BR')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                contract.days_remaining < 7 ? 'bg-red-100 text-red-800' :
                                                                contract.days_remaining < 15 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                                {contract.days_remaining > 0 ? `${contract.days_remaining} dias` : 'Vencido'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {(!expiringContracts || expiringContracts.length === 0) && (
                                            <div className="text-center py-12">
                                                <span className="text-gray-400 text-6xl">🎉</span>
                                                <p className="mt-4 text-lg font-medium text-gray-600">Nenhum contrato vencendo em breve!</p>
                                                <p className="text-gray-500">Todos os contratos estão em dia.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB: HISTÓRICO DE ATIVIDADES */}
                            {activeTab === 'activities' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-gray-900">Histórico de Atividades</h3>
                                        <div className="text-sm text-gray-500">
                                            Últimas 20 atividades registradas
                                        </div>
                                    </div>

                                    {/* Resumo de Impacto Financeiro */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-red-600 font-medium">Total Perdido (Mês)</p>
                                                    <p className="text-2xl font-bold text-red-900">{formatCurrency(kpis?.lost_revenue_this_month)}</p>
                                                </div>
                                                <span className="text-red-500 text-2xl">💸</span>
                                            </div>
                                        </div>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-green-600 font-medium">Total Ganho (Mês)</p>
                                                    <p className="text-2xl font-bold text-green-900">{formatCurrency(kpis?.gained_revenue_this_month)}</p>
                                                </div>
                                                <span className="text-green-500 text-2xl">💰</span>
                                            </div>
                                        </div>
                                        <div className={`border rounded-lg p-4 ${kpis?.net_revenue_impact >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className={`text-sm font-medium ${kpis?.net_revenue_impact >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                                        Balanço Líquido
                                                    </p>
                                                    <p className={`text-2xl font-bold ${kpis?.net_revenue_impact >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                                                        {formatCurrency(kpis?.net_revenue_impact)}
                                                    </p>
                                                </div>
                                                <span className={`text-2xl ${kpis?.net_revenue_impact >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                                                    {kpis?.net_revenue_impact >= 0 ? '📈' : '📊'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline de Atividades */}
                                    <div className="bg-white rounded-xl border overflow-hidden">
                                        {recentActivities && recentActivities.length > 0 ? (
                                            <div className="divide-y divide-gray-200">
                                                {recentActivities.map((activity) => (
                                                    <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start space-x-4">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-${activity.activity_color}-500`}>
                                                                    {activity.activity_type === 'Excluído' ? '🗑️' :
                                                                     activity.activity_type === 'Criado' ? '🎉' :
                                                                     activity.activity_type === 'Upgrade' ? '⬆️' :
                                                                     activity.activity_type === 'Downgrade' ? '⬇️' : '📝'}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2">
                                                                        <h4 className="text-sm font-semibold text-gray-900">
                                                                            {activity.tenant_name}
                                                                        </h4>
                                                                        <span className={`px-2 py-1 text-xs rounded-full bg-${activity.activity_color}-100 text-${activity.activity_color}-800`}>
                                                                            {activity.activity_type}
                                                                        </span>
                                                                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                                                            {activity.plan_name}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {activity.description}
                                                                    </p>
                                                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                                        <span>
                                                                            📅 {new Date(activity.occurred_at).toLocaleString('pt-BR')}
                                                                        </span>
                                                                        {activity.performed_by && (
                                                                            <span>👤 {activity.performed_by}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className={`text-lg font-bold ${activity.impact_type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {activity.formatted_impact}
                                                                </div>
                                                                {activity.monthly_value > 0 && (
                                                                    <div className="text-sm text-gray-500">
                                                                        {formatCurrency(activity.monthly_value)}/mês
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Detalhes expandidos (metadata) */}
                                                        {activity.metadata && activity.activity_type === 'Excluído' && (
                                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                                <h5 className="text-sm font-medium text-gray-900 mb-2">Impacto Financeiro Detalhado:</h5>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                                    <div>
                                                                        <span className="text-gray-600">Perda Mensal:</span>
                                                                        <span className="font-medium text-red-600 ml-2">
                                                                            {formatCurrency(activity.metadata.lost_revenue_projection?.monthly || 0)}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-600">Perda Anual:</span>
                                                                        <span className="font-medium text-red-600 ml-2">
                                                                            {formatCurrency(activity.metadata.lost_revenue_projection?.annual || 0)}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-600">Tempo Ativo:</span>
                                                                        <span className="font-medium text-gray-900 ml-2">
                                                                            {activity.metadata.tenant_data?.days_active || 0} dias
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-gray-500">
                                                <span className="text-4xl mb-4 block">📝</span>
                                                <p className="text-lg font-medium mb-2">Nenhuma atividade registrada</p>
                                                <p className="text-sm">As atividades de tenants aparecerão aqui conforme forem realizadas.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB: PREÇOS DE CATÁLOGO */}
                            {activeTab === 'pricing' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-blue-500 text-xl">ℹ️</span>
                                            <div>
                                                <p className="font-medium text-blue-900">Preços de Catálogo</p>
                                                <p className="text-blue-700 text-sm">
                                                    Estes preços se aplicam apenas a <strong>novos contratos</strong>. 
                                                    Contratos existentes mantêm seus valores até a renovação.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { plan: 'teste', name: 'TESTE', color: 'gray', features: '1 usuário, 1 curso, 50 MB' },
                                            { plan: 'basic', name: 'Básico', color: 'green', features: 'Até 50 usuários, 10 cursos' },
                                            { plan: 'premium', name: 'Premium', color: 'blue', features: 'Até 200 usuários, 50 cursos, IA' },
                                            { plan: 'enterprise', name: 'Enterprise', color: 'purple', features: 'Usuários ilimitados, IA completa' }
                                        ].map((planInfo) => (
                                            <div key={planInfo.plan} className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${planInfo.color}-500`}>
                                                <div className="mb-4">
                                                    <h4 className="text-lg font-bold text-gray-900">{planInfo.name}</h4>
                                                    <p className="text-sm text-gray-600">{planInfo.features}</p>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    {editingPlan === planInfo.plan ? (
                                                        <div className="flex items-center gap-2 w-full">
                                                            {planInfo.plan !== 'teste' && <span className="text-sm font-medium">R$</span>}
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={planPrices[planInfo.plan]}
                                                                onChange={(e) => handlePriceEdit(planInfo.plan, e.target.value)}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="0.00"
                                                            />
                                                            <button
                                                                onClick={() => savePlanPrice(planInfo.plan)}
                                                                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                onClick={() => cancelEdit(planInfo.plan)}
                                                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                            >
                                                                ✗
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between w-full">
                                                            <div>
                                                                <span className="text-2xl font-bold text-gray-900">
                                                                    {planInfo.plan === 'teste' && planPrices[planInfo.plan] === '0.00' 
                                                                        ? 'Grátis' 
                                                                        : formatCurrency(planPrices[planInfo.plan])
                                                                    }
                                                                </span>
                                                                {planInfo.plan !== 'teste' && (
                                                                    <span className="text-gray-500 text-sm ml-1">/mês</span>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => setEditingPlan(planInfo.plan)}
                                                                className={`px-3 py-2 bg-${planInfo.color}-500 text-white rounded-lg hover:bg-${planInfo.color}-600 transition-colors text-sm`}
                                                            >
                                                                Editar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TAB: ANALYTICS */}
                            {activeTab === 'analytics' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <span>📊</span> Análise de Performance por Plano
                                            </h3>
                                            <div className="space-y-4">
                                                {planAnalysis?.map((plan, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-medium text-gray-900 capitalize">{plan.plan}</h4>
                                                            <span className="text-sm text-gray-500">{plan.count} contratos</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <p className="text-xs text-gray-600">Receita Mensal</p>
                                                                <p className="font-bold text-green-600">{formatCurrency(plan.revenue)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-600">Preço Médio</p>
                                                                <p className="font-bold text-blue-600">{formatCurrency(plan.avg_price)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-600">Potencial Anual</p>
                                                                <p className="font-bold text-purple-600">{formatCurrency(plan.total_yearly)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <span>🎯</span> Oportunidades
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="bg-white rounded-lg p-4">
                                                    <p className="text-sm text-gray-600">Renovações Próximas</p>
                                                    <p className="text-xl font-bold text-green-600">{formatCurrency(kpis?.renewal_opportunities)}</p>
                                                    <p className="text-xs text-gray-500">Potencial de receita anual</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-4">
                                                    <p className="text-sm text-gray-600">Crescimento Mensal</p>
                                                    <p className="text-xl font-bold text-blue-600">+{kpis?.growth_rate}%</p>
                                                    <p className="text-xs text-gray-500">Comparado ao mês anterior</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-4">
                                                    <p className="text-sm text-gray-600">Retenção</p>
                                                    <p className="text-xl font-bold text-purple-600">{(100 - (kpis?.churn_rate || 0)).toFixed(1)}%</p>
                                                    <p className="text-xs text-gray-500">Taxa de retenção</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* === DASHBOARD AVANÇADO DE BUSINESS INTELLIGENCE === */}
            {showGrowthDetails && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-4 mx-auto p-6 w-11/12 max-w-7xl">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold flex items-center gap-3">
                                            <span>🤖</span> Business Intelligence Dashboard
                                        </h2>
                                        <p className="text-blue-100 mt-2">Análise Automática Powered by AI • Insights em Tempo Real</p>
                                    </div>
                                    <button
                                        onClick={() => setShowGrowthDetails(false)}
                                        className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
                                    >
                                        <span className="text-2xl">×</span>
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="border-b border-gray-200">
                                <nav className="flex space-x-8 px-6">
                                    {[
                                        { id: 'insights', name: '🧠 Insights IA', icon: '🧠' },
                                        { id: 'charts', name: '📊 Analytics', icon: '📊' },
                                        { id: 'predictions', name: '🔮 Previsões', icon: '🔮' },
                                        { id: 'reports', name: '📋 Relatórios', icon: '📋' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            {tab.name}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Content */}
                            <div className="p-6 max-h-[70vh] overflow-y-auto">
                                {/* IA INSIGHTS TAB */}
                                {activeTab === 'insights' && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-8">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">🤖 Análise Inteligente Automatizada</h3>
                                            <p className="text-gray-600">Insights gerados por algoritmos avançados de machine learning</p>
                                        </div>

                                        {intelligentInsights?.map((insight, index) => (
                                            <div key={index} className={`rounded-xl border-l-4 p-6 shadow-lg ${
                                                insight.severity === 'high' ? 'bg-red-50 border-red-500' :
                                                insight.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                                                'bg-green-50 border-green-500'
                                            }`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="text-xl font-bold text-gray-900">{insight.title}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                                                        insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                        {insight.severity === 'high' ? 'CRÍTICO' : 
                                                         insight.severity === 'medium' ? 'IMPORTANTE' : 'OPORTUNIDADE'}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-gray-700 mb-4">{insight.description}</p>
                                                
                                                <div className="bg-white rounded-lg p-4 mb-4">
                                                    <h5 className="font-semibold text-gray-900 mb-2">🎯 Recomendações da IA:</h5>
                                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                                        {insight.recommendations?.map((rec, i) => (
                                                            <li key={i}>{rec}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">💡 <strong>Impacto Projetado:</strong> {insight.impact}</span>
                                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                                        Implementar Ações
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* CHARTS TAB */}
                                {activeTab === 'charts' && chartData && (
                                    <div className="space-y-8">
                                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">📊 Analytics Avançados</h3>

                                        {/* Gráfico de Tendência de Receita */}
                                        {chartData.revenue_trend && chartData.revenue_trend.labels && (
                                            <div className="bg-white rounded-xl shadow-lg p-6">
                                                <h4 className="text-lg font-bold mb-4">📈 Tendência de Receita & Novos Contratos</h4>
                                                <div style={{ height: '400px' }}>
                                                    <Line
                                                        data={chartData.revenue_trend}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: { position: 'top' },
                                                                title: { display: true, text: 'Evolução MRR vs Novos Contratos' }
                                                            },
                                                            scales: {
                                                                y: { beginAtZero: true, title: { display: true, text: 'Receita (R$)' } },
                                                                y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Contratos' } }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Distribuição por Planos */}
                                            {chartData.plan_distribution && chartData.plan_distribution.labels && (
                                                <div className="bg-white rounded-xl shadow-lg p-6">
                                                    <h4 className="text-lg font-bold mb-4">🍰 Distribuição de Receita por Plano</h4>
                                                    <div style={{ height: '300px' }}>
                                                        <Doughnut
                                                            data={chartData.plan_distribution}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: { position: 'bottom' }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            )}

                                            {/* Análise de Retenção */}
                                            {chartData.churn_analysis && chartData.churn_analysis.labels && (
                                                <div className="bg-white rounded-xl shadow-lg p-6">
                                                    <h4 className="text-lg font-bold mb-4">📉 Taxa de Retenção Histórica</h4>
                                                    <div style={{ height: '300px' }}>
                                                        <Bar
                                                            data={chartData.churn_analysis}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: {
                                                                    legend: { display: false }
                                                                },
                                                                scales: {
                                                                    y: { beginAtZero: true, max: 100, title: { display: true, text: 'Retenção (%)' } }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* PREDICTIONS TAB */}
                                {activeTab === 'predictions' && predictions && (
                                    <div className="space-y-8">
                                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">🔮 Previsões & Projeções</h3>
                                        
                                        {/* KPIs Futuros */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
                                                <h4 className="text-lg font-semibold mb-2">💰 ARR Projetado 12M</h4>
                                                <p className="text-3xl font-bold">{formatCurrency(predictions.key_metrics?.projected_arr_12m)}</p>
                                                <p className="text-green-100 text-sm mt-2">Baseado em tendência atual</p>
                                            </div>
                                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
                                                <h4 className="text-lg font-semibold mb-2">📊 Trajetória</h4>
                                                <p className="text-3xl font-bold">
                                                    {predictions.key_metrics?.growth_trajectory === 'ascending' ? '📈 Crescimento' : '📉 Declínio'}
                                                </p>
                                                <p className="text-blue-100 text-sm mt-2">Tendência identificada</p>
                                            </div>
                                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
                                                <h4 className="text-lg font-semibold mb-2">⚖️ Break-Even</h4>
                                                <p className="text-xl font-bold">{predictions.key_metrics?.break_even_month}</p>
                                                <p className="text-purple-100 text-sm mt-2">Ponto de equilíbrio</p>
                                            </div>
                                        </div>

                                        {/* Previsões Mensais */}
                                        <div className="bg-white rounded-xl shadow-lg p-6">
                                            <h4 className="text-lg font-bold mb-4">📅 Previsões Mensais (12 Meses)</h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRR Previsto</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confiança</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cenário</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {predictions.revenue_forecast?.slice(0, 6).map((forecast, index) => (
                                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{forecast.month}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(forecast.predicted_mrr)}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                        forecast.confidence >= 85 ? 'bg-green-100 text-green-800' :
                                                                        forecast.confidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {forecast.confidence}%
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {forecast.scenario === 'high_confidence' ? '🟢 Alta' : '🟡 Média'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Ações Recomendadas */}
                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                                            <h4 className="text-lg font-bold text-gray-900 mb-4">🚀 Ações Recomendadas pela IA</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {predictions.key_metrics?.recommended_actions?.map((action, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-4 border border-indigo-100">
                                                        <p className="text-sm text-gray-700 flex items-center gap-2">
                                                            <span className="text-blue-500">✓</span>
                                                            {action}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* REPORTS TAB */}
                                {activeTab === 'reports' && (
                                    <div className="space-y-8">
                                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">📋 Relatórios Executivos</h3>
                                        
                                        <div className="bg-white rounded-xl shadow-lg p-6">
                                            <h4 className="text-lg font-bold mb-4">📊 Sumário Executivo</h4>
                                            <div className="prose max-w-none">
                                                <p className="text-gray-700 leading-relaxed mb-4">
                                                    <strong>Período de Análise:</strong> Últimos 6 meses | <strong>Data do Relatório:</strong> {new Date().toLocaleDateString('pt-BR')}
                                                </p>
                                                
                                                <h5 className="text-lg font-semibold text-gray-900 mb-2">📈 Performance Financeira</h5>
                                                <ul className="list-disc list-inside space-y-1 text-gray-700 mb-6">
                                                    <li><strong>MRR Atual:</strong> {formatCurrency(kpis?.mrr)} (+{kpis?.growth_rate}% vs mês anterior)</li>
                                                    <li><strong>ARR:</strong> {formatCurrency(kpis?.arr)} com {kpis?.total_contracts} contratos ativos</li>
                                                    <li><strong>ARPU:</strong> {formatCurrency(kpis?.avg_revenue_per_user)} por cliente</li>
                                                    <li><strong>Taxa de Retenção:</strong> {(100 - (kpis?.churn_rate || 0)).toFixed(1)}%</li>
                                                </ul>

                                                <h5 className="text-lg font-semibold text-gray-900 mb-2">🎯 Principais Insights</h5>
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                                    <p className="text-yellow-800">
                                                        O crescimento acelerado de {kpis?.growth_rate}% indica alta demanda. 
                                                        Recomenda-se preparação para escala e otimização de preços.
                                                    </p>
                                                </div>

                                                <h5 className="text-lg font-semibold text-gray-900 mb-2">📅 Próximos Passos</h5>
                                                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                                    <li>Revisar e ajustar preços de catálogo baseado na demanda</li>
                                                    <li>Implementar programa de upselling para clientes básicos</li>
                                                    <li>Preparar infraestrutura para suportar crescimento projetado</li>
                                                    <li>Monitorar renovações e implementar programa de retenção</li>
                                                </ol>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium">
                                                📥 Exportar Relatório Completo (PDF)
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    🤖 Análises geradas automaticamente • Última atualização: {new Date().toLocaleString('pt-BR')}
                                </p>
                                <button
                                    onClick={() => setShowGrowthDetails(false)}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Fechar Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalhes do Cliente */}
            {selectedClientDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                👤 Detalhes do Cliente
                            </h2>
                            <button
                                onClick={() => setSelectedClientDetails(null)}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Informações básicas */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">📋 Informações Básicas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Nome do Cliente</label>
                                        <p className="text-lg font-semibold text-gray-900">{selectedClientDetails.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Plano Atual</label>
                                        <p className="text-lg font-semibold text-blue-600">{selectedClientDetails.plan}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Valor Mensal</label>
                                        <p className="text-lg font-semibold text-green-600">{formatCurrency(selectedClientDetails.price)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Status</label>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            selectedClientDetails.status === 'active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {selectedClientDetails.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Data de vencimento */}
                            <div className="bg-yellow-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">📅 Contrato</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Data de Vencimento</label>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {selectedClientDetails.contract_end 
                                                ? new Date(selectedClientDetails.contract_end).toLocaleDateString('pt-BR')
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Status do Vencimento</label>
                                        {selectedClientDetails.is_expiring ? (
                                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                                ⚠️ Vence em breve
                                            </span>
                                        ) : (
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                ✅ Em dia
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Métricas de valor */}
                            <div className="bg-blue-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">💰 Valor para o Negócio</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Valor Mensal</p>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedClientDetails.price)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Valor Anual</p>
                                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedClientDetails.price * 12)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Ranking</p>
                                        <p className="text-2xl font-bold text-purple-600">#{topClients?.findIndex(c => c.name === selectedClientDetails.name) + 1}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ações disponíveis */}
                            <div className="flex gap-4">
                                <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                    📧 Enviar Email
                                </button>
                                <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
                                    🔄 Renovar Contrato
                                </button>
                                <button className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                                    📊 Ver Relatório
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}