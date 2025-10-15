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

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds for a tenant.
     * ATENÇÃO: Este seeder agora é OPCIONAL e usado apenas para desenvolvimento/testes
     * Em produção, apenas o usuário admin real é criado durante o registro
     *
     * @return void
     */
    public function run()
    {
        // AVISO: Este seeder cria dados de TESTE/DESENVOLVIMENTO
        \Log::warning('🧪 TenantSeeder executado - criando dados de TESTE');

        // Verificar se já existe usuário real (admin criado no registro)
        $realAdminExists = User::where('role', 'admin')->exists();
        if ($realAdminExists) {
            $this->command->warn('⚠️  AVISO: Já existe usuário admin real. Este seeder criará dados de TESTE adicionais.');
        }
        // Create TESTE Admin User for tenant (apenas se não existir admin real)
        if (!$realAdminExists) {
            $admin = User::create([
                'name' => '[TESTE] Admin Demo',
                'email' => 'admin-teste@' . tenant('id') . '.local',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'role' => 'admin',
                'total_points' => 0,
            ]);
        }

        // Create TESTE Instructor Users
        $instructor1 = User::create([
            'name' => '[TESTE] Professor João Silva',
            'email' => 'joao-teste@' . tenant('id') . '.local',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'instructor',
            'total_points' => 0,
        ]);

        $instructor2 = User::create([
            'name' => '[TESTE] Professora Maria Santos',
            'email' => 'maria-teste@' . tenant('id') . '.local',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'instructor',
            'total_points' => 0,
        ]);

        // Create TESTE Student Users
        for ($i = 1; $i <= 10; $i++) {
            User::create([
                'name' => "[TESTE] Aluno $i",
                'email' => "aluno$i-teste@" . tenant('id') . '.local',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'role' => 'student',
                'total_points' => rand(0, 500),
            ]);
        }

        // Create sample courses
        $course1 = Course::create([
            'title' => 'Matemática Básica',
            'description' => 'Curso introdutório de matemática com conceitos fundamentais.',
            'instructor_id' => $instructor1->id,
            'status' => 'published',
            'points_per_completion' => 100,
        ]);

        $course2 = Course::create([
            'title' => 'História do Brasil',
            'description' => 'Estudo completo da formação histórica do Brasil.',
            'instructor_id' => $instructor2->id,
            'status' => 'published',
            'points_per_completion' => 120,
        ]);

        // Create sample badges
        $badges = [
            [
                'name' => 'Primeiro Login',
                'description' => 'Você fez seu primeiro login no sistema!',
                'icon' => '🎯',
                'color' => '#10B981',
                'type' => 'special',
                'criteria' => ['action' => 'login', 'count' => 1],
                'points_value' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'Estudante Dedicado',
                'description' => 'Complete 5 atividades com sucesso.',
                'icon' => '📚',
                'color' => '#3B82F6',
                'type' => 'completion',
                'criteria' => ['activity_completion' => 5],
                'points_value' => 50,
                'is_active' => true,
            ],
            [
                'name' => 'Pioneiro',
                'description' => 'Um dos primeiros 10 usuários da plataforma.',
                'icon' => '🏆',
                'color' => '#F59E0B',
                'type' => 'special',
                'criteria' => ['user_rank' => 10],
                'points_value' => 100,
                'is_active' => true,
            ],
        ];

        foreach ($badges as $badgeData) {
            Badge::create($badgeData);
        }

        // Create sample activities
        $activities = [
            [
                'course_id' => $course1->id,
                'title' => 'Quiz: Operações Básicas',
                'description' => 'Teste seus conhecimentos sobre adição, subtração, multiplicação e divisão.',
                'type' => 'quiz',
                'points_value' => 20,
                'duration_minutes' => 15,
                'is_active' => true,
                'order' => 1,
                'content' => [
                    'questions' => [
                        ['question' => '2 + 2 = ?', 'options' => ['3', '4', '5'], 'correct' => 1],
                        ['question' => '10 - 7 = ?', 'options' => ['2', '3', '4'], 'correct' => 1],
                    ]
                ]
            ],
            [
                'course_id' => $course2->id,
                'title' => 'Leitura: Descobrimento do Brasil',
                'description' => 'Leia sobre o período de descobrimento e colonização do Brasil.',
                'type' => 'reading',
                'points_value' => 15,
                'duration_minutes' => 30,
                'is_active' => true,
                'order' => 1,
                'content' => [
                    'text' => 'O Brasil foi descoberto em 1500...',
                    'word_count' => 500
                ]
            ],
        ];

        foreach ($activities as $activityData) {
            Activity::create($activityData);
        }

        // Enroll some students in courses
        $students = User::where('role', 'student')->get();
        foreach ($students->take(5) as $student) {
            CourseEnrollment::create([
                'user_id' => $student->id,
                'course_id' => $course1->id,
                'enrolled_at' => now(),
            ]);
        }

        foreach ($students->skip(3)->take(5) as $student) {
            CourseEnrollment::create([
                'user_id' => $student->id,
                'course_id' => $course2->id,
                'enrolled_at' => now(),
            ]);
        }

        // Award some badges to students
        $firstBadge = Badge::where('name', 'Primeiro Login')->first();
        foreach ($students->take(3) as $student) {
            UserBadge::create([
                'user_id' => $student->id,
                'badge_id' => $firstBadge->id,
                'earned_at' => now(),
            ]);
        }

        // Add some points to students
        foreach ($students as $student) {
            Point::create([
                'user_id' => $student->id,
                'points' => rand(10, 50),
                'type' => 'earned',
                'source_type' => 'activity',
                'source_id' => 1,
                'description' => 'Participação ativa nas aulas',
            ]);
        }

        $this->command->info('Tenant seeded successfully with sample data!');
    }
}