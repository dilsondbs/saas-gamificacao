import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard(props) {
    // Debug: Log what props we receive
    console.log('Instructor Dashboard Props:', props);
    
    // Safe extraction with defaults
    const auth = props.auth || {};
    const user = auth.user || {};
    const stats = props.stats || {};
    const recentEnrollments = props.recentEnrollments || [];
    const courseMetrics = props.courseMetrics || {};
    
    console.log('Dashboard Data:', { stats, recentEnrollments, courseMetrics });

    // Helper functions for animations and styling
    const getProgressColor = (rate) => {
        if (rate >= 80) return 'from-green-400 to-green-600';
        if (rate >= 60) return 'from-blue-400 to-blue-600';
        if (rate >= 40) return 'from-yellow-400 to-yellow-600';
        return 'from-red-400 to-red-600';
    };

    const StatCard = ({ icon, title, value, color, gradient, subtitle }) => (
        <div className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <div className="relative p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center">
                            <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-r ${gradient} text-white shadow-lg`}>
                                <span className="text-2xl">{icon}</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{title}</p>
                                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const QuickActionCard = ({ href, icon, title, subtitle, gradient, hoverColor }) => (
        <Link
            href={href}
            className={`group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 ${hoverColor}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <div className="relative p-6">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-r ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-2xl">{icon}</span>
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">{title}</h3>
                        <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{subtitle}</p>
                    </div>
                    <div className="ml-2">
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            👨‍🏫 Painel do Instrutor
                        </h1>
                        <p className="text-gray-600 mt-1">Gerencie seus cursos e acompanhe o progresso dos alunos</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Bem-vindo de volta,</div>
                        <div className="text-lg font-semibold text-gray-800">{user?.name}</div>
                    </div>
                </div>
            }
        >
            <Head title="Painel do Instrutor" />

            <div className="py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Welcome Banner */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl shadow-xl">
                        <div className="absolute inset-0 bg-black opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-transparent opacity-50"></div>
                        <div className="relative px-8 py-12 text-white">
                            <div className="max-w-3xl">
                                <h2 className="text-3xl font-bold mb-4">Bem-vindo ao seu espaço educacional! 🚀</h2>
                                <p className="text-lg opacity-90 mb-6">
                                    Transforme vidas através da educação. Aqui você pode criar, gerenciar e acompanhar 
                                    o progresso dos seus cursos e alunos.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/instructor/courses/create"
                                        className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                    >
                                        <span className="mr-2">✨</span>
                                        Criar Novo Curso
                                    </Link>
                                    <Link
                                        href={route('instructor.courses.ai.create')}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                    >
                                        <span className="mr-2">🤖</span>
                                        Criar com IA
                                    </Link>
                                    <Link
                                        href={route('instructor.students')}
                                        className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transform hover:scale-105 transition-all duration-200"
                                    >
                                        <span className="mr-2">👥</span>
                                        Ver Alunos
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-0 top-0 transform translate-x-8 -translate-y-8">
                            <div className="w-64 h-64 bg-white opacity-10 rounded-full"></div>
                        </div>
                        <div className="absolute right-16 bottom-0 transform translate-x-4 translate-y-4">
                            <div className="w-32 h-32 bg-white opacity-5 rounded-full"></div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon="📚"
                            title="Total de Cursos"
                            value={stats?.total_courses || 0}
                            color="text-blue-600"
                            gradient="from-blue-500 to-blue-600"
                            subtitle="cursos criados"
                        />
                        <StatCard
                            icon="👥"
                            title="Alunos Matriculados"
                            value={stats?.total_students || 0}
                            color="text-green-600"
                            gradient="from-green-500 to-green-600"
                            subtitle="estudantes ativos"
                        />
                        <StatCard
                            icon="📋"
                            title="Atividades Criadas"
                            value={stats?.total_activities || 0}
                            color="text-purple-600"
                            gradient="from-purple-500 to-purple-600"
                            subtitle="conteúdos disponíveis"
                        />
                        <StatCard
                            icon="✅"
                            title="Total de Conclusões"
                            value={stats?.total_completions || 0}
                            color="text-orange-600"
                            gradient="from-orange-500 to-orange-600"
                            subtitle="atividades concluídas"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                                <span className="mr-3">⚡</span>
                                Ações Rápidas
                            </h3>
                            <p className="text-gray-600 mt-1">Acesse rapidamente as funcionalidades principais</p>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <QuickActionCard
                                    href={route('instructor.courses')}
                                    icon="📚"
                                    title="Gerenciar Cursos"
                                    subtitle="Visualizar, editar e organizar seus cursos"
                                    gradient="from-blue-500 to-blue-600"
                                    hoverColor="hover:border-blue-300"
                                />
                                <QuickActionCard
                                    href={route('instructor.students')}
                                    icon="👥"
                                    title="Acompanhar Alunos"
                                    subtitle="Ver progresso e desempenho dos estudantes"
                                    gradient="from-green-500 to-green-600"
                                    hoverColor="hover:border-green-300"
                                />
                                <QuickActionCard
                                    href={route('instructor.courses.create')}
                                    icon="✨"
                                    title="Criar Conteúdo"
                                    subtitle="Desenvolver novos cursos e atividades"
                                    gradient="from-purple-500 to-purple-600"
                                    hoverColor="hover:border-purple-300"
                                />
                                <QuickActionCard
                                    href={route('instructor.courses.ai.create')}
                                    icon="🤖"
                                    title="Professor Assistente IA"
                                    subtitle="Gere cursos automaticamente com inteligência artificial"
                                    gradient="from-emerald-500 to-emerald-600"
                                    hoverColor="hover:border-emerald-300"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Course Performance */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <span className="mr-3">📊</span>
                                    Performance dos Cursos
                                </h3>
                                <p className="text-gray-600 text-sm mt-1">Acompanhe o desempenho dos seus cursos</p>
                            </div>
                            <div className="p-6">
                                {courseMetrics && courseMetrics.length > 0 ? (
                                    <div className="space-y-6">
                                        {courseMetrics.map((course, index) => (
                                            <div key={course?.id} className="relative p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-300">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 mb-2">{course?.title}</h4>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                            <div className="flex items-center">
                                                                <span className="mr-1">👥</span>
                                                                {course?.students_count} alunos
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="mr-1">📋</span>
                                                                {course?.activities_count} atividades
                                                            </div>
                                                        </div>
                                                        <div className="mt-3">
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-gray-600">Taxa de Conclusão</span>
                                                                <span className="font-semibold">{course?.completion_rate || 0}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(course?.completion_rate || 0)} transition-all duration-1000`}
                                                                    style={{ width: `${course?.completion_rate || 0}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📊</div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Nenhum curso criado ainda</h4>
                                        <p className="text-gray-500 mb-6">Crie seu primeiro curso para visualizar métricas de performance</p>
                                        <Link
                                            href="/instructor/courses/create"
                                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
                                        >
                                            <span className="mr-2">✨</span>
                                            Criar Primeiro Curso
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Enrollments */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <span className="mr-3">🎯</span>
                                    Matrículas Recentes
                                </h3>
                                <p className="text-gray-600 text-sm mt-1">Novos alunos que se juntaram aos seus cursos</p>
                            </div>
                            <div className="p-6">
                                {recentEnrollments && recentEnrollments.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentEnrollments.slice(0, 8).map((enrollment, index) => (
                                            <div key={enrollment?.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                                                    <span className="text-lg font-semibold text-white">
                                                        {enrollment?.user?.name?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">
                                                        {enrollment?.user?.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {enrollment?.course?.title}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(enrollment?.created_at).toLocaleDateString('pt-BR')}
                                                    </div>
                                                    <div className="text-xs text-green-600 font-medium">
                                                        Novo aluno
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">👥</div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma matrícula recente</h4>
                                        <p className="text-gray-500 mb-6">Quando alunos se matricularem nos seus cursos, eles aparecerão aqui</p>
                                        <Link
                                            href={route('instructor.courses')}
                                            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transform hover:scale-105 transition-all duration-200"
                                        >
                                            <span className="mr-2">📚</span>
                                            Ver Meus Cursos
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}