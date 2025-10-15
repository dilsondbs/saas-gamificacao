<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Activity;
use App\Models\UserActivity;
use App\Models\User;
use App\Models\Badge;
use App\Models\UserBadge;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentDashboardController extends Controller
{
    public function index(): Response
    {
        try {
            $student = auth()->user();

            if (!$student) {
                return redirect()->route('login');
            }

            // Get student's enrollments with courses
            $enrollments = CourseEnrollment::with(['course', 'course.activities'])
                ->where('user_id', $student->id)
                ->get();

            // Calculate progress for each course
            $coursesWithProgress = $enrollments->map(function ($enrollment) use ($student) {
                $course = $enrollment->course;
                $totalActivities = $course->activities->count();

                $completedActivities = UserActivity::whereHas('activity', function($query) use ($course) {
                    $query->where('course_id', $course->id);
                })->where('user_id', $student->id)->whereNotNull('completed_at')->count();

                $progress = $totalActivities > 0 ? round(($completedActivities / $totalActivities) * 100, 1) : 0;

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'instructor_name' => $course->instructor->name ?? 'N/A',
                    'total_activities' => $totalActivities,
                    'completed_activities' => $completedActivities,
                    'progress' => $progress,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'points_earned' => $completedActivities * 10, // Simple calculation
                ];
            });

            // Get recent achievements
            $recentBadges = UserBadge::with('badge')
                ->where('user_id', $student->id)
                ->orderBy('earned_at', 'desc')
                ->take(3)
                ->get();

            // Calculate total stats
            $totalPoints = $coursesWithProgress->sum('points_earned');
            $totalCourses = $coursesWithProgress->count();
            $completedCourses = $coursesWithProgress->where('progress', 100)->count();

            return Inertia::render('Student/Dashboard', [
                'courses' => $coursesWithProgress,
                'recentBadges' => $recentBadges,
                'stats' => [
                    'total_points' => $totalPoints,
                    'total_courses' => $totalCourses,
                    'completed_courses' => $completedCourses,
                    'badges_count' => $recentBadges->count(),
                ],
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in student dashboard: ' . $e->getMessage());

            return Inertia::render('Student/Dashboard', [
                'courses' => [],
                'recentBadges' => [],
                'stats' => [
                    'total_points' => 0,
                    'total_courses' => 0,
                    'completed_courses' => 0,
                    'badges_count' => 0,
                ],
                'error' => 'Erro ao carregar dashboard'
            ]);
        }
    }

    public function courses(): Response
    {
        try {
            $student = auth()->user();

            // Auto-login para teste se não estiver logado
            if (!$student) {
                $student = User::where('email', 'aluno1@saas-gamificacao.com')->first();
                if ($student) {
                    auth()->login($student);
                } else {
                    return response()->json(['error' => 'Student not found'], 404);
                }
            }

            // Get enrolled courses
            $enrollments = CourseEnrollment::with(['course', 'course.instructor', 'course.activities'])
                ->where('user_id', $student->id)
                ->get();

            $coursesData = $enrollments->map(function ($enrollment) use ($student) {
                $course = $enrollment->course;
                $totalActivities = $course->activities->count();

                $completedActivities = UserActivity::whereHas('activity', function($query) use ($course) {
                    $query->where('course_id', $course->id);
                })->where('user_id', $student->id)->whereNotNull('completed_at')->count();

                $progress = $totalActivities > 0 ? round(($completedActivities / $totalActivities) * 100, 1) : 0;

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'instructor' => [
                        'name' => $course->instructor->name ?? 'N/A',
                        'email' => $course->instructor->email ?? '',
                    ],
                    'total_activities' => $totalActivities,
                    'completed_activities' => $completedActivities,
                    'progress' => $progress,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'status' => $course->status,
                ];
            });

            return Inertia::render('Student/Courses', [
                'courses' => $coursesData,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in student courses: ' . $e->getMessage());

            return Inertia::render('Student/Courses', [
                'courses' => [],
                'error' => 'Erro ao carregar cursos'
            ]);
        }
    }

    public function showCourse($courseId): Response
    {
        try {
            $student = auth()->user();

            // Auto-login para teste se não estiver logado
            if (!$student) {
                $student = User::where('email', 'aluno1@saas-gamificacao.com')->first();
                if ($student) {
                    auth()->login($student);
                } else {
                    return response()->json(['error' => 'Student not found'], 404);
                }
            }

            // Find course by ID
            $course = Course::findOrFail($courseId);

            // Check if student is enrolled
            $enrollment = CourseEnrollment::where('user_id', $student->id)
                ->where('course_id', $course->id)
                ->first();

            if (!$enrollment) {
                return redirect()->route('student.courses')
                    ->with('error', 'Você não está matriculado neste curso.');
            }

            // Load course with activities and student progress
            $course->load(['activities' => function($query) {
                $query->orderBy('order');
            }, 'instructor']);

            // Load quizzes for each lesson
            $lessons = $course->modules()->with('lessons.quiz')->get()->pluck('lessons')->flatten();

            // Get student's activity progress
            $activitiesWithProgress = $course->activities->map(function ($activity) use ($student) {
                $userActivity = UserActivity::where('user_id', $student->id)
                    ->where('activity_id', $activity->id)
                    ->first();

                return [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'description' => $activity->description,
                    'type' => $activity->type,
                    'points' => $activity->points,
                    'order' => $activity->order,
                    'completed' => $userActivity ? $userActivity->completed_at !== null : false,
                    'score' => $userActivity ? $userActivity->score : null,
                    'completed_at' => $userActivity ? $userActivity->completed_at : null,
                ];
            })
            ->concat($lessons->filter(fn($l) => $l->quiz)->map(function ($lesson) use ($student) {
                $userQuiz = \App\Models\QuizAttempt::where('user_id', $student->id)
                    ->where('quiz_id', $lesson->quiz->id)
                    ->latest()
                    ->first();

                return [
                    'id' => $lesson->quiz->id,
                    'title' => $lesson->quiz->title,
                    'description' => "Quiz sobre: {$lesson->title}",
                    'type' => 'quiz',
                    'points' => 10,
                    'order' => $lesson->order,
                    'lesson_id' => $lesson->id,
                    'completed' => $userQuiz && $userQuiz->passed,
                    'score' => $userQuiz->score ?? null,
                ];
            }));

            $completedCount = $activitiesWithProgress->where('completed', true)->count();
            $totalCount = $activitiesWithProgress->count();
            $progress = $totalCount > 0 ? round(($completedCount / $totalCount) * 100, 1) : 0;

            return Inertia::render('Student/Course/Show', [
                'course' => [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'instructor' => [
                        'name' => $course->instructor->name ?? 'N/A',
                        'email' => $course->instructor->email ?? '',
                    ],
                    'status' => $course->status,
                ],
                'activities' => $activitiesWithProgress,
                'progress' => [
                    'completed' => $completedCount,
                    'total' => $totalCount,
                    'percentage' => $progress,
                ],
                'enrollment' => [
                    'enrolled_at' => $enrollment->enrolled_at,
                ],
            ]);

        } catch (\Exception $e) {
            \Log::error('Error showing course to student: ' . $e->getMessage());

            return redirect()->route('student.courses')
                ->with('error', 'Erro ao carregar curso.');
        }
    }

    public function showActivity($activityId): Response
    {
        try {
            $student = auth()->user();

            if (!$student) {
                return redirect()->route('login');
            }

            // Find activity by ID
            $activity = Activity::findOrFail($activityId);

            // Check if student is enrolled in the course
            $enrollment = CourseEnrollment::where('user_id', $student->id)
                ->where('course_id', $activity->course_id)
                ->first();

            if (!$enrollment) {
                return redirect()->route('student.courses')
                    ->with('error', 'Você não está matriculado neste curso.');
            }

            // Load activity with course
            $activity->load('course');

            // Get student's progress on this activity
            $userActivity = UserActivity::where('user_id', $student->id)
                ->where('activity_id', $activity->id)
                ->first();

            // Tratamento especial para quizzes
            if ($activity->type === 'quiz') {
                $quizId = json_decode($activity->content)->quiz_id ?? null;

                if ($quizId) {
                    $quiz = \App\Models\Quiz::with('questions')->find($quizId);

                    if ($quiz) {
                        // Formatar questões no formato que Quiz.jsx espera
                        $formattedQuestions = $quiz->questions->map(function ($question) {
                            // Converter letra para índice (A=0, B=1, C=2, D=3)
                            $correctIndex = match(strtoupper($question->correct_answer)) {
                                'A' => 0,
                                'B' => 1,
                                'C' => 2,
                                'D' => 3,
                                default => 0,
                            };

                            return [
                                'id' => $question->id,
                                'question' => $question->question,
                                'options' => $question->options ?? [],  // Usar campo options do banco
                                'correct' => $correctIndex,  // Número (0-3) para Quiz.jsx
                                'correct_answer' => $question->correct_answer,  // Letra (compatibilidade)
                                'explanation' => $question->explanation ?? '',
                            ];
                        });

                        // Converter activity para array e substituir content
                        $activityData = $activity->toArray();
                        $activityData['content'] = [
                            'questions' => $formattedQuestions,
                        ];

                        // Renderizar componente especializado Quiz.jsx
                        return Inertia::render('Student/Quiz', [
                            'auth' => [
                                'user' => $student,
                            ],
                            'activity' => $activityData,  // ← Usar variável modificada
                            'course' => $activity->course,
                            'userActivity' => $userActivity,
                            'hasCompleted' => $userActivity && $userActivity->completed_at !== null,
                        ]);
                    }
                }
            }

            return Inertia::render('Student/Activity/Show', [
                'activity' => [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'description' => $activity->description,
                    'type' => $activity->type,
                    'points' => $activity->points,
                    'content' => $activity->content,
                    'course' => [
                        'id' => $activity->course->id,
                        'title' => $activity->course->title,
                    ],
                ],
                'userProgress' => $userActivity ? [
                    'completed' => $userActivity->completed_at !== null,
                    'score' => $userActivity->score,
                    'completed_at' => $userActivity->completed_at,
                ] : null,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error showing activity to student: ' . $e->getMessage());

            return redirect()->route('student.courses')
                ->with('error', 'Erro ao carregar atividade.');
        }
    }

    public function enrollCourse(Request $request, Course $course)
    {
        try {
            $student = auth()->user();

            if (!$student) {
                return redirect()->route('login');
            }

            // Check if already enrolled
            $existing = CourseEnrollment::where('user_id', $student->id)
                ->where('course_id', $course->id)
                ->first();

            if ($existing) {
                return redirect()->route('student.courses.show', $course)
                    ->with('info', 'Você já está matriculado neste curso.');
            }

            // Enroll student
            CourseEnrollment::create([
                'user_id' => $student->id,
                'course_id' => $course->id,
                'enrolled_at' => now(),
            ]);

            return redirect()->route('student.courses.show', $course)
                ->with('success', 'Matrícula realizada com sucesso!');

        } catch (\Exception $e) {
            \Log::error('Error enrolling student: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Erro ao realizar matrícula.');
        }
    }

    public function submitQuiz(Request $request, $activityId)
    {
        // Placeholder for quiz submission logic
        return redirect()->route('student.activities.show', $activityId)
            ->with('success', 'Quiz enviado com sucesso!');
    }

    public function badges(): Response
    {
        try {
            $student = auth()->user();

            if (!$student) {
                return redirect()->route('login');
            }

            $userBadges = UserBadge::with('badge')
                ->where('user_id', $student->id)
                ->orderBy('earned_at', 'desc')
                ->get();

            return Inertia::render('Student/Badges', [
                'badges' => $userBadges,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error loading student badges: ' . $e->getMessage());

            return Inertia::render('Student/Badges', [
                'badges' => [],
                'error' => 'Erro ao carregar badges'
            ]);
        }
    }

    public function leaderboard(): Response
    {
        try {
            // Get top students by points
            $topStudents = User::where('role', 'student')
                ->select('id', 'name', 'email')
                ->get()
                ->map(function ($student) {
                    $totalPoints = UserActivity::where('user_id', $student->id)
                        ->whereNotNull('completed_at')
                        ->sum('points_earned');

                    return [
                        'id' => $student->id,
                        'name' => $student->name,
                        'email' => $student->email,
                        'total_points' => $totalPoints ?? 0,
                    ];
                })
                ->sortByDesc('total_points')
                ->take(10)
                ->values();

            return Inertia::render('Student/Leaderboard', [
                'students' => $topStudents,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error loading leaderboard: ' . $e->getMessage());

            return Inertia::render('Student/Leaderboard', [
                'students' => [],
                'error' => 'Erro ao carregar ranking'
            ]);
        }
    }
}