<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Activity;
use App\Models\User;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Buscar um instrutor (admin ou criar um genérico)
        $instructor = User::where('role', 'admin')->first() ?? User::first();

        $courses = [
            [
                'title' => 'Introdução ao Laravel 🚀',
                'description' => 'Aprenda os fundamentos do framework Laravel para desenvolver aplicações web robustas e escaláveis.',
                'image' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
                'status' => 'published',
                'points_per_completion' => 100,
                'instructor_id' => $instructor->id,
                'activities' => [
                    [
                        'title' => 'Quiz: Conceitos Básicos',
                        'description' => 'Teste seus conhecimentos sobre os conceitos fundamentais do Laravel',
                        'type' => 'quiz',
                        'points_value' => 25,
                        'order' => 1,
                        'is_required' => true,
                        'content' => [
                            'questions' => [
                                [
                                    'question' => 'Qual comando cria um novo projeto Laravel?',
                                    'options' => ['composer create-project laravel/laravel', 'npm install laravel', 'php artisan new', 'laravel new'],
                                    'correct' => 0,
                                    'explanation' => 'O Composer é o gerenciador de dependências do PHP e é usado para criar projetos Laravel com o comando "create-project".'
                                ],
                                [
                                    'question' => 'O que é o Artisan no Laravel?',
                                    'options' => ['Um ORM', 'Uma ferramenta de linha de comando', 'Um template engine', 'Um servidor web'],
                                    'correct' => 1,
                                    'explanation' => 'Artisan é a interface de linha de comando incluída no Laravel, fornecendo comandos úteis para desenvolvimento.'
                                ],
                                [
                                    'question' => 'Qual arquivo contém as configurações do banco de dados?',
                                    'options' => ['config/database.php', '.env', 'Ambos estão corretos', 'routes/web.php'],
                                    'correct' => 2,
                                    'explanation' => 'As configurações de banco ficam em config/database.php, mas as credenciais sensíveis ficam no arquivo .env por segurança.'
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            [
                'title' => 'React para Iniciantes ⚛️',
                'description' => 'Domine os conceitos essenciais do React e crie interfaces de usuário interativas e modernas.',
                'image' => 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop',
                'status' => 'published',
                'points_per_completion' => 150,
                'instructor_id' => $instructor->id,
                'activities' => [
                    [
                        'title' => 'Quiz: Fundamentos do React',
                        'description' => 'Teste seus conhecimentos sobre componentes, props e estado',
                        'type' => 'quiz',
                        'points_value' => 30,
                        'order' => 1,
                        'is_required' => true,
                        'content' => [
                            'questions' => [
                                [
                                    'question' => 'O que é JSX?',
                                    'options' => ['Uma extensão de JavaScript', 'Uma biblioteca CSS', 'Um framework', 'Um servidor'],
                                    'correct' => 0,
                                    'explanation' => 'JSX é uma extensão de sintaxe do JavaScript que permite escrever HTML dentro do código JavaScript de forma mais intuitiva.'
                                ],
                                [
                                    'question' => 'Como você cria um componente funcional?',
                                    'options' => ['class Component', 'function Component()', 'const Component = () => {}', 'Ambos B e C'],
                                    'correct' => 3,
                                    'explanation' => 'Componentes funcionais podem ser criados usando function declarations ou arrow functions. Ambas as formas são válidas no React.'
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            [
                'title' => 'Banco de Dados MySQL 💾',
                'description' => 'Aprenda a projetar, criar e gerenciar bancos de dados MySQL eficientes para suas aplicações.',
                'image' => 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=250&fit=crop',
                'status' => 'published',
                'points_per_completion' => 120,
                'instructor_id' => $instructor->id,
                'activities' => [
                    [
                        'title' => 'Quiz: SQL Básico',
                        'description' => 'Teste seus conhecimentos sobre comandos SQL fundamentais',
                        'type' => 'quiz',
                        'points_value' => 20,
                        'order' => 1,
                        'is_required' => true,
                        'content' => [
                            'questions' => [
                                [
                                    'question' => 'Qual comando é usado para selecionar dados?',
                                    'options' => ['GET', 'SELECT', 'FIND', 'SHOW'],
                                    'correct' => 1,
                                    'explanation' => 'SELECT é o comando SQL padrão para consultar e recuperar dados de uma ou mais tabelas no banco de dados.'
                                ],
                                [
                                    'question' => 'Como você cria uma nova tabela?',
                                    'options' => ['MAKE TABLE', 'CREATE TABLE', 'NEW TABLE', 'ADD TABLE'],
                                    'correct' => 1,
                                    'explanation' => 'CREATE TABLE é o comando SQL usado para criar uma nova tabela, definindo suas colunas e tipos de dados.'
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        foreach ($courses as $courseData) {
            $activities = $courseData['activities'];
            unset($courseData['activities']);
            
            $course = Course::create($courseData);
            
            // Criar atividades para o curso
            foreach ($activities as $activityData) {
                $activityData['course_id'] = $course->id;
                Activity::create($activityData);
            }
        }
    }
}
