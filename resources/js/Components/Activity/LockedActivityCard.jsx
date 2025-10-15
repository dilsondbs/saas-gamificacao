import { motion } from 'framer-motion';
import {
    LockClosedIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    PlayIcon,
    ArrowRightIcon,
    BookOpenIcon,
    PuzzlePieceIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import ProgressBar from '../Progress/ProgressBar';

export default function LockedActivityCard({
    activity,
    progressData,
    onUnlockHelp = null,
    variant = 'default',
    className = ''
}) {
    const {
        currentProgress = 0,
        requiredProgress = 70,
        completedPrevious = 0,
        totalPrevious = 0,
        incompleteActivities = []
    } = progressData || {};

    const getActivityIcon = (type) => {
        const iconClass = 'h-5 w-5';
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

    const getMotivationalMessage = () => {
        const remaining = totalPrevious - completedPrevious;
        if (remaining === 1) {
            return "Você está quase lá! Complete mais 1 atividade para desbloquear.";
        }
        return `Complete mais ${remaining} atividades para desbloquear esta etapa.`;
    };

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
            scale: 1.01,
            transition: {
                duration: 0.2
            }
        }
    };

    const lockVariants = {
        locked: {
            scale: 1,
            rotate: 0
        },
        hover: {
            scale: 1.1,
            rotate: [0, -5, 5, 0],
            transition: {
                duration: 0.3
            }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className={`
                relative bg-gradient-to-br from-gray-50 to-gray-100
                border-2 border-gray-300 border-dashed rounded-lg
                ${variant === 'compact' ? 'p-4' : 'p-6'}
                ${className}
            `}
        >
            {/* Lock Overlay */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg" />

            {/* Content */}
            <div className="relative z-10">
                {/* Header with Lock Icon */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        {/* Activity Icon (Faded) */}
                        <div className="p-2 rounded-lg bg-gray-200 opacity-50">
                            {getActivityIcon(activity.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className={`
                                font-semibold text-gray-500 truncate
                                ${variant === 'compact' ? 'text-sm' : 'text-base'}
                            `}>
                                {activity.title}
                            </h3>
                            <p className={`
                                text-gray-400 truncate
                                ${variant === 'compact' ? 'text-xs' : 'text-sm'}
                            `}>
                                {activity.course?.title || 'Curso'}
                            </p>
                        </div>
                    </div>

                    {/* Lock Icon */}
                    <motion.div
                        variants={lockVariants}
                        initial="locked"
                        whileHover="hover"
                        className="flex-shrink-0"
                    >
                        <div className="p-2 rounded-full bg-orange-100 border border-orange-200">
                            <LockClosedIcon className="h-5 w-5 text-orange-600" />
                        </div>
                    </motion.div>
                </div>

                {/* Lock Reason */}
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-orange-800 mb-1">
                                Atividade Bloqueada
                            </h4>
                            <p className="text-sm text-orange-700">
                                {getMotivationalMessage()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Requirements */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Progresso Necessário
                        </span>
                        <span className="text-sm text-gray-500">
                            {completedPrevious}/{totalPrevious} atividades
                        </span>
                    </div>

                    <ProgressBar
                        percentage={currentProgress}
                        color="orange"
                        size="md"
                        showLabel={true}
                        animated={true}
                    />

                    <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                        <span>Atual: {currentProgress}%</span>
                        <span>Necessário: {requiredProgress}%</span>
                    </div>
                </div>

                {/* Incomplete Activities List */}
                {incompleteActivities.length > 0 && (
                    <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Atividades Pendentes:
                        </h5>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {incompleteActivities.slice(0, 3).map((incompleteActivity) => (
                                <div
                                    key={incompleteActivity.id}
                                    className="flex items-center justify-between p-2 bg-white rounded border"
                                >
                                    <span className="text-sm text-gray-600 truncate">
                                        {incompleteActivity.title}
                                    </span>
                                    <ChartBarIcon className="h-4 w-4 text-gray-400" />
                                </div>
                            ))}

                            {incompleteActivities.length > 3 && (
                                <div className="text-xs text-gray-500 text-center pt-1">
                                    +{incompleteActivities.length - 3} mais atividades
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Activity Details (Faded) */}
                <div className={`
                    flex items-center space-x-4 mb-4 opacity-60
                    ${variant === 'compact' ? 'text-xs' : 'text-sm'}
                `}>
                    {/* Type */}
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {getActivityTypeName(activity.type)}
                    </div>

                    {/* Points */}
                    {activity.points_value && (
                        <div className="flex items-center space-x-1 text-gray-500">
                            <span>{activity.points_value} pts</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                    {/* Help Button */}
                    {onUnlockHelp && (
                        <button
                            onClick={() => onUnlockHelp(activity, progressData)}
                            className="inline-flex items-center px-3 py-2 border border-orange-300 rounded-md text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors duration-200"
                        >
                            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                            Como Desbloquear?
                        </button>
                    )}

                    {/* Motivational Text */}
                    <div className="text-right">
                        <p className="text-xs text-gray-500">
                            🔓 Desbloqueie completando as atividades anteriores
                        </p>
                    </div>
                </div>

                {/* Locked Indicator Animation */}
                <motion.div
                    className="absolute top-3 right-3 opacity-20"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.1, 0.2]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <LockClosedIcon className="h-8 w-8 text-gray-400" />
                </motion.div>
            </div>
        </motion.div>
    );
}