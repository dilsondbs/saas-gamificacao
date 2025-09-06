<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    /**
     * CORREÇÃO: Define colunas físicas que existem na tabela
     * Isso impede que VirtualColumn as mova para JSON
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'slug', 
            'description',
            'plan',
            'max_users',
            'max_courses',
            'max_storage_mb',
            'is_active',
            'trial_ends_at',
            'subscription_ends_at',
            'created_at',
            'updated_at',
            'data'  // Campo JSON para outros atributos
        ];
    }

    protected $casts = [
        'is_active' => 'boolean',
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'max_users' => 'integer',
        'max_courses' => 'integer',
        'max_storage_mb' => 'integer',
        'data' => 'array',
    ];

    public function isTrialActive()
    {
        return $this->trial_ends_at && now()->isBefore($this->trial_ends_at);
    }

    public function isSubscriptionActive()
    {
        return $this->subscription_ends_at && now()->isBefore($this->subscription_ends_at);
    }

    public function canCreateUsers($count = 1)
    {
        if (!$this->is_active) return false;
        
        // In tenant context, count current users
        try {
            tenancy()->initialize($this);
            $currentUsers = \App\Models\User::count();
            tenancy()->end();
            return ($currentUsers + $count) <= $this->max_users;
        } catch (\Exception $e) {
            return true; // If tenant DB doesn't exist yet, allow creation
        }
    }

    public function canCreateCourses($count = 1)
    {
        if (!$this->is_active) return false;
        
        try {
            tenancy()->initialize($this);
            $currentCourses = \App\Models\Course::count();
            tenancy()->end();
            return ($currentCourses + $count) <= $this->max_courses;
        } catch (\Exception $e) {
            return true;
        }
    }

    public function getStorageUsedMb()
    {
        try {
            tenancy()->initialize($this);
            $storageUsed = \App\Models\CourseMaterial::sum('file_size');
            tenancy()->end();
            return round($storageUsed / 1024 / 1024, 2);
        } catch (\Exception $e) {
            return 0;
        }
    }
}