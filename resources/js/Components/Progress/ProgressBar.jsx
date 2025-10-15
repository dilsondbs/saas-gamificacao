import { motion } from 'framer-motion';

export default function ProgressBar({
    percentage = 0,
    color = 'indigo',
    size = 'md',
    showLabel = true,
    label = null,
    animated = true,
    className = ''
}) {
    const sizeClasses = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
        xl: 'h-6'
    };

    const colorClasses = {
        indigo: 'bg-indigo-600',
        green: 'bg-green-600',
        blue: 'bg-blue-600',
        purple: 'bg-purple-600',
        pink: 'bg-pink-600',
        yellow: 'bg-yellow-500',
        red: 'bg-red-600',
        orange: 'bg-orange-500',
    };

    const safePercentage = Math.min(Math.max(percentage, 0), 100);

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                        {label || 'Progresso'}
                    </span>
                    <span className="text-sm text-gray-500">
                        {Math.round(safePercentage)}%
                    </span>
                </div>
            )}

            <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
                {animated ? (
                    <motion.div
                        className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${safePercentage}%` }}
                        transition={{
                            duration: 1.2,
                            ease: "easeOut",
                            delay: 0.2
                        }}
                    />
                ) : (
                    <div
                        className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500`}
                        style={{ width: `${safePercentage}%` }}
                    />
                )}
            </div>
        </div>
    );
}