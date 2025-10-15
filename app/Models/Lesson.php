<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'tenant_id',
        'title',
        'content',
        'content_type',
        'duration_minutes',
        'order',
        'is_published'
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
