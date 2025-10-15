import { Head } from '@inertiajs/react';
import { useState } from 'react';
import TenantBranding from '@/Components/TenantBranding';

export default function Course({ course, isEnrolled = false, relatedCourses = [], tenant = null }) {
    const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);

    const handleEnroll = () => {
        if (!course.id) return;
        
        // Create form and submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/matricular/${course.id}`;
        
        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken.getAttribute('content');
            form.appendChild(csrfInput);
        }
        
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <>
            <Head title={`${course.title} - Curso Online`} />
            <TenantBranding tenant={tenant} />
            
            <div className="min-h-screen bg-gray-50 tenant-branded">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center">
                                <a href="/" className="text-2xl font-bold text-gray-900 hover:text-primary">
                                    {tenant?.name || 'Plataforma de Cursos'}
                                </a>
                            </div>
                            <nav className="hidden md:flex space-x-8">
                                <a href="/" className="text-gray-900 hover:text-primary">Início</a>
                                <a href="/cursos" className="text-gray-900 hover:text-primary">Cursos</a>
                                <a href="/login" className="text-gray-900 hover:text-primary">Login</a>
                                <a href="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-600">
                                    Cadastrar
                                </a>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Breadcrumb */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <nav className="flex items-center space-x-2 text-sm text-gray-500">
                            <a href="/" className="hover:text-primary">Início</a>
                            <span>/</span>
                            <a href="/cursos" className="hover:text-primary">Cursos</a>
                            <span>/</span>
                            <span className="text-gray-900">{course.title}</span>
                        </nav>
                    </div>
                </div>

                {/* Course Header */}
                <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                                <p className="text-xl mb-6">{course.description}</p>
                                
                                <div className="flex items-center space-x-6 text-sm">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <span>Instrutor: {course.instructor?.name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                        </svg>
                                        <span>{course.enrollments_count} alunos matriculados</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <span>{course.activities_count} atividades</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Enrollment Card */}
                            <div className="lg:col-span-1">
                                <div className="bg-white text-gray-900 rounded-lg p-6 shadow-lg">
                                    <div className="text-center mb-6">
                                        <div className="text-3xl font-bold text-primary mb-2">GRATUITO</div>
                                        <p className="text-sm text-gray-600">Acesso completo ao curso</p>
                                    </div>
                                    
                                    {isEnrolled ? (
                                        <div className="text-center">
                                            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4">
                                                ✓ Você já está matriculado!
                                            </div>
                                            <a 
                                                href={`/student/courses/${course.id}`}
                                                className="block w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition"
                                            >
                                                Acessar Curso
                                            </a>
                                        </div>
                                    ) : (
                                        <div>
                                            <button 
                                                onClick={() => setShowEnrollConfirm(true)}
                                                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition mb-4"
                                            >
                                                Matricular-se Gratuitamente
                                            </button>
                                            <p className="text-xs text-gray-500 text-center">
                                                Clique para se matricular e começar a aprender agora mesmo!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Course Content */}
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2">
                                {/* Course Description */}
                                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                                    <h2 className="text-2xl font-bold mb-4">Sobre este curso</h2>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 leading-relaxed">{course.description}</p>
                                    </div>
                                </div>

                                {/* Course Content/Activities */}
                                {course.activities && course.activities.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                                        <h2 className="text-2xl font-bold mb-6">Conteúdo do Curso</h2>
                                        <div className="space-y-4">
                                            {course.activities.map((activity, index) => (
                                                <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                                                                {index + 1}
                                                            </span>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                                    <span className="capitalize">{activity.type}</span>
                                                                    {activity.duration_minutes && (
                                                                        <span>{activity.duration_minutes} min</span>
                                                                    )}
                                                                    {activity.points_value && (
                                                                        <span>{activity.points_value} pontos</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {!isEnrolled && (
                                                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Instructor Info */}
                                <div className="bg-white rounded-lg shadow-md p-8">
                                    <h2 className="text-2xl font-bold mb-6">Seu Instrutor</h2>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{course.instructor?.name}</h3>
                                            <p className="text-gray-600">{course.instructor?.email}</p>
                                            <p className="text-gray-700 mt-2">
                                                Instrutor especializado com experiência prática na área.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                {/* Related Courses */}
                                {relatedCourses.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <h3 className="text-lg font-bold mb-4">Cursos Relacionados</h3>
                                        <div className="space-y-4">
                                            {relatedCourses.map((relatedCourse) => (
                                                <div key={relatedCourse.id} className="border border-gray-200 rounded-lg p-4">
                                                    <h4 className="font-semibold text-sm text-gray-900 mb-2">{relatedCourse.title}</h4>
                                                    <p className="text-xs text-gray-600 mb-2">{relatedCourse.instructor?.name}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">{relatedCourse.enrollments_count} alunos</span>
                                                        <a 
                                                            href={`/curso/${relatedCourse.slug}`}
                                                            className="text-primary text-xs hover:underline"
                                                        >
                                                            Ver curso
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enrollment Confirmation Modal */}
                {showEnrollConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold mb-4">Confirmar Matrícula</h2>
                            <p className="text-gray-700 mb-6">
                                Você está prestes a se matricular no curso "{course.title}". 
                                Após a confirmação, você terá acesso completo ao conteúdo.
                            </p>
                            <div className="flex space-x-4">
                                <button 
                                    onClick={() => setShowEnrollConfirm(false)}
                                    className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleEnroll}
                                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-600"
                                >
                                    Confirmar Matrícula
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">{tenant?.name || 'Plataforma de Cursos'}</h3>
                                <p className="text-gray-400">
                                    Transformando vidas através da educação online de qualidade.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="/" className="hover:text-white transition">Início</a></li>
                                    <li><a href="/cursos" className="hover:text-white transition">Cursos</a></li>
                                    <li><a href="/login" className="hover:text-white transition">Login</a></li>
                                    <li><a href="/register" className="hover:text-white transition">Cadastrar</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Contato</h3>
                                <p className="text-gray-400">
                                    Email: contato@{tenant?.name?.toLowerCase() || 'plataforma'}.com
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>&copy; 2024 {tenant?.name || 'Plataforma de Cursos'}. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}