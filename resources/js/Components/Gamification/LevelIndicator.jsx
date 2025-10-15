import { motion } from 'framer-motion';
import ProgressBar from '../Progress/ProgressBar';

export default function LevelIndicator({
    level = 1,
    currentPoints = 0,
    pointsToNextLevel = 100,
    size = 'md',
    showProgress = true,
    className = ''
}) {
    const sizeClasses = {
        sm: {
            container: 'px-3 py-2',
            level: 'text-sm',
            points: 'text-xs'
        },
        md: {
            container: 'px-4 py-3',
            level: 'text-lg',
            points: 'text-sm'
        },
        lg: {
            container: 'px-6 py-4',
            level: 'text-xl',
            points: 'text-base'
        }
    };

    const levelColors = {
        1: { bg: 'bg-gray-100', text: 'text-gray-700', accent: 'text-gray-600' },
        2: { bg: 'bg-green-100', text: 'text-green-700', accent: 'text-green-600' },
        3: { bg: 'bg-blue-100', text: 'text-blue-700', accent: 'text-blue-600' },
        4: { bg: 'bg-purple-100', text: 'text-purple-700', accent: 'text-purple-600' },
        5: { bg: 'bg-pink-100', text: 'text-pink-700', accent: 'text-pink-600' },
        6: { bg: 'bg-yellow-100', text: 'text-yellow-700', accent: 'text-yellow-600' },
        7: { bg: 'bg-orange-100', text: 'text-orange-700', accent: 'text-orange-600' },
        8: { bg: 'bg-red-100', text: 'text-red-700', accent: 'text-red-600' },
        9: { bg: 'bg-indigo-100', text: 'text-indigo-700', accent: 'text-indigo-600' },
        10: { bg: 'bg-gradient-to-r from-yellow-100 to-orange-100', text: 'text-orange-700', accent: 'text-orange-600' }
    };

    const colors = levelColors[Math.min(level, 10)] || levelColors[1];

    const progressPercentage = pointsToNextLevel > 0
        ? ((currentPoints % pointsToNextLevel) / pointsToNextLevel) * 100
        : 100;

    const levelBadgeVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        },
        pulse: {
            scale: [1, 1.1, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
            }
        }
    };

    return (
        <div className={`
            rounded-lg border ${colors.bg} border-gray-200
            ${sizeClasses[size].container}
            ${className}
        `}>
            <div className="flex items-center justify-between">
                {/* Level Badge */}
                <motion.div
                    variants={levelBadgeVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="pulse"
                    className="flex items-center space-x-3"
                >
                    <div className={`
                        flex items-center justify-center w-12 h-12 rounded-full
                        bg-white border-2 border-current ${colors.text}
                    `}>
                        <span className={`font-bold ${sizeClasses[size].level}`}>
                            {level}
                        </span>
                    </div>

                    <div>
                        <div className={`font-semibold ${colors.text} ${sizeClasses[size].level}`}>
                            Nível {level}
                        </div>
                        <div className={`${colors.accent} ${sizeClasses[size].points}`}>
                            {getLevelTitle(level)}
                        </div>
                    </div>
                </motion.div>

                {/* Points */}
                <div className="text-right">
                    <div className={`font-semibold ${colors.text} ${sizeClasses[size].level}`}>
                        {currentPoints.toLocaleString()}
                    </div>
                    <div className={`${colors.accent} ${sizeClasses[size].points}`}>
                        pontos
                    </div>
                </div>
            </div>

            {/* Progress to Next Level */}
            {showProgress && level < 10 && (
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className={`${sizeClasses[size].points} ${colors.accent}`}>
                            Próximo nível
                        </span>
                        <span className={`${sizeClasses[size].points} ${colors.accent}`}>
                            {pointsToNextLevel} pontos restantes
                        </span>
                    </div>
                    <ProgressBar
                        percentage={progressPercentage}
                        color={getLevelColor(level)}
                        size="sm"
                        showLabel={false}
                        animated={true}
                    />
                </div>
            )}

            {/* Max Level Indicator */}
            {level >= 10 && (
                <div className="mt-4 text-center">
                    <span className={`${sizeClasses[size].points} ${colors.accent} font-medium`}>
                        🎉 Nível Máximo Atingido!
                    </span>
                </div>
            )}
        </div>
    );
}

function getLevelTitle(level) {
    const titles = {
        1: 'Iniciante',
        2: 'Aprendiz',
        3: 'Explorador',
        4: 'Estudante',
        5: 'Dedicado',
        6: 'Experiente',
        7: 'Avançado',
        8: 'Expert',
        9: 'Mestre',
        10: 'Lenda'
    };
    return titles[level] || 'Estudante';
}

function getLevelColor(level) {
    const colors = {
        1: 'gray',
        2: 'green',
        3: 'blue',
        4: 'purple',
        5: 'pink',
        6: 'yellow',
        7: 'orange',
        8: 'red',
        9: 'indigo',
        10: 'yellow'
    };
    return colors[level] || 'gray';
}