import { motion } from 'framer-motion';
import {
    FireIcon,
    TrophyIcon,
    StarIcon,
    HeartIcon,
    LightBulbIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function MotivationalFeedback({
    type = 'encouragement', // 'encouragement', 'milestone', 'warning', 'success'
    level = 'medium', // 'low', 'medium', 'high'
    message,
    progress = null,
    streak = null,
    className = ''
}) {
    const feedbackConfig = {
        encouragement: {
            low: {
                icon: LightBulbIcon,
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-800',
                iconColor: 'text-blue-600',
                emoji: '💡'
            },
            medium: {
                icon: HeartIcon,
                bgColor: 'bg-pink-50',
                borderColor: 'border-pink-200',
                textColor: 'text-pink-800',
                iconColor: 'text-pink-600',
                emoji: '💪'
            },
            high: {
                icon: FireIcon,
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                textColor: 'text-orange-800',
                iconColor: 'text-orange-600',
                emoji: '🔥'
            }
        },
        milestone: {
            low: {
                icon: StarIcon,
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                textColor: 'text-yellow-800',
                iconColor: 'text-yellow-600',
                emoji: '⭐'
            },
            medium: {
                icon: TrophyIcon,
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-200',
                textColor: 'text-amber-800',
                iconColor: 'text-amber-600',
                emoji: '🏆'
            },
            high: {
                icon: TrophyIcon,
                bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
                borderColor: 'border-yellow-300',
                textColor: 'text-yellow-900',
                iconColor: 'text-yellow-700',
                emoji: '👑'
            }
        },
        warning: {
            low: {
                icon: ExclamationTriangleIcon,
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                textColor: 'text-orange-800',
                iconColor: 'text-orange-600',
                emoji: '⚠️'
            },
            medium: {
                icon: ExclamationTriangleIcon,
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-800',
                iconColor: 'text-red-600',
                emoji: '🚨'
            },
            high: {
                icon: ExclamationTriangleIcon,
                bgColor: 'bg-red-100',
                borderColor: 'border-red-300',
                textColor: 'text-red-900',
                iconColor: 'text-red-700',
                emoji: '🔴'
            }
        },
        success: {
            low: {
                icon: CheckCircleIcon,
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-800',
                iconColor: 'text-green-600',
                emoji: '✅'
            },
            medium: {
                icon: CheckCircleIcon,
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200',
                textColor: 'text-emerald-800',
                iconColor: 'text-emerald-600',
                emoji: '🎉'
            },
            high: {
                icon: TrophyIcon,
                bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
                borderColor: 'border-green-300',
                textColor: 'text-green-900',
                iconColor: 'text-green-700',
                emoji: '🚀'
            }
        }
    };

    const config = feedbackConfig[type][level];
    const IconComponent = config.icon;

    const containerVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
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

    const iconVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                delay: 0.2,
                duration: 0.5,
                ease: "easeOut"
            }
        },
        pulse: {
            scale: [1, 1.1, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const sparkleVariants = {
        hidden: { opacity: 0, scale: 0 },
        visible: {
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                delay: 1
            }
        }
    };

    const getDefaultMessage = () => {
        const messages = {
            encouragement: {
                low: "Continue assim! Cada passo conta para o seu crescimento. 📚",
                medium: "Você está no caminho certo! Sua dedicação está fazendo a diferença. 💪",
                high: "Impressionante! Você está em chamas e conquistando objetivos! 🔥"
            },
            milestone: {
                low: "Parabéns! Você alcançou um marco importante. ⭐",
                medium: "Excelente trabalho! Mais uma conquista na sua jornada! 🏆",
                high: "INCRÍVEL! Você está dominando este conteúdo como um verdadeiro expert! 👑"
            },
            warning: {
                low: "Fique atento! Um pequeno esforço extra pode fazer toda a diferença. ⚠️",
                medium: "É importante manter o foco para não perder o progresso conquistado. 🚨",
                high: "Momento crítico! Revisar o conteúdo agora evitará dificuldades futuras. 🔴"
            },
            success: {
                low: "Missão cumprida! Você completou mais uma etapa. ✅",
                medium: "Fantástico! Sua performance está cada vez melhor! 🎉",
                high: "ESPETACULAR! Você superou todas as expectativas! 🚀"
            }
        };

        return messages[type][level];
    };

    const getStreakMessage = () => {
        if (!streak || streak < 2) return null;

        if (streak < 5) return `🔥 ${streak} dias seguidos de estudo!`;
        if (streak < 10) return `🔥 ${streak} dias consecutivos! Você está pegando fogo!`;
        if (streak < 20) return `🚀 ${streak} dias de dedicação incrível!`;
        return `👑 ${streak} dias! Você é uma máquina de aprender!`;
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className={`
                relative overflow-hidden
                ${config.bgColor} ${config.borderColor}
                border rounded-lg p-4
                ${className}
            `}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '30px 30px'
                }} />
            </div>

            <div className="relative z-10">
                <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <motion.div
                        variants={iconVariants}
                        initial="hidden"
                        animate={level === 'high' ? ['visible', 'pulse'] : 'visible'}
                        className="flex-shrink-0"
                    >
                        <div className={`p-2 rounded-full bg-white/70 backdrop-blur-sm border ${config.borderColor}`}>
                            <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
                        </div>
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Main Message */}
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{config.emoji}</span>
                            <p className={`text-sm font-medium ${config.textColor}`}>
                                {message || getDefaultMessage()}
                            </p>
                        </div>

                        {/* Progress Info */}
                        {progress !== null && (
                            <div className="flex items-center space-x-2 mb-2">
                                <ArrowTrendingUpIcon className={`h-4 w-4 ${config.iconColor}`} />
                                <span className={`text-xs ${config.textColor} opacity-80`}>
                                    Progresso atual: {progress}%
                                </span>
                            </div>
                        )}

                        {/* Streak Info */}
                        {getStreakMessage() && (
                            <div className={`text-xs ${config.textColor} opacity-80`}>
                                {getStreakMessage()}
                            </div>
                        )}
                    </div>

                    {/* Decorative Sparkles for High Level */}
                    {level === 'high' && (
                        <div className="absolute top-2 right-2">
                            <motion.div
                                variants={sparkleVariants}
                                initial="hidden"
                                animate="visible"
                                className="text-yellow-400"
                            >
                                ✨
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Bottom Decorative Element for Milestones */}
                {type === 'milestone' && level === 'high' && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                        className={`mt-3 h-1 ${config.bgColor.includes('gradient') ? 'bg-gradient-to-r from-yellow-300 to-amber-300' : 'bg-yellow-300'} rounded-full`}
                    />
                )}
            </div>
        </motion.div>
    );
}