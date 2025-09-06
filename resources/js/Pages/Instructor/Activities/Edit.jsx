import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Edit({ auth, activity, courses }) {
    const { data, setData, put, processing, errors } = useForm({
        course_id: activity.course_id || '',
        title: activity.title || '',
        description: activity.description || '',
        type: activity.type || 'video',
        points_value: activity.points_value || 10,
        duration_minutes: activity.duration_minutes || 30,
        is_required: activity.is_required || false,
        is_active: activity.is_active || true,
        content: activity.content || {},
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('instructor.activities.update', activity.id));
    };

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.')) {
            router.delete(route('instructor.activities.destroy', activity.id));
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            video: '🎥',
            quiz: '❓',
            reading: '📖',
            assignment: '📝',
            project: '🚀'
        };
        return icons[type] || '📋';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            ✏️ Editar Atividade
                        </h1>
                        <p className="text-gray-600 mt-1">Modifique os detalhes da atividade: {activity.title}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Editar: ${activity.title}`} />

            <div className="py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
                        
                        {/* Header */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-8 py-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                <span className="mr-3">🎯</span>
                                Editar Atividade
                            </h2>
                            <p className="text-gray-600 mt-2">Atualize as informações da atividade</p>
                        </div>

                        <form onSubmit={submit} className="p-8 space-y-8">
                            
                            {/* Course Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-2">
                                        📚 Curso *
                                    </label>
                                    <select
                                        id="course_id"
                                        name="course_id"
                                        value={data.course_id}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                        onChange={(e) => setData('course_id', e.target.value)}
                                    >
                                        <option value="">Selecione um curso</option>
                                        {courses?.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.course_id && (
                                        <div className="text-red-600 text-sm mt-1">{errors.course_id}</div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                        🎯 Tipo de Atividade *
                                    </label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={data.type}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                        onChange={(e) => setData('type', e.target.value)}
                                    >
                                        <option value="video">🎥 Vídeo</option>
                                        <option value="quiz">❓ Quiz</option>
                                        <option value="reading">📖 Leitura</option>
                                        <option value="assignment">📝 Tarefa</option>
                                        <option value="project">🚀 Projeto</option>
                                    </select>
                                    {errors.type && (
                                        <div className="text-red-600 text-sm mt-1">{errors.type}</div>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    {getTypeIcon(data.type)} Título da Atividade *
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={data.title}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Digite um título atrativo para a atividade"
                                />
                                {errors.title && (
                                    <div className="text-red-600 text-sm mt-1">{errors.title}</div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    📝 Descrição
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={data.description}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Descreva o que os alunos vão aprender nesta atividade"
                                />
                                {errors.description && (
                                    <div className="text-red-600 text-sm mt-1">{errors.description}</div>
                                )}
                            </div>

                            {/* Points and Duration */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="points_value" className="block text-sm font-medium text-gray-700 mb-2">
                                        ⭐ Pontos da Atividade *
                                    </label>
                                    <input
                                        id="points_value"
                                        type="number"
                                        name="points_value"
                                        min="0"
                                        max="1000"
                                        value={data.points_value}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                        onChange={(e) => setData('points_value', parseInt(e.target.value) || 0)}
                                        placeholder="10"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Pontos que o aluno ganha ao completar</p>
                                    {errors.points_value && (
                                        <div className="text-red-600 text-sm mt-1">{errors.points_value}</div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                                        ⏱️ Duração Estimada (minutos)
                                    </label>
                                    <input
                                        id="duration_minutes"
                                        type="number"
                                        name="duration_minutes"
                                        min="0"
                                        value={data.duration_minutes}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                        onChange={(e) => setData('duration_minutes', parseInt(e.target.value) || 0)}
                                        placeholder="30"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Tempo estimado para completar a atividade</p>
                                    {errors.duration_minutes && (
                                        <div className="text-red-600 text-sm mt-1">{errors.duration_minutes}</div>
                                    )}
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                                    <input
                                        id="is_required"
                                        name="is_required"
                                        type="checkbox"
                                        checked={data.is_required}
                                        onChange={(e) => setData('is_required', e.target.checked)}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_required" className="ml-3 block text-sm font-medium text-red-800">
                                        ⚠️ Atividade obrigatória
                                    </label>
                                </div>

                                <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                                    <input
                                        id="is_active"
                                        name="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-3 block text-sm font-medium text-green-800">
                                        ✅ Atividade ativa (visível para alunos)
                                    </label>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    🗑️ Excluir Atividade
                                </button>
                                
                                <div className="flex space-x-3">
                                    <a
                                        href={route('instructor.activities.show', activity.id)}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    >
                                        ← Cancelar
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">💾</span>
                                                Salvar Alterações
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Activity Stats */}
                    <div className="mt-8 bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <span className="mr-3">📊</span>
                                Estatísticas da Atividade
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                        {activity.user_activities_count || 0}
                                    </div>
                                    <div className="text-xs font-medium text-blue-700">Participações</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                        {activity.completion_rate || 0}%
                                    </div>
                                    <div className="text-xs font-medium text-green-700">Taxa de Conclusão</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                    <div className="text-2xl font-bold text-purple-600 mb-1">
                                        {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="text-xs font-medium text-purple-700">Data de Criação</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}