import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import {
    PlayIcon,
    ClockIcon,
    StarIcon,
    BookOpenIcon,
    PuzzlePieceIcon,
    PencilSquareIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function NextActivities({
    activities = [],
    title = "Próximas Atividades",
    showCourseTitle = true,
    maxItems = 3,
    size = 'md',
    className = ''
}) {
    const sizeClasses = {
        sm: {
            container: 'p-3',
            title: 'text-sm',
            subtitle: 'text-xs',
            activity: 'p-3'
        },
        md: {
            container: 'p-4',
            title: 'text-base',
            subtitle: 'text-sm',
            activity: 'p-4'
        },
        lg: {
            container: 'p-6',
            title: 'text-lg',
            subtitle: 'text-base',
            activity: 'p-5'
        }
    };

    const getActivityIcon = (type) => {
        const iconClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

        switch (type) {
            case 'reading':
                return <BookOpenIcon className={iconClass} />;
            case 'quiz':
                return <PuzzlePieceIcon className={iconClass} />;
            case 'assignment':
                return <PencilSquareIcon className={iconClass} />;
            default:
                return <PlayIcon className={iconClass} />;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'reading':
                return 'blue';
            case 'quiz':
                return 'purple';
            case 'assignment':
                return 'green';
            default:
                return 'gray';
        }
    };

    const getActivityTypeName = (type) => {
        switch (type) {
            case 'reading':
                return 'Leitura';
            case 'quiz':
                return 'Quiz';
            case 'assignment':
                return 'Tarefa';
            default:
                return 'Atividade';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy':
                return 'text-green-600';
            case 'medium':
                return 'text-yellow-600';
            case 'hard':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

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
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        },
        hover: {
            scale: 1.02,
            transition: {
                duration: 0.2
            }
        }
    };

    const displayedActivities = activities.slice(0, maxItems);

    if (displayedActivities.length === 0) {
        return (
            <div className={`bg-white rounded-lg border border-gray-200 ${sizeClasses[size].container} ${className}`}>
                <h3 className={`font-semibold text-gray-900 mb-4 ${sizeClasses[size].title}`}>
                    {title}
                </h3>
                <div className="text-center py-8">
                    <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className={`text-gray-500 ${sizeClasses[size].subtitle}`}>
                        Parabéns! Você está em dia com todas as atividades.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 ${sizeClasses[size].container} ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold text-gray-900 ${sizeClasses[size].title}`}>
                    {title}
                </h3>
                <div className={`text-gray-500 ${sizeClasses[size].subtitle}`}>
                    {activities.length} atividade{activities.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Activities List */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
            >
                {displayedActivities.map((item, index) => {
                    const activity = item.activity || item;
                    const course = item.course_title || activity.course?.title;
                    const color = getActivityColor(activity.type);

                    return (
                        <motion.div
                            key={activity.id || index}
                            variants={itemVariants}
                            whileHover="hover"
                        >
                            <Link
                                href={route('student.activities.show', activity.id)}
                                className="block"
                            >
                                <div className={`
                                    border border-gray-200 rounded-lg transition-all duration-200
                                    hover:border-${color}-300 hover:shadow-sm
                                    ${sizeClasses[size].activity}
                                `}>
                                    <div className="flex items-start space-x-3">
                                        {/* Activity Icon */}
                                        <div className={`
                                            flex-shrink-0 p-2 rounded-lg
                                            bg-${color}-50 text-${color}-600
                                        `}>
                                            {getActivityIcon(activity.type)}
                                        </div>

                                        {/* Activity Info */}
                                        <div className="flex-1 min-w-0">
                                            {/* Course Title */}
                                            {showCourseTitle && course && (
                                                <p className={`
                                                    text-gray-500 truncate mb-1
                                                    ${sizeClasses[size].subtitle}
                                                `}>
                                                    {course}
                                                </p>
                                            )}

                                            {/* Activity Title */}
                                            <h4 className={`
                                                font-medium text-gray-900 truncate
                                                ${size === 'sm' ? 'text-sm' : 'text-base'}
                                            `}>
                                                {activity.title}
                                            </h4>

                                            {/* Activity Details */}
                                            <div className={`
                                                flex items-center space-x-4 mt-2
                                                ${sizeClasses[size].subtitle}
                                            `}>
                                                {/* Type */}
                                                <div className={`
                                                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                                    bg-${color}-100 text-${color}-800
                                                `}>
                                                    {getActivityTypeName(activity.type)}
                                                </div>

                                                {/* Duration */}
                                                {activity.duration_minutes && (
                                                    <div className="flex items-center space-x-1 text-gray-500">
                                                        <ClockIcon className="h-3 w-3" />
                                                        <span>{activity.duration_minutes}min</span>
                                                    </div>
                                                )}

                                                {/* Points */}
                                                {activity.points_value && (
                                                    <div className="flex items-center space-x-1 text-gray-500">
                                                        <StarIcon className="h-3 w-3" />
                                                        <span>{activity.points_value} pts</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Description */}
                                            {activity.description && (
                                                <p className={`
                                                    text-gray-600 mt-2 line-clamp-2
                                                    ${sizeClasses[size].subtitle}
                                                `}>
                                                    {activity.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Arrow */}
                                        <div className="flex-shrink-0">
                                            <ArrowRightIcon className={`
                                                text-gray-400 group-hover:text-${color}-600 transition-colors
                                                ${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}
                                            `} />
                                        </div>
                                    </div>

                                    {/* Progress Indicator (if available) */}
                                    {activity.progress && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                <span>Progresso</span>
                                                <span>{activity.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1">
                                                <div
                                                    className={`bg-${color}-600 h-1 rounded-full transition-all duration-300`}
                                                    style={{ width: `${activity.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* View All Link */}
            {activities.length > maxItems && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                        href={route('student.activities.index')}
                        className={`
                            inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-medium
                            ${sizeClasses[size].subtitle}
                        `}
                    >
                        <span>Ver todas as atividades</span>
                        <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                </div>
            )}

            {/* Motivational Message */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <p className={`text-blue-700 text-center ${sizeClasses[size].subtitle}`}>
                    🎯 Continue sua jornada de aprendizagem!
                </p>
            </div>
        </div>
    );
}