<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\BelongsToTenant;
class Badge extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'color',
        'type',
        'criteria',
        'points_value',
        'is_active',
        'tenant_id',
    ];

    protected $casts = [
        'criteria' => 'array',
        'points_value' => 'integer',
        'is_active' => 'boolean',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_badges')
                    ->withPivot(['earned_at', 'metadata'])
                    ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function checkCriteria($user)
    {
        // This method will be used by a service to check if user meets badge criteria
        // Implementation depends on specific criteria structure
        return false;
    }
}
