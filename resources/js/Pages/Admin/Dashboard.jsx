import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, generalStats, engagementMetrics, topUsers, topCourses, chartData }) {
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

    const SimpleChart = ({ data, type = 'line', className = '' }) => {
        if (!data || data.length === 0) return <div className="text-gray-400 text-center py-4">Sem dados</div>;
        
        const maxValue = Math.max(...data.map(d => Object.values(d).filter(v => typeof v === 'number')).flat());
        
        return (
            <div className={`flex items-end space-x-1 h-20 ${className}`}>
                {data.slice(-15).map((item, index) => {
                    const value = Object.values(item).find(v => typeof v === 'number') || 0;
                    const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    
                    return (
                        <div key={index} className="flex-1 flex flex-col justify-end">
                            <div 
                                className="bg-blue-500 rounded-sm opacity-80 hover:opacity-100 transition-opacity"
                                style={{ height: `${height}%`, minHeight: height > 0 ? '2px' : '0px' }}
                                title={`${item.date || index}: ${value}`}
                            ></div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const ProgressBar = ({ value, max, color = 'blue' }) => {
        const percentage = max > 0 ? (value / max) * 100 : 0;
        
        return (
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        🎛️ Dashboard Administrativo
                    </h2>
                    <div className="text-sm text-gray-600">
                        {new Date().toLocaleDateString('pt-BR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden shadow-lg rounded-xl">
                        <div className="p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Dashboard Administrativo 📊
                                    </h1>
                                    <p className="text-indigo-100 text-lg">
                                        Visão geral completa da plataforma de gamificação
                                    </p>
                                </div>
                                <div className="hidden md:block text-6xl opacity-20">
                                    🎯
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* General Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link href={route('admin.users.index')}>
                            <StatCard
                                title="Total de Usuários"
                                value={generalStats?.totalUsers || 0}
                                subtitle={`${generalStats?.totalStudents || 0} estudantes, ${generalStats?.totalInstructors || 0} instrutores`}
                                icon="👥"
                                gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                            />
                        </Link>
                        <Link href={route('admin.courses.index')}>
                            <StatCard
                                title="Cursos"
                                value={generalStats?.totalCourses || 0}
                                subtitle={`${generalStats?.publishedCourses || 0} publicados`}
                                icon="📚"
                                gradient="bg-gradient-to-br from-green-500 to-green-700"
                            />
                        </Link>
                        <Link href={route('admin.activities.index')}>
                            <StatCard
                                title="Atividades"
                                value={generalStats?.totalActivities || 0}
                                subtitle="Total de atividades"
                                icon="✏️"
                                gradient="bg-gradient-to-br from-purple-500 to-purple-700"
                            />
                        </Link>
                        <Link href={route('admin.badges.index')}>
                            <StatCard
                                title="Badges"
                                value={generalStats?.totalBadges || 0}
                                subtitle="Total de badges"
                                icon="🏅"
                                gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
                            />
                        </Link>
                    </div>

                    {/* Engagement Metrics */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="text-2xl mr-2">📈</span>
                            Métricas de Engajamento
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">HOJE</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">{engagementMetrics?.activeUsersToday || 0}</div>
                                        <div className="text-xs text-gray-500">Usuários ativos</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{engagementMetrics?.enrollmentsToday || 0}</div>
                                        <div className="text-xs text-gray-500">Novas matrículas</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-purple-600">{engagementMetrics?.activitiesCompletedToday || 0}</div>
                                        <div className="text-xs text-gray-500">Atividades concluídas</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">ESTA SEMANA</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">{engagementMetrics?.activeUsersThisWeek || 0}</div>
                                        <div className="text-xs text-gray-500">Usuários ativos</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{engagementMetrics?.enrollmentsThisWeek || 0}</div>
                                        <div className="text-xs text-gray-500">Novas matrículas</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-purple-600">{engagementMetrics?.activitiesCompletedThisWeek || 0}</div>
                                        <div className="text-xs text-gray-500">Atividades concluídas</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">ESTE MÊS</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">{engagementMetrics?.enrollmentsThisMonth || 0}</div>
                                        <div className="text-xs text-gray-500">Total matrículas</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{engagementMetrics?.pointsAwardedThisMonth || 0}</div>
                                        <div className="text-xs text-gray-500">Pontos distribuídos</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-purple-600">{engagementMetrics?.badgesEarnedThisMonth || 0}</div>
                                        <div className="text-xs text-gray-500">Badges conquistadas</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Top Users */}
                        <div className="bg-white rounded-xl shadow-lg">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="text-2xl mr-2">🏆</span>
                                    Top 5 Estudantes
                                </h3>
                                
                                <div className="space-y-4">
                                    {topUsers && topUsers.map((user, index) => (
                                        <div key={user.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                                index === 0 ? 'bg-yellow-500' :
                                                index === 1 ? 'bg-gray-400' :
                                                index === 2 ? 'bg-orange-400' : 'bg-blue-500'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                                                            <span>🏅 {user.badges_count} badges</span>
                                                            <span>📚 {user.enrollments_count} cursos</span>
                                                            <span>✅ {user.activities_completed} atividades</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900">{user.total_points}</div>
                                                        <div className="text-xs text-gray-500">pontos</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Courses */}
                        <div className="bg-white rounded-xl shadow-lg">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="text-2xl mr-2">📚</span>
                                    Top 5 Cursos Populares
                                </h3>
                                
                                <div className="space-y-4">
                                    {topCourses && topCourses.map((course, index) => (
                                        <div key={course.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                                                    <p className="text-sm text-gray-600">por {course.instructor_name}</p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {course.status === 'published' ? 'Publicado' : 'Rascunho'}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <div className="text-gray-500">Matrículas</div>
                                                    <div className="font-semibold text-blue-600">{course.enrollments_count}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500">Taxa de Conclusão</div>
                                                    <div className="font-semibold text-green-600">{course.completion_rate}%</div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                    <span>Progresso Médio</span>
                                                    <span>{course.avg_progress}%</span>
                                                </div>
                                                <ProgressBar value={course.avg_progress} max={100} color="blue" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* User Growth Chart */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <span className="text-xl mr-2">📈</span>
                                Crescimento de Usuários (30 dias)
                            </h3>
                            <SimpleChart data={chartData?.userGrowth} />
                            <div className="mt-4 text-center text-sm text-gray-500">
                                Usuários registrados nos últimos 30 dias
                            </div>
                        </div>

                        {/* Enrollment Growth Chart */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <span className="text-xl mr-2">📊</span>
                                Matrículas (30 dias)
                            </h3>
                            <SimpleChart data={chartData?.enrollmentGrowth} />
                            <div className="mt-4 text-center text-sm text-gray-500">
                                Novas matrículas nos últimos 30 dias
                            </div>
                        </div>

                        {/* Activity Completion */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <span className="text-xl mr-2">✅</span>
                                Atividades (7 dias)
                            </h3>
                            <SimpleChart data={chartData?.activityCompletion} />
                            <div className="mt-4 text-center text-sm text-gray-500">
                                Atividades iniciadas vs concluídas
                            </div>
                        </div>

                        {/* Points Growth */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <span className="text-xl mr-2">⭐</span>
                                Distribuição de Pontos (30 dias)
                            </h3>
                            <SimpleChart data={chartData?.pointsGrowth} />
                            <div className="mt-4 text-center text-sm text-gray-500">
                                Pontos distribuídos nos últimos 30 dias
                            </div>
                        </div>

                    </div>

                    {/* Distribution Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* User Roles Distribution */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <span className="text-xl mr-2">👥</span>
                                Distribuição de Papéis
                            </h3>
                            <div className="space-y-3">
                                {chartData?.userRoleDistribution?.map((role, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-4 h-4 rounded-full mr-3 ${
                                                role.role === 'Student' ? 'bg-blue-500' :
                                                role.role === 'Instructor' ? 'bg-green-500' : 'bg-purple-500'
                                            }`}></div>
                                            <span className="text-sm font-medium">{role.role}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold">{role.count}</div>
                                            <div className="text-xs text-gray-500">{role.percentage}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course Status Distribution */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <span className="text-xl mr-2">📚</span>
                                Status dos Cursos
                            </h3>
                            <div className="space-y-3">
                                {chartData?.courseStatusDistribution?.map((status, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-4 h-4 rounded-full mr-3 ${
                                                status.status === 'Published' ? 'bg-green-500' : 'bg-yellow-500'
                                            }`}></div>
                                            <span className="text-sm font-medium">{status.status}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold">{status.count}</div>
                                            <div className="text-xs text-gray-500">{status.percentage}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Badge Distribution */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <span className="text-xl mr-2">🏅</span>
                                Badges Mais Conquistadas
                            </h3>
                            <div className="space-y-3">
                                {chartData?.badgeDistribution?.slice(0, 4).map((badge, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div 
                                                className="w-4 h-4 rounded-full mr-3"
                                                style={{ backgroundColor: badge.color }}
                                            ></div>
                                            <span className="text-sm font-medium truncate">{badge.name}</span>
                                        </div>
                                        <div className="text-sm font-bold">{badge.earned_count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}