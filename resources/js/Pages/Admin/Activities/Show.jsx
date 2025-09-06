import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ auth, activity }) {
    const handleDelete = () => {
        if (confirm(`Tem certeza que deseja excluir a atividade "${activity.title}"?`)) {
            router.delete(route('admin.activities.destroy', activity.id));
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            lesson: '📖',
            video: '🎥',
            quiz: '❓',
            assignment: '📝'
        };
        return icons[type] || '📋';
    };

    const getTypeName = (type) => {
        const names = {
            lesson: 'Lição',
            video: 'Vídeo',
            quiz: 'Quiz',
            assignment: 'Tarefa'
        };
        return names[type] || type;
    };

    const renderContent = () => {
        if (!activity.content) {
            return <p className="text-gray-500">Sem conteúdo definido</p>;
        }

        try {
            // Tentar fazer parse do JSON para quizzes
            if (activity.type === 'quiz') {
                const quizData = JSON.parse(activity.content);
                return (
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Perguntas do Quiz:</h4>
                        {quizData.questions?.map((question, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                <h5 className="font-medium mb-2">{index + 1}. {question.question}</h5>
                                <div className="space-y-1 text-sm">
                                    {question.options?.map((option, optIndex) => (
                                        <div key={optIndex} className={`px-2 py-1 rounded ${
                                            optIndex === question.correct ? 'bg-green-100 text-green-800' : 'bg-white'
                                        }`}>
                                            {String.fromCharCode(65 + optIndex)}) {option}
                                            {optIndex === question.correct && ' ✓'}
                                        </div>
                                    ))}
                                </div>
                                {question.points && (
                                    <div className="mt-2 text-xs text-blue-600">
                                        Pontos: {question.points}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );
            }
        } catch (e) {
            // Se não for JSON válido, mostrar como texto
        }

        // Para outros tipos de atividade ou JSON inválido
        return (
            <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {activity.content}
                </pre>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {getTypeIcon(activity.type)} Atividade: {activity.title}
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route('admin.activities.index')}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            ← Voltar
                        </Link>
                        <Link
                            href={route('admin.activities.edit', activity.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            ✏️ Editar
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Atividade: ${activity.title}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Activity Header */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="flex items-start space-x-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                                    {getTypeIcon(activity.type)}
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {activity.title}
                                    </h1>
                                    <p className="text-gray-600 mb-4">
                                        {activity.description}
                                    </p>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                                            <div className="text-lg font-bold text-blue-600">
                                                {getTypeIcon(activity.type)}
                                            </div>
                                            <div className="text-sm text-blue-800">
                                                {getTypeName(activity.type)}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                                            <div className="text-lg font-bold text-purple-600">
                                                ⭐ {activity.points_value || 0}
                                            </div>
                                            <div className="text-sm text-purple-800">
                                                Pontos
                                            </div>
                                        </div>
                                        
                                        <div className="bg-green-50 p-3 rounded-lg text-center">
                                            <div className="text-lg font-bold text-green-600">
                                                #{activity.order || 0}
                                            </div>
                                            <div className="text-sm text-green-800">
                                                Ordem
                                            </div>
                                        </div>
                                        
                                        <div className="bg-yellow-50 p-3 rounded-lg text-center">
                                            <div className="text-lg font-bold text-yellow-600">
                                                {activity.duration_minutes || 0}m
                                            </div>
                                            <div className="text-sm text-yellow-800">
                                                Duração
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Information */}
                    {activity.course && (
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Curso</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{activity.course.title}</h4>
                                        <p className="text-sm text-gray-600">{activity.course.description}</p>
                                    </div>
                                    <Link
                                        href={route('admin.courses.show', activity.course.id)}
                                        className="text-blue-600 hover:text-blue-900 text-sm"
                                    >
                                        Ver Curso →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Content */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Conteúdo da Atividade
                            </h3>
                            {renderContent()}
                        </div>
                    </div>

                    {/* Activity Settings */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded-full ${activity.is_required ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-sm">
                                        {activity.is_required ? 'Obrigatória' : 'Opcional'}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded-full ${activity.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-sm">
                                        {activity.is_active ? 'Ativa' : 'Inativa'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technical Details */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes Técnicos</h3>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <dt className="font-medium text-gray-500">ID da Atividade</dt>
                                    <dd className="text-gray-900">{activity.id}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-gray-500">Tipo</dt>
                                    <dd className="text-gray-900">{activity.type}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-gray-500">Criado em</dt>
                                    <dd className="text-gray-900">
                                        {activity.created_at ? new Date(activity.created_at).toLocaleString('pt-BR') : 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-gray-500">Atualizado em</dt>
                                    <dd className="text-gray-900">
                                        {activity.updated_at ? new Date(activity.updated_at).toLocaleString('pt-BR') : 'N/A'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}