<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Central Domains Configuration
    |--------------------------------------------------------------------------
    |
    | These domains are considered "central" and will have access to the
    | central management system. All other domains will be treated as tenant
    | domains and will be restricted from accessing central resources.
    |
    */
    'central_domains' => [
        '127.0.0.1',
        'localhost',
        'saas-gamificacao.local',
        env('CENTRAL_DOMAIN', '127.0.0.1'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Tenant Domain Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for tenant domain handling and validation.
    |
    */
    'tenant_domain_pattern' => env('TENANT_DOMAIN_PATTERN', '{tenant}.saas-gamificacao.local'),

    /*
    |--------------------------------------------------------------------------
    | Database Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for tenant database handling.
    |
    */
    'database' => [
        'tenant_column' => 'tenant_id',
        'auto_filter' => true,
    ],
];