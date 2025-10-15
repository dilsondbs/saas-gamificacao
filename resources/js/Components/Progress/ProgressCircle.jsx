import { motion } from 'framer-motion';

export default function ProgressCircle({
    percentage = 0,
    size = 120,
    strokeWidth = 8,
    color = '#6366f1',
    backgroundColor = '#e5e7eb',
    showPercentage = true,
    children = null,
    animated = true,
    className = ''
}) {
    const safePercentage = Math.min(Math.max(percentage, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* Progress circle */}
                {animated ? (
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{
                            duration: 1.5,
                            ease: "easeInOut",
                            delay: 0.3
                        }}
                    />
                ) : (
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-in-out"
                    />
                )}
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
                {children || (showPercentage && (
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                            {Math.round(safePercentage)}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}