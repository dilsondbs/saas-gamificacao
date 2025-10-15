import { motion } from 'framer-motion';

export default function BadgeCard({
    badge,
    earned = false,
    earnedAt = null,
    size = 'md',
    showDetails = true,
    className = ''
}) {
    const sizeClasses = {
        sm: {
            container: 'p-3',
            icon: 'text-2xl',
            title: 'text-xs',
            description: 'text-xs'
        },
        md: {
            container: 'p-4',
            icon: 'text-3xl',
            title: 'text-sm',
            description: 'text-xs'
        },
        lg: {
            container: 'p-6',
            icon: 'text-5xl',
            title: 'text-base',
            description: 'text-sm'
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        },
        hover: {
            scale: 1.05,
            transition: {
                duration: 0.2
            }
        }
    };

    const iconVariants = {
        earned: {
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
            transition: {
                duration: 0.6,
                ease: "easeInOut"
            }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={earned ? "hover" : undefined}
            className={`
                relative rounded-lg border-2 transition-all duration-300
                ${earned
                    ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg'
                    : 'border-gray-200 bg-gray-50'
                }
                ${sizeClasses[size].container}
                ${className}
            `}
        >
            {/* Earned indicator */}
            {earned && (
                <div className="absolute -top-2 -right-2">
                    <div className="bg-green-500 text-white rounded-full p-1">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            )}

            <div className="text-center">
                {/* Badge Icon */}
                <motion.div
                    variants={iconVariants}
                    animate={earned ? "earned" : undefined}
                    className={`
                        ${sizeClasses[size].icon}
                        ${earned ? 'filter-none' : 'filter grayscale opacity-50'}
                        transition-all duration-300
                    `}
                >
                    {badge.icon || '🏆'}
                </motion.div>

                {showDetails && (
                    <>
                        {/* Badge Name */}
                        <h3 className={`
                            font-semibold mt-2
                            ${sizeClasses[size].title}
                            ${earned ? 'text-gray-900' : 'text-gray-500'}
                        `}>
                            {badge.name}
                        </h3>

                        {/* Badge Description */}
                        <p className={`
                            mt-1
                            ${sizeClasses[size].description}
                            ${earned ? 'text-gray-600' : 'text-gray-400'}
                        `}>
                            {badge.description}
                        </p>

                        {/* Points Value */}
                        {badge.points_value && (
                            <div className={`
                                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2
                                ${earned
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-500'
                                }
                            `}>
                                {badge.points_value} pontos
                            </div>
                        )}

                        {/* Earned Date */}
                        {earned && earnedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                                Conquistado em {new Date(earnedAt).toLocaleDateString('pt-BR')}
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Shine effect for earned badges */}
            {earned && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 skew-x-12"
                    animate={{
                        x: ['-100%', '100%'],
                        opacity: [0, 0.3, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                    }}
                />
            )}
        </motion.div>
    );
}