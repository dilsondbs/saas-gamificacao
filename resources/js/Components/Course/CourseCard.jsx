import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import {
    AcademicCapIcon,
    ClockIcon,
    UserIcon,
    PlayIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import ProgressBar from '../Progress/ProgressBar';
import ProgressCircle from '../Progress/ProgressCircle';

export default function CourseCard({
    course,
    showProgress = true,
    variant = 'default', // 'default', 'compact', 'detailed'
    onClick = null,
    className = ''
}) {
    const progress = course.progress || { percentage: 0, completed: 0, total: 0 };
    const status = course.status || getStatusFromProgress(progress);

    const statusConfig = {
        not_started: {
            color: 'gray',
            icon: PlayIcon,
            text: 'Iniciar',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
        },
        in_progress: {
            color: 'blue',
            icon: ClockIcon,
            text: 'Em Progresso',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        almost_done: {
            color: 'orange',
            icon: ExclamationTriangleIcon,
            text: 'Quase Pronto',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200'
        },
        completed: {
            color: 'green',
            icon: CheckCircleIcon,
            text: 'Concluído',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        }
    };

    const config = statusConfig[status] || statusConfig.not_started;
    const StatusIcon = config.icon;

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        },
        hover: {
            scale: 1.02,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            transition: {
                duration: 0.2
            }
        }
    };

    const CardContent = () => (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className={`
                bg-white rounded-lg border shadow-sm transition-all duration-200
                ${config.borderColor} hover:border-${config.color}-300
                ${variant === 'compact' ? 'p-4' : 'p-6'}
                ${className}
            `}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`
                        p-2 rounded-lg ${config.bgColor}
                        ${variant === 'compact' ? 'p-1.5' : 'p-2'}
                    `}>
                        <AcademicCapIcon className={`
                            text-${config.color}-600
                            ${variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5'}
                        `} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className={`
                            font-semibold text-gray-900 truncate
                            ${variant === 'compact' ? 'text-sm' : 'text-base'}
                        `}>
                            {course.title}
                        </h3>
                        {course.instructor && (
                            <p className={`
                                text-gray-500 truncate
                                ${variant === 'compact' ? 'text-xs' : 'text-sm'}
                            `}>
                                {course.instructor}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    bg-${config.color}-100 text-${config.color}-800
                `}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {config.text}
                </div>
            </div>

            {/* Description */}
            {variant === 'detailed' && course.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                </p>
            )}

            {/* Progress Section */}
            {showProgress && (
                <div className="mb-4">
                    {variant === 'compact' ? (
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progresso</span>
                            <span>{progress.percentage}%</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Progresso do Curso
                            </span>
                            <span className="text-sm text-gray-500">
                                {progress.completed}/{progress.total} atividades
                            </span>
                        </div>
                    )}

                    <ProgressBar
                        percentage={progress.percentage}
                        color={config.color}
                        size={variant === 'compact' ? 'sm' : 'md'}
                        showLabel={false}
                        animated={true}
                    />
                </div>
            )}

            {/* Course Stats */}
            <div className={`
                flex items-center justify-between text-gray-500
                ${variant === 'compact' ? 'text-xs' : 'text-sm'}
            `}>
                <div className="flex items-center space-x-4">
                    {course.enrolled_at && (
                        <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>
                                {new Date(course.enrolled_at).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Next Activity */}
                {course.next_activity && status !== 'completed' && (
                    <div className={`
                        text-right
                        ${variant === 'compact' ? 'text-xs' : 'text-sm'}
                    `}>
                        <p className="text-gray-400">Próxima:</p>
                        <p className={`
                            font-medium text-${config.color}-600 truncate max-w-32
                        `}>
                            {course.next_activity.title}
                        </p>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="mt-4">
                <div className={`
                    w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                    bg-${config.color}-600 hover:bg-${config.color}-700
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${config.color}-500
                    transition-colors duration-200
                `}>
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {status === 'completed' ? 'Revisar Curso' :
                     status === 'not_started' ? 'Começar Curso' :
                     'Continuar Curso'}
                </div>
            </div>

            {/* Hover Overlay for Animation */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 skew-x-12 pointer-events-none"
                whileHover={{
                    x: ['-100%', '100%'],
                    opacity: [0, 0.1, 0]
                }}
                transition={{
                    duration: 0.6
                }}
            />
        </motion.div>
    );

    // Wrap with Link if course.id is provided
    if (course.id && !onClick) {
        return (
            <Link href={route('student.courses.show', course.id)} className="block">
                <CardContent />
            </Link>
        );
    }

    // Wrap with button if onClick is provided
    if (onClick) {
        return (
            <button onClick={() => onClick(course)} className="block w-full text-left">
                <CardContent />
            </button>
        );
    }

    // Return plain card
    return <CardContent />;
}

function getStatusFromProgress(progress) {
    if (progress.percentage >= 100) {
        return 'completed';
    } else if (progress.percentage >= 70) {
        return 'almost_done';
    } else if (progress.percentage > 0) {
        return 'in_progress';
    } else {
        return 'not_started';
    }
}