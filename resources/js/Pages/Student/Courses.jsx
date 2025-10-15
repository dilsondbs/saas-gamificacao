import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Courses({ auth, courses, enrolledCourseIds }) {
    const user = auth.user;
    const [enrolling, setEnrolling] = useState(null);

    const handleEnroll = (courseId) => {
        setEnrolling(courseId);

        // Try Ziggy route first, fallback to direct URL
        let enrollUrl;
        try {
            enrollUrl = route('student.enroll', courseId);
        } catch (error) {
            console.warn('Ziggy route not found, using direct URL:', error);
            enrollUrl = `/student/enroll/${courseId}`;
        }

        router.post(enrollUrl, {
            _token: document.querySelector('meta[name="csrf-token"]')?.content
        }, {
            preserveState: false,
            preserveScroll: true,
            onFinish: () => setEnrolling(null),
            onError: (errors) => {
                console.error('Enrollment error:', errors);
                alert('Erro na matrícula. Por favor, recarregue a página e tente novamente.');
            },
            onSuccess: () => {
                console.log('Enrollment successful!');
            }
        });
    };

    const isEnrolled = (courseId) => {
        return enrolledCourseIds.includes(courseId);
    };

    const CourseCard = ({ course }) => (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Course Image */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 relative overflow-hidden">
                {course.image ? (
                    <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-6xl opacity-20">📚</div>
                </div>
                
                {/* Enrollment Badge */}
                {isEnrolled(course.id) && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Matriculado
                    </div>
                )}
                
                {/* Points Badge */}
                <div className="absolute bottom-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                    🏆 {course.points_per_completion} pts
                </div>
            </div>

            {/* Course Content */}
            <div className="p-6">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
                </div>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                        <span className="mr-1">👥</span>
                        <span>{course.enrollments_count} alunos</span>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-1">📝</span>
                        <span>{course.activities?.length || 0} atividades</span>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-1">👨‍🏫</span>
                        <span>{course.instructor?.name || 'Instrutor'}</span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between">
                    {isEnrolled(course.id) ? (
                        <div className="flex w-full space-x-2">
                            <button
                                onClick={() => {
                                    console.log('Navigating to course ID:', course.id);
                                    router.get(`/student/courses/${course.id}`);
                                }}
                                className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors duration-200"
                            >
                                📖 Continuar Estudos
                            </button>
                            <button
                                onClick={() => {
                                    const firstActivity = course.activities?.[0];
                                    console.log('Course activities:', course.activities);
                                    console.log('First activity:', firstActivity);
                                    if (firstActivity && firstActivity.id) {
                                        console.log('Navigating to activity ID:', firstActivity.id);
                                        router.get(`/student/activities/${firstActivity.id}`);
                                    } else {
                                        console.error('No valid activity found');
                                        alert('Nenhuma atividade disponível neste curso.');
                                    }
                                }}
                                disabled={!course.activities || course.activities.length === 0}
                                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                🎯 Fazer Quiz
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrolling === course.id}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                                enrolling === course.id
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-105'
                            }`}
                        >
                            {enrolling === course.id ? (
                                <>
                                    <span className="inline-block animate-spin mr-2">⏳</span>
                                    Matriculando...
                                </>
                            ) : (
                                <>
                                    <span className="mr-2">🚀</span>
                                    Matricular-se
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        📚 Cursos Disponíveis
                    </h2>
                    <div className="text-sm text-gray-600">
                        {courses.length} curso{courses.length !== 1 ? 's' : ''} disponível{courses.length !== 1 ? 'eis' : ''}
                    </div>
                </div>
            }
        >
            <Head title="Cursos Disponíveis" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg mb-8 overflow-hidden">
                        <div className="p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Explore Novos Conhecimentos! 🌟
                                    </h1>
                                    <p className="text-indigo-100 text-lg">
                                        Matricule-se em cursos, complete atividades e ganhe pontos para subir no ranking!
                                    </p>
                                </div>
                                <div className="hidden md:block text-6xl opacity-20">
                                    🎓
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enrolled Courses Count */}
                    {enrolledCourseIds.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <div className="text-blue-500 text-xl mr-3">📊</div>
                                <div>
                                    <h3 className="font-medium text-blue-900">
                                        Você está matriculado em {enrolledCourseIds.length} curso{enrolledCourseIds.length !== 1 ? 's' : ''}
                                    </h3>
                                    <p className="text-blue-700 text-sm">
                                        Continue seus estudos e complete as atividades para ganhar mais pontos!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Courses Grid */}
                    {courses && courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                Nenhum curso disponível
                            </h3>
                            <p className="text-gray-600">
                                Novos cursos serão adicionados em breve. Fique ligado!
                            </p>
                        </div>
                    )}

                    {/* CTA Section */}
                    <div className="mt-12 bg-gray-50 rounded-xl p-8 text-center">
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                🎯 Como Funciona a Gamificação?
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <div className="text-2xl mb-2">1️⃣</div>
                                    <h4 className="font-medium mb-1">Matricule-se</h4>
                                    <p className="text-gray-600">Escolha um curso e se inscreva gratuitamente</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <div className="text-2xl mb-2">2️⃣</div>
                                    <h4 className="font-medium mb-1">Complete Atividades</h4>
                                    <p className="text-gray-600">Faça quizzes e ganhe pontos por cada acerto</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <div className="text-2xl mb-2">3️⃣</div>
                                    <h4 className="font-medium mb-1">Suba no Ranking</h4>
                                    <p className="text-gray-600">Compita com outros alunos e ganhe badges</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}