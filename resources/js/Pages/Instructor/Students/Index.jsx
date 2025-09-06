import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index(props) {
    // Debug: Log what props we receive
    console.log('Instructor Students Props:', props);
    
    // Safe extraction with defaults
    const auth = props.auth || {};
    const user = auth.user || {};
    const students = props.students || [];
    const courses = props.courses || [];
    const stats = props.stats || {};
    const filters = props.filters || {};
    
    console.log('Students Data:', { students, courses, stats });
    
    const [search, setSearch] = useState(filters.search || '');
    const [course, setCourse] = useState(filters.course || '');

    const handleSearch = () => {
        router.get(route('instructor.students'), {
            search,
            course,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'from-green-400 to-green-600';
        if (progress >= 60) return 'from-blue-400 to-blue-600';
        if (progress >= 40) return 'from-yellow-400 to-yellow-600';
        return 'from-red-400 to-red-600';
    };

    const getProgressTextColor = (progress) => {
        if (progress >= 80) return 'text-green-600';
        if (progress >= 60) return 'text-blue-600';
        if (progress >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressLabel = (progress) => {
        if (progress >= 80) return 'Excelente';
        if (progress >= 60) return 'Bom';
        if (progress >= 40) return 'Regular';
        return 'Precisa melhorar';
    };

    const StudentCard = ({ student }) => (
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Student Header */}
            <div className="relative p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl font-bold text-white">
                            {student?.user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-gray-800 transition-colors duration-300">
                            {student?.user?.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">{student?.user?.email}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{student?.course?.title}</p>
                    </div>
                </div>
            </div>

            <div className="relative p-6">
                {/* Progress Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <span className="text-sm font-medium text-gray-700">Progresso do Curso</span>
                            <div className="flex items-center mt-1">
                                <span className={`text-lg font-bold ${getProgressTextColor(student?.progress)}`}>
                                    {Math.round(student?.progress || 0)}%
                                </span>
                                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                    student?.progress >= 80 ? 'bg-green-100 text-green-700' :
                                    student?.progress >= 60 ? 'bg-blue-100 text-blue-700' :
                                    student?.progress >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {getProgressLabel(student?.progress)}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                        <div 
                            className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(student?.progress)} shadow-sm transition-all duration-1000 ease-out`}
                            style={{ width: `${student?.progress || 0}%` }}
                        ></div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            ✅ {student?.completed_activities || 0}
                        </div>
                        <div className="text-xs font-medium text-green-700">Concluídas</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="text-2xl font-bold text-gray-600 mb-1">
                            📋 {student?.total_activities || 0}
                        </div>
                        <div className="text-xs font-medium text-gray-700">Total</div>
                    </div>
                </div>

                {/* Enrollment Date */}
                <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-700">Matriculado em:</span>
                        <span className="text-sm font-semibold text-blue-800">
                            {new Date(student?.enrolled_at).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            const email = student?.user?.email;
                            console.log('Email debug:', email, student?.user);
                            if (email) {
                                window.location.href = `mailto:${email}`;
                            } else {
                                alert('Email não disponível para este aluno');
                            }
                        }}
                        className="flex-1 text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        ✉️ Contato
                    </button>
                    <button
                        onClick={() => {
                            const progressDetails = `
🎓 Detalhes do Aluno: ${student?.user?.name}

📊 Progresso: ${Math.round(student?.progress || 0)}%
✅ Atividades concluídas: ${student?.completed_activities || 0}
📋 Total de atividades: ${student?.total_activities || 0}
📚 Curso: ${student?.course?.title}
📅 Matriculado em: ${new Date(student?.enrolled_at).toLocaleDateString('pt-BR')}
📧 Email: ${student?.user?.email}

Status: ${getProgressLabel(student?.progress)}
                            `.trim();
                            alert(progressDetails);
                        }}
                        className="flex-1 text-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        📊 Detalhes
                    </button>
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
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            👥 Meus Alunos
                        </h1>
                        <p className="text-gray-600 mt-1">Acompanhe o progresso e desempenho dos estudantes</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Total de alunos:</div>
                        <div className="text-2xl font-bold text-green-600">{students?.length || 0}</div>
                    </div>
                </div>
            }
        >
            <Head title="Meus Alunos" />

            <div className="py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            icon="👥"
                            title="Total de Alunos"
                            value={stats?.total_students || 0}
                            color="text-blue-600"
                            gradient="from-blue-500 to-blue-600"
                        />
                        <StatCard
                            icon="📊"
                            title="Progresso Médio"
                            value={`${Math.round(stats?.avg_progress || 0)}%`}
                            color="text-green-600"
                            gradient="from-green-500 to-green-600"
                        />
                        <StatCard
                            icon="🎓"
                            title="Cursos Concluídos"
                            value={stats?.completed_courses || 0}
                            color="text-purple-600"
                            gradient="from-purple-500 to-purple-600"
                        />
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <span className="mr-3">🔍</span>
                                Filtros e Busca
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">Encontre alunos específicos ou filtre por curso</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        🔍 Buscar por nome ou email
                                    </label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Digite o nome ou email..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        📚 Filtrar por curso
                                    </label>
                                    <select
                                        value={course}
                                        onChange={(e) => setCourse(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    >
                                        <option value="">Todos os cursos</option>
                                        {courses.map((c) => (
                                            <option key={c?.id} value={c?.id}>
                                                {c?.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="flex items-end space-x-2">
                                    <button
                                        onClick={handleSearch}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    >
                                        🔍 Buscar
                                    </button>
                                    <Link
                                        href={route('instructor.students')}
                                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    >
                                        🔄 Limpar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Students Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                        <span className="mr-3">🎓</span>
                                        Alunos Matriculados
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        {students?.length || 0} aluno(s) encontrado(s)
                                    </p>
                                </div>
                                {students && students.length > 0 && (
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Progresso médio</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {Math.round(stats?.avg_progress || 0)}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-8">
                            {/* Students Grid */}
                            {students && students.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {students.map((student) => (
                                        <StudentCard key={student?.id} student={student} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="max-w-md mx-auto">
                                        <div className="text-8xl mb-6">👥</div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                            {search || course ? 'Nenhum aluno encontrado' : 'Nenhum aluno matriculado'}
                                        </h3>
                                        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                            {search || course 
                                                ? 'Tente ajustar os filtros de busca para encontrar os alunos desejados.'
                                                : 'Os alunos que se matricularem em seus cursos aparecerão aqui!'
                                            }
                                        </p>
                                        
                                        <div className="space-y-4">
                                            {search || course ? (
                                                <Link
                                                    href={route('instructor.students')}
                                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                                >
                                                    <span className="mr-3">🔄</span>
                                                    Ver Todos os Alunos
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={route('instructor.courses')}
                                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                                >
                                                    <span className="mr-3">📚</span>
                                                    Ver Meus Cursos
                                                </Link>
                                            )}
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