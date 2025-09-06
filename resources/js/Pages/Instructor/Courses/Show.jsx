import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ auth, course }) {
    
    const generateCourseWithAI = () => {
        if (confirm('🤖 Deseja gerar automaticamente atividades e badges para este curso baseado nos materiais enviados?\n\nEsta ação pode levar alguns momentos...')) {
            // Pegar o primeiro material como base
            const material = course.materials[0];
            
            router.post(route('courses.generate', course.id), {
                material_id: material.id
            }, {
                onStart: () => {
                    // Pode adicionar loading state aqui
                },
                onSuccess: () => {
                    // Sucesso será mostrado via flash message
                },
                onError: (errors) => {
                    alert('Erro ao gerar curso: ' + Object.values(errors).join(', '));
                }
            });
        }
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        📚 {course.title}
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route('instructor.courses.materials.create', course.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            📁 Upload Material
                        </Link>
                        <Link
                            href={route('instructor.courses.edit', course.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            ✏️ Editar
                        </Link>
                        <Link
                            href={route('instructor.courses')}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            ← Voltar
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={course.title} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Course Info Card */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
                                    {course.description && (
                                        <p className="text-gray-600">{course.description}</p>
                                    )}
                                </div>
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                    course.status === 'published'
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {course.status === 'published' ? '✅ Publicado' : '📝 Rascunho'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-2xl text-blue-600 mb-2">👥</div>
                                    <div className="text-2xl font-bold text-blue-800">{course.enrollments?.length || 0}</div>
                                    <div className="text-sm text-blue-600">Alunos Matriculados</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="text-2xl text-purple-600 mb-2">📋</div>
                                    <div className="text-2xl font-bold text-purple-800">{course.activities?.length || 0}</div>
                                    <div className="text-sm text-purple-600">Atividades</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-2xl text-green-600 mb-2">📅</div>
                                    <div className="text-sm font-medium text-green-800">
                                        {new Date(course.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="text-sm text-green-600">Data de Criação</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activities Section */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium text-gray-900">Atividades do Curso</h2>
                                <Link
                                    href={route('instructor.courses.activities.create', course.id)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition"
                                >
                                    + Nova Atividade
                                </Link>
                            </div>

                            {course.activities && course.activities.length > 0 ? (
                                <div className="space-y-4">
                                    {course.activities.map((activity, index) => (
                                        <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                                                    {activity.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                                    )}
                                                    <div className="flex items-center mt-2 space-x-4">
                                                        <span className="text-sm text-gray-500">
                                                            Tipo: {activity.type}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            Pontos: {activity.points}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        href={route('instructor.activities.edit', activity.id)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition"
                                                        title="Editar atividade"
                                                    >
                                                        ✏️
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Tem certeza que deseja excluir esta atividade?')) {
                                                                window.location.href = route('instructor.activities.destroy', activity.id);
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                                                        title="Excluir atividade"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">📋</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade criada</h3>
                                    <p className="text-gray-500 mb-4">Adicione atividades para engajar seus alunos!</p>
                                    <Link
                                        href={route('instructor.courses.activities.create', course.id)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition"
                                    >
                                        + Criar Primeira Atividade
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Materials Section */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium text-gray-900">📁 Materiais do Curso</h2>
                                <div className="flex space-x-3">
                                    <Link
                                        href={route('instructor.courses.materials.create', course.id)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition"
                                    >
                                        + Novo Material
                                    </Link>
                                    
                                    {course.materials && course.materials.length > 0 && (
                                        <button
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition inline-flex items-center"
                                            onClick={() => generateCourseWithAI()}
                                            title="Gerar curso automaticamente com IA baseado nos materiais"
                                        >
                                            <span className="mr-2">🤖</span>
                                            Gerar com IA
                                        </button>
                                    )}
                                </div>
                            </div>

                            {course.materials && course.materials.length > 0 ? (
                                <div className="space-y-4">
                                    {course.materials.map((material, index) => (
                                        <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4 flex-1">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-2xl">
                                                                {material.file_type === 'pdf' ? '📄' : 
                                                                 material.file_type === 'doc' || material.file_type === 'docx' ? '📝' :
                                                                 material.file_type === 'ppt' || material.file_type === 'pptx' ? '📊' :
                                                                 material.file_type === 'jpg' || material.file_type === 'png' ? '🖼️' :
                                                                 '📁'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900">{material.title}</h3>
                                                        <p className="text-sm text-gray-600 mt-1">{material.original_name}</p>
                                                        <div className="flex items-center mt-2 space-x-4">
                                                            <span className="text-sm text-gray-500">
                                                                Tipo: {material.file_type?.toUpperCase() || 'N/A'}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                Tamanho: {material.file_size ? `${Math.round(material.file_size / 1024)} KB` : 'N/A'}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(material.created_at).toLocaleDateString('pt-BR')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <Link
                                                        href={route('instructor.materials.file', material.id)}
                                                        target="_blank"
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition"
                                                        title="Visualizar"
                                                    >
                                                        👁️
                                                    </Link>
                                                    <Link
                                                        href={route('instructor.materials.download', material.id)}
                                                        className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition"
                                                        title="Download"
                                                    >
                                                        💾
                                                    </Link>
                                                    <Link
                                                        href={route('instructor.materials.edit', material.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition"
                                                        title="Editar material"
                                                    >
                                                        ✏️
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Tem certeza que deseja excluir este material?')) {
                                                                router.delete(route('instructor.materials.destroy', material.id));
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                                                        title="Excluir material"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Status Badge */}
                                            <div className="mt-3 flex items-center space-x-2">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    material.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {material.is_active ? '✅ Ativo' : '⏸️ Inativo'}
                                                </span>
                                                {material.is_processed && (
                                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                        🤖 Processado por IA
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">📁</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum material adicionado</h3>
                                    <p className="text-gray-500 mb-4">Faça upload de materiais para enriquecer seu curso!</p>
                                    <Link
                                        href={route('instructor.courses.materials.create', course.id)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition"
                                    >
                                        + Adicionar Primeiro Material
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enrolled Students Section */}
                    {course.enrollments && course.enrollments.length > 0 && (
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Alunos Matriculados</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {course.enrollments.map((enrollment) => (
                                        <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                                        {enrollment.user?.name?.charAt(0) || '?'}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {enrollment.user?.name || 'Nome não disponível'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {enrollment.user?.email || 'Email não disponível'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <div className="text-xs text-gray-500">
                                                    Matriculado em: {new Date(enrollment.created_at).toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}