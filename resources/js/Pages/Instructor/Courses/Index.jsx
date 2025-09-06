import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index(props) {
    // Debug: Log what props we receive
    console.log('Instructor Courses Props:', props);
    
    // Safe extraction with defaults
    const auth = props.auth || {};
    const user = auth.user || {};
    const courses = props.courses || [];
    const stats = props.stats || {};
    
    console.log('Courses Data:', { courses, stats });

    const getStatusBadge = (isActive) => {
        return isActive 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
            : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
    };

    const getStatusText = (isActive) => {
        return isActive ? '✅ Publicado' : '📝 Rascunho';
    };

    const getStatusIcon = (isActive) => {
        return isActive ? '🟢' : '🟡';
    };

    const CourseCard = ({ course }) => (
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Header with gradient */}
            <div className="relative p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-gray-800 transition-colors duration-300">
                            {course?.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {course?.description || 'Sem descrição disponível'}
                        </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-md ${getStatusBadge(course?.is_active)}`}>
                            {getStatusText(course?.is_active)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            👥 {course?.enrollments_count || 0}
                        </div>
                        <div className="text-xs font-medium text-blue-700">Alunos</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            📋 {course?.activities_count || 0}
                        </div>
                        <div className="text-xs font-medium text-purple-700">Atividades</div>
                    </div>
                </div>

                {/* Category Badge */}
                {course?.category && (
                    <div className="mb-4">
                        <span className="inline-flex px-3 py-1 text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-full border border-gray-300">
                            🏷️ {course?.category}
                        </span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                    <Link
                        href={route('instructor.courses.show', course?.id)}
                        className="flex-1 text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        👁️ Visualizar
                    </Link>
                    <Link
                        href={route('instructor.courses.edit', course?.id)}
                        className="flex-1 text-center bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        ✏️ Editar
                    </Link>
                </div>
            </div>
        </div>
    );

    const StatCard = ({ icon, title, value, color, gradient }) => (
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <div className="relative p-6">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 p-4 rounded-xl bg-gradient-to-r ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-3xl">{icon}</span>
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <p className={`text-3xl font-bold ${color} group-hover:scale-105 transition-transform duration-300`}>
                            {value}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            📚 Meus Cursos
                        </h1>
                        <p className="text-gray-600 mt-1">Gerencie e monitore todos os seus cursos</p>
                    </div>
                    <Link
                        href="/instructor/courses/create"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        <span className="mr-2">✨</span>
                        Novo Curso
                    </Link>
                </div>
            }
        >
            <Head title="Meus Cursos" />

            <div className="py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            icon="📚"
                            title="Total de Cursos"
                            value={stats?.total || 0}
                            color="text-blue-600"
                            gradient="from-blue-500 to-blue-600"
                        />
                        <StatCard
                            icon="✅"
                            title="Cursos Publicados"
                            value={stats?.published || 0}
                            color="text-green-600"
                            gradient="from-green-500 to-green-600"
                        />
                        <StatCard
                            icon="📝"
                            title="Rascunhos"
                            value={stats?.draft || 0}
                            color="text-yellow-600"
                            gradient="from-yellow-500 to-yellow-600"
                        />
                    </div>

                    {/* Courses Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                        <span className="mr-3">🎯</span>
                                        Seus Cursos
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        {courses?.length || 0} curso(s) criado(s)
                                    </p>
                                </div>
                                {courses && courses.length > 0 && (
                                    <div className="flex items-center space-x-4 text-sm">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                            <span className="text-gray-600">{stats?.published || 0} Publicados</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                            <span className="text-gray-600">{stats?.draft || 0} Rascunhos</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-8">
                            {/* Courses Grid */}
                            {courses && courses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {courses.map((course) => (
                                        <CourseCard key={course?.id} course={course} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="max-w-md mx-auto">
                                        <div className="text-8xl mb-6">📚</div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                            Nenhum curso criado ainda
                                        </h3>
                                        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                            Que tal criar seu primeiro curso e começar a compartilhar conhecimento? 
                                            É fácil e rápido!
                                        </p>
                                        
                                        <div className="space-y-4">
                                            <Link
                                                href="/instructor/courses/create"
                                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                            >
                                                <span className="mr-3 text-xl">✨</span>
                                                Criar Meu Primeiro Curso
                                            </Link>
                                            
                                            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                                                <h4 className="font-semibold text-gray-800 mb-3">💡 Dicas para começar:</h4>
                                                <ul className="text-sm text-gray-600 space-y-2 text-left max-w-sm mx-auto">
                                                    <li className="flex items-start">
                                                        <span className="mr-2 text-blue-500">•</span>
                                                        Escolha um assunto que você domina
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="mr-2 text-blue-500">•</span>
                                                        Crie um título claro e atrativo
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="mr-2 text-blue-500">•</span>
                                                        Adicione uma descrição detalhada
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="mr-2 text-blue-500">•</span>
                                                        Comece como rascunho e publique quando estiver pronto
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}