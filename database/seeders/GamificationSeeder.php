<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Activity;
use App\Models\Badge;
use App\Models\CourseEnrollment;
use App\Models\Point;
use App\Models\UserBadge;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GamificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@saas-gamificacao.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'admin',
            'total_points' => 0,
        ]);

        // Create Instructor Users
        $instructor1 = User::create([
            'name' => 'Professor João Silva',
            'email' => 'joao@saas-gamificacao.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'instructor',
            'total_points' => 0,
        ]);

        $instructor2 = User::create([
            'name' => 'Professora Maria Santos',
            'email' => 'maria@saas-gamificacao.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'instructor',
            'total_points' => 0,
        ]);

        // Create Student Users
        $students = [];
        for ($i = 1; $i <= 10; $i++) {
            $students[] = User::create([
                'name' => "Aluno $i",
                'email' => "aluno$i@saas-gamificacao.com",
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'role' => 'student',
                'total_points' => rand(50, 500),
            ]);
        }

        // Create Courses
        $course1 = Course::create([
            'title' => 'Introdução ao Laravel',
            'description' => 'Aprenda os conceitos básicos do framework Laravel',
            'status' => 'published',
            'points_per_completion' => 200,
            'instructor_id' => $instructor1->id,
        ]);

        $course2 = Course::create([
            'title' => 'React para Iniciantes',
            'description' => 'Domine os fundamentos da biblioteca React',
            'status' => 'published',
            'points_per_completion' => 150,
            'instructor_id' => $instructor2->id,
        ]);

        $course3 = Course::create([
            'title' => 'JavaScript Avançado',
            'description' => 'Conceitos avançados de JavaScript moderno',
            'status' => 'published',
            'points_per_completion' => 250,
            'instructor_id' => $instructor1->id,
        ]);

        // Create Activities for Course 1
        $activities1 = [
            ['title' => 'Instalação do Laravel', 'type' => 'lesson', 'points_value' => 10],
            ['title' => 'Primeira Rota', 'type' => 'lesson', 'points_value' => 15],
            ['title' => 'Quiz: Rotas Laravel', 'type' => 'quiz', 'points_value' => 20],
            ['title' => 'Criando Controllers', 'type' => 'lesson', 'points_value' => 15],
            ['title' => 'Trabalho Final', 'type' => 'assignment', 'points_value' => 50],
        ];

        foreach ($activities1 as $index => $activityData) {
            Activity::create([
                'course_id' => $course1->id,
                'title' => $activityData['title'],
                'description' => "Descrição da atividade: {$activityData['title']}",
                'type' => $activityData['type'],
                'points_value' => $activityData['points_value'],
                'order' => $index + 1,
                'is_required' => true,
            ]);
        }

        // Create Activities for Course 2
        $activities2 = [
            ['title' => 'O que é React?', 'type' => 'video', 'points_value' => 10],
            ['title' => 'Componentes Funcionais', 'type' => 'lesson', 'points_value' => 15],
            ['title' => 'Quiz: Hooks React', 'type' => 'quiz', 'points_value' => 25],
            ['title' => 'Projeto Prático', 'type' => 'assignment', 'points_value' => 40],
        ];

        foreach ($activities2 as $index => $activityData) {
            Activity::create([
                'course_id' => $course2->id,
                'title' => $activityData['title'],
                'description' => "Descrição da atividade: {$activityData['title']}",
                'type' => $activityData['type'],
                'points_value' => $activityData['points_value'],
                'order' => $index + 1,
                'is_required' => true,
            ]);
        }

        // Create Badges
        $badges = [
            [
                'name' => 'Primeiro Passo',
                'description' => 'Complete sua primeira atividade',
                'type' => 'completion',
                'criteria' => ['activities_completed' => 1],
                'points_value' => 10,
                'color' => '#10B981',
            ],
            [
                'name' => 'Estudante Dedicado',
                'description' => 'Complete 5 atividades',
                'type' => 'completion',
                'criteria' => ['activities_completed' => 5],
                'points_value' => 25,
                'color' => '#3B82F6',
            ],
            [
                'name' => 'Colecionador de Pontos',
                'description' => 'Acumule 100 pontos',
                'type' => 'points',
                'criteria' => ['total_points' => 100],
                'points_value' => 20,
                'color' => '#F59E0B',
            ],
            [
                'name' => 'Mestre dos Cursos',
                'description' => 'Complete um curso inteiro',
                'type' => 'completion',
                'criteria' => ['courses_completed' => 1],
                'points_value' => 50,
                'color' => '#8B5CF6',
            ],
        ];

        foreach ($badges as $badgeData) {
            Badge::create($badgeData);
        }

        // Create Course Enrollments and some completions
        foreach ($students as $student) {
            // Enroll in course 1
            CourseEnrollment::create([
                'user_id' => $student->id,
                'course_id' => $course1->id,
                'enrolled_at' => now()->subDays(rand(1, 30)),
                'progress_percentage' => rand(10, 100),
                'completed_at' => rand(0, 1) ? now()->subDays(rand(1, 15)) : null,
            ]);

            // Some students also enroll in course 2
            if (rand(0, 1)) {
                CourseEnrollment::create([
                    'user_id' => $student->id,
                    'course_id' => $course2->id,
                    'enrolled_at' => now()->subDays(rand(1, 20)),
                    'progress_percentage' => rand(10, 80),
                    'completed_at' => rand(0, 1) ? now()->subDays(rand(1, 10)) : null,
                ]);
            }

            // Award some random points
            $pointsToAward = rand(3, 8);
            for ($i = 0; $i < $pointsToAward; $i++) {
                Point::create([
                    'user_id' => $student->id,
                    'points' => rand(5, 50),
                    'type' => 'earned',
                    'source_type' => 'App\Models\Activity',
                    'source_id' => rand(1, 9),
                    'description' => 'Pontos por completar atividade',
                ]);
            }

            // Award some badges randomly
            $badge = Badge::inRandomOrder()->first();
            if ($badge && rand(0, 1)) {
                UserBadge::create([
                    'user_id' => $student->id,
                    'badge_id' => $badge->id,
                    'earned_at' => now()->subDays(rand(1, 15)),
                ]);
            }
        }

        // Update total points for all users
        foreach ($students as $student) {
            $student->updateTotalPoints();
        }

        $this->command->info('Gamification seeder completed successfully!');
        $this->command->info('Admin: admin@saas-gamificacao.com / password');
        $this->command->info('Instructor: joao@saas-gamificacao.com / password');
        $this->command->info('Student: aluno1@saas-gamificacao.com / password (1-10)');
    }
}
