import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function DashboardFixed({ auth, generalStats, engagementMetrics, topUsers, topCourses, chartData }) {
    const { tenant } = usePage().props;

    const StatCard = ({ title, value, subtitle, icon, gradient, change = null, trend = null }) => (
        <div className={`${gradient} overflow-hidden shadow-lg rounded-xl transform hover:scale-105 transition-all duration-300`}>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-white opacity-90">{title}</h3>
                        <p className="text-2xl font-bold text-white mt-1">{value}</p>
                        <p className="text-white opacity-75 text-xs mt-1">{subtitle}</p>
                        {change && (
                            <div className={`flex items-center mt-2 text-xs ${
                                trend === 'up' ? 'text-green-200' : trend === 'down' ? 'text-red-200' : 'text-white'
                            }`}>
                                {trend === 'up' && <span className="mr-1">↗</span>}
                                {trend === 'down' && <span className="mr-1">↘</span>}
                                <span>{change}</span>
                            </div>
                        )}
                    </div>
                    <div className="text-4xl opacity-80">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Administrativo</h2>
                    <p className="text-sm text-gray-600 mt-1">Visão geral da sua plataforma educacional</p>
                    {tenant && (
                        <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tenant.name || 'Tenant'}
                            </span>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Dashboard Admin" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Data atual */}
                    <div className="text-sm text-gray-600">
                        {new Date().toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>

                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden shadow-lg rounded-xl">
                        <div className="p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Olá, {auth.user.name}! 👋
                                    </h1>
                                    <p className="text-lg opacity-90">
                                        Aqui está um resumo da sua plataforma de ensino
                                    </p>
                                </div>
                                <div className="text-6xl opacity-80">
                                    📚
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total de Usuários"
                            value={generalStats?.totalUsers || 0}
                            subtitle="Usuários registrados"
                            icon="👥"
                            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                        />
                        <StatCard
                            title="Cursos Ativos"
                            value={generalStats?.totalCourses || 0}
                            subtitle="Cursos disponíveis"
                            icon="📖"
                            gradient="bg-gradient-to-br from-green-500 to-green-700"
                        />
                        <StatCard
                            title="Estudantes"
                            value={generalStats?.totalStudents || 0}
                            subtitle="Alunos matriculados"
                            icon="🎓"
                            gradient="bg-gradient-to-br from-purple-500 to-purple-700"
                        />
                        <StatCard
                            title="Professores"
                            value={generalStats?.totalInstructors || 0}
                            subtitle="Instrutores ativos"
                            icon="👨‍🏫"
                            gradient="bg-gradient-to-br from-orange-500 to-orange-700"
                        />
                    </div>

                    {/* Status do Sistema */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="text-2xl mr-2">✅</span>
                            Status do Sistema
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-green-600 font-semibold">Sistema Operacional</div>
                                <div className="text-sm text-green-500">Todos os serviços funcionando</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-blue-600 font-semibold">Database</div>
                                <div className="text-sm text-blue-500">Conectado e funcionando</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-purple-600 font-semibold">Multi-tenant</div>
                                <div className="text-sm text-purple-500">Sistema migrado com sucesso</div>
                            </div>
                        </div>
                    </div>

                    {/* Ações Rápidas */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="text-2xl mr-2">⚡</span>
                            Ações Rápidas
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link
                                href="/admin/users"
                                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-center transition-colors"
                            >
                                <div className="text-2xl mb-2">👥</div>
                                <div className="font-medium text-blue-900">Gerenciar Usuários</div>
                            </Link>

                            <Link
                                href="/admin/courses"
                                className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-center transition-colors"
                            >
                                <div className="text-2xl mb-2">📚</div>
                                <div className="font-medium text-green-900">Gerenciar Cursos</div>
                            </Link>

                            <Link
                                href="/admin/activities"
                                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-center transition-colors"
                            >
                                <div className="text-2xl mb-2">📝</div>
                                <div className="font-medium text-purple-900">Atividades</div>
                            </Link>

                            <Link
                                href="/admin/badges"
                                className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-center transition-colors"
                            >
                                <div className="text-2xl mb-2">🏅</div>
                                <div className="font-medium text-yellow-900">Badges</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}