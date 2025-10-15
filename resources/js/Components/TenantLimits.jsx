import React from 'react';
import { usePage } from '@inertiajs/react';

export default function TenantLimits({ showTitle = true, compact = false }) {
    const { tenant } = usePage().props;
    
    if (!tenant) return null;

    const { limits } = tenant;
    
    const ProgressBar = ({ current, max, percentage, color = 'bg-blue-500' }) => {
        const getBarColor = () => {
            if (percentage >= 90) return 'bg-red-500';
            if (percentage >= 75) return 'bg-yellow-500';
            return color;
        };

        return (
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className={`h-2 rounded-full transition-all ${getBarColor()}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
        );
    };

    const LimitCard = ({ icon, label, current, max, percentage, type }) => (
        <div className={`${compact ? 'p-3' : 'p-4'} bg-white rounded-lg border shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className={`font-medium ${compact ? 'text-sm' : 'text-base'}`}>
                        {label}
                    </span>
                </div>
                <span className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                    {type === 'storage' ? `${current}MB / ${max}MB` : `${current} / ${max}`}
                </span>
            </div>
            <ProgressBar current={current} max={max} percentage={percentage} />
            <div className={`mt-1 text-right ${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
                {percentage}% utilizado
            </div>
        </div>
    );

    return (
        <div className={compact ? 'space-y-3' : 'space-y-4'}>
            {showTitle && (
                <h3 className={`font-semibold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
                    Limites do Plano {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                </h3>
            )}
            
            <div className={`grid ${compact ? 'gap-3' : 'gap-4'} md:grid-cols-3`}>
                <LimitCard
                    icon="👥"
                    label="Usuários"
                    current={limits.users.current}
                    max={limits.users.max}
                    percentage={limits.users.percentage}
                    type="users"
                />
                
                <LimitCard
                    icon="📚"
                    label="Cursos"
                    current={limits.courses.current}
                    max={limits.courses.max}
                    percentage={limits.courses.percentage}
                    type="courses"
                />
                
                <LimitCard
                    icon="💾"
                    label="Armazenamento"
                    current={limits.storage.current_mb}
                    max={limits.storage.max_mb}
                    percentage={limits.storage.percentage}
                    type="storage"
                />
            </div>
        </div>
    );
}