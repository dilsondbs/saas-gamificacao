import { motion } from 'framer-motion';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/solid';

export default function Leaderboard({
    userPosition = 1,
    userPoints = 0,
    topUsers = [],
    showUserPosition = true,
    size = 'md',
    className = ''
}) {
    const sizeClasses = {
        sm: {
            container: 'p-3',
            title: 'text-sm',
            subtitle: 'text-xs',
            position: 'text-xs',
            points: 'text-xs'
        },
        md: {
            container: 'p-4',
            title: 'text-base',
            subtitle: 'text-sm',
            position: 'text-sm',
            points: 'text-sm'
        },
        lg: {
            container: 'p-6',
            title: 'text-lg',
            subtitle: 'text-base',
            position: 'text-base',
            points: 'text-base'
        }
    };

    const getPositionIcon = (position) => {
        switch (position) {
            case 1:
                return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <TrophyIcon className="h-5 w-5 text-gray-400" />;
            case 3:
                return <TrophyIcon className="h-5 w-5 text-orange-600" />;
            default:
                return <StarIcon className="h-4 w-4 text-indigo-500" />;
        }
    };

    const getPositionStyle = (position) => {
        switch (position) {
            case 1:
                return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200';
            case 2:
                return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
            case 3:
                return 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200';
            default:
                return 'bg-white border-gray-200';
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
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className={`bg-white rounded-lg border border-gray-200 ${sizeClasses[size].container} ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <TrophyIcon className="h-5 w-5 text-yellow-500" />
                    <h3 className={`font-semibold text-gray-900 ${sizeClasses[size].title}`}>
                        Ranking
                    </h3>
                </div>
                <div className={`text-gray-500 ${sizeClasses[size].subtitle}`}>
                    Top {topUsers.length}
                </div>
            </div>

            {/* User Position (if not in top users) */}
            {showUserPosition && userPosition > topUsers.length && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                                <span className={`font-bold text-indigo-600 ${sizeClasses[size].position}`}>
                                    #{userPosition}
                                </span>
                            </div>
                            <div>
                                <div className={`font-medium text-indigo-900 ${sizeClasses[size].subtitle}`}>
                                    Sua Posição
                                </div>
                                <div className={`text-indigo-600 ${sizeClasses[size].points}`}>
                                    {userPoints.toLocaleString()} pontos
                                </div>
                            </div>
                        </div>
                        <StarIcon className="h-5 w-5 text-indigo-500" />
                    </div>
                </motion.div>
            )}

            {/* Top Users List */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2"
            >
                {topUsers.map((user, index) => {
                    const position = index + 1;
                    const isCurrentUser = showUserPosition && position === userPosition;

                    return (
                        <motion.div
                            key={user.user_id || index}
                            variants={itemVariants}
                            className={`
                                p-3 rounded-lg border transition-all duration-200
                                ${getPositionStyle(position)}
                                ${isCurrentUser ? 'ring-2 ring-indigo-400' : ''}
                                hover:shadow-sm
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {/* Position Icon/Number */}
                                    <div className="flex items-center justify-center w-8 h-8">
                                        {position <= 3 ? (
                                            getPositionIcon(position)
                                        ) : (
                                            <span className={`font-bold text-gray-600 ${sizeClasses[size].position}`}>
                                                #{position}
                                            </span>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div>
                                        <div className={`font-medium text-gray-900 ${sizeClasses[size].subtitle}`}>
                                            {isCurrentUser ? 'Você' : `Usuário ${user.user_id}`}
                                            {position <= 3 && (
                                                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                                    {position === 1 ? '👑 Campeão' :
                                                     position === 2 ? '🥈 Vice' : '🥉 3º Lugar'}
                                                </span>
                                            )}
                                        </div>
                                        <div className={`text-gray-600 ${sizeClasses[size].points}`}>
                                            {user.total_points?.toLocaleString()} pontos
                                        </div>
                                    </div>
                                </div>

                                {/* Achievement Badge for Top 3 */}
                                {position <= 3 && (
                                    <motion.div
                                        animate={{
                                            rotate: [0, 5, -5, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 3
                                        }}
                                    >
                                        {getPositionIcon(position)}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Empty State */}
            {topUsers.length === 0 && (
                <div className="text-center py-8">
                    <TrophyIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className={`text-gray-500 ${sizeClasses[size].subtitle}`}>
                        Nenhum usuário no ranking ainda
                    </p>
                </div>
            )}

            {/* Motivational Message */}
            {showUserPosition && userPosition > 3 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <p className={`text-blue-700 text-center ${sizeClasses[size].subtitle}`}>
                        🚀 Continue estudando para subir no ranking!
                    </p>
                </div>
            )}
        </div>
    );
}