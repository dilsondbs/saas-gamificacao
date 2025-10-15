import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    TrophyIcon,
    StarIcon,
    ChartBarIcon,
    UserGroupIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

// Import gamification components
import ProgressBar from '@/Components/Progress/ProgressBar';
import ProgressCircle from '@/Components/Progress/ProgressCircle';
import BadgeCard from '@/Components/Gamification/BadgeCard';
import LevelIndicator from '@/Components/Gamification/LevelIndicator';
import Leaderboard from '@/Components/Gamification/Leaderboard';
import CourseCard from '@/Components/Course/CourseCard';
import NextActivities from '@/Components/Activity/NextActivities';

export default function Dashboard(props) {
    const {
        userType = 'student',
        user,
        stats = {},
        courses = [],
        badges = [],
        recentActivities = [],
        nextActivities = [],
        leaderboard = {},
        recentStudentActivities = [],
        error = null
    } = props;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    // Error state
    if (error) {
        return (
            <AuthenticatedLayout
                user={props.auth.user}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
            >
                <Head title="Dashboard" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Student Dashboard
    if (userType === 'student') {
        return (
            <AuthenticatedLayout
                user={props.auth.user}
                header={
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Meu Painel de Aprendizagem
                        </h2>
                        <div className="text-sm text-gray-600">
                            Bem-vindo, {user?.name}! 🎯
                        </div>
                    </div>
                }
            >
                <Head title="Dashboard" />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="py-8"
                >
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Stats Overview */}
                                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Level Card */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <TrophyIcon className="h-8 w-8 text-yellow-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Nível Atual</p>
                                                <p className="text-2xl font-bold text-gray-900">{stats.level || 1}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Points Card */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <StarIcon className="h-8 w-8 text-indigo-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Total de Pontos</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {stats.total_points?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badges Card */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Badges</p>
                                                <p className="text-2xl font-bold text-gray-900">{stats.total_badges || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Level Progress */}
                                {stats.level && (
                                    <motion.div variants={itemVariants}>
                                        <LevelIndicator
                                            level={stats.level}
                                            currentPoints={stats.total_points || 0}
                                            pointsToNextLevel={stats.points_to_next_level || 100}
                                            showProgress={true}
                                        />
                                    </motion.div>
                                )}

                                {/* My Courses */}
                                <motion.div variants={itemVariants}>
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Meus Cursos</h3>
                                            <span className="text-sm text-gray-500">
                                                {courses.length} curso{courses.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        {courses.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {courses.slice(0, 4).map((course) => (
                                                    <CourseCard
                                                        key={course.id}
                                                        course={course}
                                                        variant="compact"
                                                        showProgress={true}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <AcademicCapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-sm font-medium text-gray-900 mb-2">
                                                    Nenhum curso matriculado
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Explore nosso catálogo e comece sua jornada de aprendizagem!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Next Activities */}
                                <motion.div variants={itemVariants}>
                                    <NextActivities
                                        activities={nextActivities}
                                        title="Próximas Atividades"
                                        showCourseTitle={true}
                                        maxItems={3}
                                    />
                                </motion.div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">

                                {/* Recent Badges */}
                                {badges.length > 0 && (
                                    <motion.div variants={itemVariants}>
                                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                Badges Recentes
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {badges.slice(0, 4).map((userBadge) => (
                                                    <BadgeCard
                                                        key={userBadge.id}
                                                        badge={userBadge.badge}
                                                        earned={true}
                                                        earnedAt={userBadge.earned_at}
                                                        size="sm"
                                                        showDetails={true}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Leaderboard */}
                                <motion.div variants={itemVariants}>
                                    <Leaderboard
                                        userPosition={leaderboard.user_position || 1}
                                        userPoints={leaderboard.user_points || 0}
                                        topUsers={leaderboard.top_users || []}
                                        showUserPosition={true}
                                    />
                                </motion.div>

                                {/* Study Statistics */}
                                <motion.div variants={itemVariants}>
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Estatísticas de Estudo
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Taxa de Conclusão
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {stats.completion_rate || 0}%
                                                    </span>
                                                </div>
                                                <ProgressBar
                                                    percentage={stats.completion_rate || 0}
                                                    color="green"
                                                    size="sm"
                                                    showLabel={false}
                                                />
                                            </div>

                                            <div className="pt-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Cursos Concluídos</span>
                                                    <span className="font-medium">{stats.courses_completed || 0}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Atividades Completas</span>
                                                    <span className="font-medium">{stats.activities_completed || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AuthenticatedLayout>
        );
    }

    // Instructor Dashboard
    if (userType === 'instructor') {
        return (
            <AuthenticatedLayout
                user={props.auth.user}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Painel do Instrutor</h2>}
            >
                <Head title="Dashboard do Instrutor" />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="py-8"
                >
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {/* Instructor Stats */}
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Cursos</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_courses || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <UserGroupIcon className="h-8 w-8 text-green-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Alunos</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_students || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <ClockIcon className="h-8 w-8 text-orange-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Atividades</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_activities || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <ChartBarIcon className="h-8 w-8 text-purple-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Taxa Conclusão</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.completion_rate || 0}%</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Instructor Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <motion.div variants={itemVariants}>
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Meus Cursos</h3>
                                    {courses.length > 0 ? (
                                        <div className="space-y-4">
                                            {courses.map((course) => (
                                                <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                                                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                                                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                                                        <span>{course.enrollments_count} alunos</span>
                                                        <span>{course.activities_count} atividades</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Nenhum curso criado ainda.</p>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente dos Alunos</h3>
                                    {recentStudentActivities.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentStudentActivities.map((activity, index) => (
                                                <div key={index} className="flex items-center space-x-3">
                                                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {activity.user?.name} concluiu
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {activity.activity?.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Nenhuma atividade recente.</p>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AuthenticatedLayout>
        );
    }

    // Default/Guest Dashboard
    return (
        <AuthenticatedLayout
            user={props.auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            Bem-vindo ao sistema! Configure seu perfil para começar.
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
