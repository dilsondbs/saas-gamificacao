<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class CoursePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any courses.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view courses
        return true;
    }

    /**
     * Determine whether the user can view the course.
     */
    public function view(User $user, Course $course): bool
    {
        // Admins can view all courses
        if ($user->role === 'admin') {
            return true;
        }

        // Instructors can view their own courses
        if ($user->role === 'instructor' && $course->instructor_id === $user->id) {
            return true;
        }

        // Students can view published courses they're enrolled in or all published courses
        if ($user->role === 'student') {
            if ($course->status === 'published') {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine whether the user can create courses.
     */
    public function create(User $user): bool
    {
        // Only instructors and admins can create courses
        return in_array($user->role, ['instructor', 'admin']);
    }

    /**
     * Determine whether the user can update the course.
     */
    public function update(User $user, Course $course): bool
    {
        // Admins can update all courses
        if ($user->role === 'admin') {
            return true;
        }

        // Instructors can only update their own courses
        if ($user->role === 'instructor' && $course->instructor_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the course.
     */
    public function delete(User $user, Course $course): bool
    {
        // Admins can delete all courses
        if ($user->role === 'admin') {
            return true;
        }

        // Instructors can only delete their own courses if they have no enrollments
        if ($user->role === 'instructor' && $course->instructor_id === $user->id) {
            // Prevent deletion if course has active enrollments
            if ($course->enrollments()->count() > 0) {
                return false;
            }
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the course.
     */
    public function restore(User $user, Course $course): bool
    {
        // Only admins can restore courses
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the course.
     */
    public function forceDelete(User $user, Course $course): bool
    {
        // Only admins can force delete courses
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can publish the course.
     */
    public function publish(User $user, Course $course): bool
    {
        // Must be able to update the course
        if (!$this->update($user, $course)) {
            return false;
        }

        // Course must have at least one activity to be published
        if ($course->activities()->count() === 0) {
            return false;
        }

        // Course must be in draft status
        if ($course->status !== 'draft') {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can archive the course.
     */
    public function archive(User $user, Course $course): bool
    {
        // Must be able to update the course
        if (!$this->update($user, $course)) {
            return false;
        }

        // Course must be published to be archived
        if ($course->status !== 'published') {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can duplicate the course.
     */
    public function duplicate(User $user, Course $course): bool
    {
        // Must be able to view the course and create new courses
        return $this->view($user, $course) && $this->create($user);
    }

    /**
     * Determine whether the user can upload material to the course.
     */
    public function uploadMaterial(User $user, Course $course): bool
    {
        // Must be able to update the course
        return $this->update($user, $course);
    }

    /**
     * Determine whether the user can generate AI content for the course.
     */
    public function generateAI(User $user, Course $course = null): bool
    {
        // Only instructors and admins can use AI generation
        return in_array($user->role, ['instructor', 'admin']);
    }

    /**
     * Determine whether the user can enroll in the course.
     */
    public function enroll(User $user, Course $course): bool
    {
        // Only students can enroll
        if ($user->role !== 'student') {
            return false;
        }

        // Course must be published
        if ($course->status !== 'published') {
            return false;
        }

        // User must not already be enrolled
        $existingEnrollment = $course->enrollments()
            ->where('user_id', $user->id)
            ->first();

        if ($existingEnrollment) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can view course analytics.
     */
    public function viewAnalytics(User $user, Course $course): bool
    {
        // Admins can view all course analytics
        if ($user->role === 'admin') {
            return true;
        }

        // Instructors can view analytics for their own courses
        if ($user->role === 'instructor' && $course->instructor_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can manage course enrollments.
     */
    public function manageEnrollments(User $user, Course $course): bool
    {
        // Admins can manage all course enrollments
        if ($user->role === 'admin') {
            return true;
        }

        // Instructors can manage enrollments for their own courses
        if ($user->role === 'instructor' && $course->instructor_id === $user->id) {
            return true;
        }

        return false;
    }
}