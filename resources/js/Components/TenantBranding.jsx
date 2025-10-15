import React from 'react';
import { usePage } from '@inertiajs/react';

export default function TenantBranding({ children, className = '' }) {
    const { tenant } = usePage().props;
    
    if (!tenant) return children;

    // Apply dynamic styling based on tenant's primary color
    const style = {
        '--tenant-primary': tenant.primary_color,
        '--tenant-primary-50': tenant.primary_color + '0D',
        '--tenant-primary-100': tenant.primary_color + '1A',
        '--tenant-primary-500': tenant.primary_color,
        '--tenant-primary-600': tenant.primary_color + 'E6',
        '--tenant-primary-700': tenant.primary_color + 'CC',
    };

    return (
        <div className={`tenant-branded ${className}`} style={style}>
            {children}
        </div>
    );
}