<?php

namespace App\Policies;

use App\Models\CourseMaterial;
use App\Models\Course;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CourseMaterialPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        return $user->role === 'instructor';
    }

    public function view(User $user, CourseMaterial $material)
    {
        $result = $user->id === $material->instructor_id;
        
        \Illuminate\Support\Facades\Log::info('CourseMaterialPolicy::view called', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'material_id' => $material->id,
            'material_instructor_id' => $material->instructor_id,
            'authorization_result' => $result
        ]);
        
        return $result;
    }

    public function create(User $user, Course $course = null)
    {
        if (!$course) {
            return $user->role === 'instructor';
        }
        
        return $user->role === 'instructor' && $user->id === $course->instructor_id;
    }

    public function update(User $user, CourseMaterial $material)
    {
        return $user->id === $material->instructor_id;
    }

    public function delete(User $user, CourseMaterial $material)
    {
        return $user->id === $material->instructor_id;
    }
}