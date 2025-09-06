<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class CourseMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'instructor_id', 
        'title',
        'original_name',
        'file_path',
        'file_type',
        'file_size',
        'mime_type',
        'file_metadata',
        'suggested_structure',
        'is_processed',
        'is_active'
    ];

    protected $casts = [
        'file_metadata' => 'array',
        'suggested_structure' => 'array',
        'is_processed' => 'boolean',
        'is_active' => 'boolean'
    ];

    // Accessor para nome do arquivo apenas
    public function getFilenameAttribute()
    {
        return $this->file_path ? basename($this->file_path) : null;
    }

    // Relacionamentos
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }
}
