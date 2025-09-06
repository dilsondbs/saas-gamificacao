import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth, courses, preselected_course }) {
    const { data, setData, post, processing, errors } = useForm({
        course_id: preselected_course || '',
        title: '',
        description: '',
        type: 'video',
        points_value: 10,
        duration_minutes: 30,
        is_required: false,
        is_active: true,
        content: {},
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('instructor.activities.store'));
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
                            ✨ Criar Nova Atividade
                        </h1>
                        <p className="text-gray-600 mt-1">Desenvolva conteúdo engajante para seus alunos</p>
                    </div>
                </div>
            }
        >
            <Head title="Criar Atividade" />

            <div className="py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
                        
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                <span className="mr-3">🎯</span>
                                Informações da Atividade
                            </h2>
                            <p className="text-gray-600 mt-2">Preencha os detalhes da sua nova atividade</p>
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
                                <a
                                    href={route('instructor.activities.index')}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    ← Cancelar
                                </a>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Criando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="mr-2">✨</span>
                                            Criar Atividade
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Help Section */}
                    <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                            <span className="mr-2">💡</span>
                            Dicas para criar atividades engajantes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                            <div className="space-y-2">
                                <div className="flex items-start">
                                    <span className="mr-2 text-blue-500">•</span>
                                    <span>Use títulos claros e descritivos</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="mr-2 text-blue-500">•</span>
                                    <span>Defina objetivos de aprendizagem específicos</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="mr-2 text-blue-500">•</span>
                                    <span>Varie os tipos de atividades para manter o interesse</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-start">
                                    <span className="mr-2 text-blue-500">•</span>
                                    <span>Use pontuação adequada para motivar os alunos</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="mr-2 text-blue-500">•</span>
                                    <span>Estime o tempo de forma realista</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="mr-2 text-blue-500">•</span>
                                    <span>Marque como obrigatória apenas atividades essenciais</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}