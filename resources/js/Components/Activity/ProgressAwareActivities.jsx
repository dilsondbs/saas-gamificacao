import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    PlayIcon,
    ClockIcon,
    StarIcon,
    BookOpenIcon,
    PuzzlePieceIcon,
    PencilSquareIcon,
    ArrowRightIcon,
    LockClosedIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LockedActivityCard from './LockedActivityCard';
import RetryActivityModal from './RetryActivityModal';
import MotivationalFeedback from '../Gamification/MotivationalFeedback';

export default function ProgressAwareActivities({
    activities = [],
    title = "Atividades do Curso",
    showCourseTitle = true,
    maxItems = 5,
    size = 'md',
    className = '',
    showMotivation = true
}) {
    const [retryModal, setRetryModal] = useState({
        isOpen: false,
        activity: null,
        lastScore: 0,
        attempts: 1
    });

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

    // Calculate statistics for motivation
    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.completed).length;
    const lockedActivities = activities.filter(a => !a.canAccess).length;
    const availableActivities = activities.filter(a => a.canAccess && !a.completed).length;

    const progressPercentage = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    const handleUnlockHelp = (activity, progressData) => {
        // Show modal or tooltip with progression help
        console.log('Help requested for:', activity.title, progressData);
    };

    const handleRetry = (activity) => {
        setRetryModal({
            isOpen: true,
            activity,
            lastScore: activity.lastScore || 0,
            attempts: activity.attempts || 1
        });
    };

    const handleRetryClose = () => {
        setRetryModal({
            isOpen: false,
            activity: null,
            lastScore: 0,
            attempts: 1
        });
    };

    const handleRetryAction = () => {
        // Redirect to activity
        if (retryModal.activity) {
            window.location.href = route('student.activities.show', retryModal.activity.id);
        }
        handleRetryClose();
    };

    if (displayedActivities.length === 0) {
        return (
            <div className={`bg-white rounded-lg border border-gray-200 ${sizeClasses[size].container} ${className}`}>
                <h3 className={`font-semibold text-gray-900 mb-4 ${sizeClasses[size].title}`}>
                    {title}
                </h3>
                <div className="text-center py-8">
                    <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className={`text-gray-500 ${sizeClasses[size].subtitle}`}>
                        Nenhuma atividade encontrada.
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
                <div className={`text-gray-500 ${sizeClasses[size].subtitle} flex items-center space-x-4`}>
                    <span>{completedActivities}/{totalActivities} concluídas</span>
                    {lockedActivities > 0 && (
                        <span className="text-orange-600 flex items-center space-x-1">
                            <LockClosedIcon className="h-3 w-3" />
                            <span>{lockedActivities} bloqueadas</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Motivational Feedback */}
            {showMotivation && (
                <div className="mb-4">
                    {progressPercentage >= 80 && (
                        <MotivationalFeedback
                            type="milestone"
                            level="high"
                            message={`Incrível! Você já completou ${progressPercentage}% do curso!`}
                            progress={progressPercentage}
                        />
                    )}
                    {progressPercentage >= 50 && progressPercentage < 80 && (
                        <MotivationalFeedback
                            type="encouragement"
                            level="high"
                            message="Você está no meio do caminho! Continue assim!"
                            progress={progressPercentage}
                        />
                    )}
                    {progressPercentage < 50 && availableActivities > 0 && (
                        <MotivationalFeedback
                            type="encouragement"
                            level="medium"
                            message="Que tal começar uma nova atividade hoje?"
                            progress={progressPercentage}
                        />
                    )}
                    {lockedActivities > 0 && (
                        <div className="mt-2">
                            <MotivationalFeedback
                                type="warning"
                                level="low"
                                message={`${lockedActivities} atividade${lockedActivities > 1 ? 's' : ''} aguardando seu progresso para serem desbloqueadas.`}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Activities List */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
            >
                {displayedActivities.map((activity, index) => {
                    // Locked Activity
                    if (!activity.canAccess) {
                        return (
                            <motion.div
                                key={activity.id || index}
                                variants={itemVariants}
                            >
                                <LockedActivityCard
                                    activity={activity}
                                    progressData={activity.progressData}
                                    onUnlockHelp={handleUnlockHelp}
                                    variant={size === 'sm' ? 'compact' : 'default'}
                                />
                            </motion.div>
                        );
                    }

                    // Available Activity
                    const color = getActivityColor(activity.type);

                    return (
                        <motion.div
                            key={activity.id || index}
                            variants={itemVariants}
                            whileHover="hover"
                        >
                            {activity.completed ? (
                                // Completed Activity
                                <div className={`
                                    border border-green-200 rounded-lg bg-green-50 transition-all duration-200
                                    ${sizeClasses[size].activity}
                                `}>
                                    <div className="flex items-start space-x-3">
                                        {/* Completed Icon */}
                                        <div className="flex-shrink-0 p-2 rounded-lg bg-green-100 text-green-600">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className={`
                                                font-medium text-green-900 truncate
                                                ${size === 'sm' ? 'text-sm' : 'text-base'}
                                            `}>
                                                {activity.title}
                                            </h4>

                                            <div className={`
                                                flex items-center space-x-4 mt-2
                                                ${sizeClasses[size].subtitle}
                                            `}>
                                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Concluída
                                                </div>

                                                {activity.score && (
                                                    <div className="flex items-center space-x-1 text-green-600">
                                                        <span>Nota: {activity.score}%</span>
                                                    </div>
                                                )}

                                                {activity.score && activity.score < 70 && (
                                                    <button
                                                        onClick={() => handleRetry(activity)}
                                                        className="text-xs text-orange-600 hover:text-orange-800 underline"
                                                    >
                                                        Melhorar nota
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Available Activity
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
                                                {showCourseTitle && activity.course && (
                                                    <p className={`
                                                        text-gray-500 truncate mb-1
                                                        ${sizeClasses[size].subtitle}
                                                    `}>
                                                        {activity.course.title}
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
                                            </div>

                                            {/* Action Arrow */}
                                            <div className="flex-shrink-0">
                                                <ArrowRightIcon className={`
                                                    text-gray-400 group-hover:text-${color}-600 transition-colors
                                                    ${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}
                                                `} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )}
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

            {/* Retry Modal */}
            <RetryActivityModal
                isOpen={retryModal.isOpen}
                onClose={handleRetryClose}
                onRetry={handleRetryAction}
                activity={retryModal.activity}
                lastScore={retryModal.lastScore}
                attempts={retryModal.attempts}
                tips={[
                    "Revise o material de estudo novamente",
                    "Faça anotações dos pontos principais",
                    "Pratique com exercícios similares"
                ]}
            />
        </div>
    );
}