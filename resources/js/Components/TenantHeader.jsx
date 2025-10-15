import React from 'react';
import { usePage } from '@inertiajs/react';

export default function TenantHeader({ title, subtitle }) {
    const { tenant } = usePage().props;
    
    if (!tenant) return null;

    const getStatusBadge = () => {
        if (tenant.status.is_trial_active) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Período Trial
                </span>
            );
        }
        
        if (tenant.status.is_active) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Ativo
                </span>
            );
        }
        
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Suspenso
            </span>
        );
    };

    return (
        <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 
                                    className="text-2xl font-bold leading-7 sm:text-3xl sm:truncate"
                                    style={{ color: tenant.primary_color }}
                                >
                                    {tenant.name}
                                </h1>
                                {getStatusBadge()}
                            </div>
                            
                            {subtitle && (
                                <p className="text-sm text-gray-600 mb-2">
                                    {subtitle}
                                </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Plano: <strong className="text-gray-700 capitalize">{tenant.plan}</strong></span>
                                {tenant.industry && (
                                    <span>Setor: <strong className="text-gray-700">{tenant.industry}</strong></span>
                                )}
                                <span>URL: <strong className="text-gray-700">{tenant.slug}.saas-gamificacao.local</strong></span>
                            </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0">
                            <div className="flex items-center gap-2">
                                {/* Botão para configurações futuras */}
                                <button
                                    type="button"
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    style={{ 
                                        '--tw-ring-color': tenant.primary_color,
                                        focusRingColor: tenant.primary_color 
                                    }}
                                >
                                    ⚙️ Configurações
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {title && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}