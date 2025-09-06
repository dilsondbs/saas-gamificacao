import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth, courses = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        type: 'lesson',
        course_id: '',
        content: '',
        points_value: 10,
        order: 1,
        duration_minutes: 0,
        is_required: true,
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        
        post(route('admin.activities.store'), {
            onSuccess: () => reset(),
            transform: (data) => {
                const transformedData = {
                    ...data,
                    content: data.content && data.content.trim() !== '' ? data.content : null,
                    course_id: parseInt(data.course_id) || '',
                    points_value: parseInt(data.points_value) || 0,
                    order: parseInt(data.order) || 1,
                    duration_minutes: parseInt(data.duration_minutes) || 0
                };
                console.log('Activity form submitting:', transformedData);
                return transformedData;
            }
        });
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

    const handleTypeChange = (newType) => {
        setData(data => ({
            ...data,
            type: newType,
            points_value: newType === 'quiz' ? 20 : newType === 'assignment' ? 30 : 10
        }));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        📋 Criar Nova Atividade
                    </h2>
                    <Link
                        href={route('admin.activities.index')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        ← Voltar
                    </Link>
                </div>
            }
        >
            <Head title="Criar Atividade" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                
                                {/* Preview Card */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Preview da Atividade</h3>
                                    <div className="flex items-start space-x-4">
                                        <div className="text-3xl">
                                            {getTypeIcon(data.type)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-semibold text-gray-900">{data.title || 'Título da Atividade'}</h4>
                                            <p className="text-gray-600 mb-2">{data.description || 'Descrição da atividade'}</p>
                                            <div className="flex items-center space-x-4 text-sm">
                                                <span className="text-indigo-600 font-medium">⭐ {data.points_value} pontos</span>
                                                <span className="text-gray-500">#{data.order} na ordem</span>
                                                {data.duration_minutes > 0 && <span className="text-gray-500">⏱️ {data.duration_minutes} min</span>}
                                                {data.is_required && <span className="text-green-600">✅ Obrigatória</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Título da Atividade <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Ex: Introdução ao React"
                                            required
                                        />
                                        {errors.title && <div className="text-red-600 text-sm mt-1">{errors.title}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Atividade <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => handleTypeChange(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="lesson">📖 Lição</option>
                                            <option value="video">🎥 Vídeo</option>
                                            <option value="quiz">❓ Quiz</option>
                                            <option value="assignment">📝 Tarefa</option>
                                        </select>
                                        {errors.type && <div className="text-red-600 text-sm mt-1">{errors.type}</div>}
                                    </div>
                                </div>

                                {/* Course and Order */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Curso <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.course_id}
                                            onChange={(e) => setData('course_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Selecione um curso...</option>
                                            {courses.map((course) => (
                                                <option key={course.id} value={course.id}>
                                                    {course.title}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.course_id && <div className="text-red-600 text-sm mt-1">{errors.course_id}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ordem no Curso
                                        </label>
                                        <input
                                            type="number"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 1)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            min="1"
                                            placeholder="1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Ordem em que aparece no curso</p>
                                        {errors.order && <div className="text-red-600 text-sm mt-1">{errors.order}</div>}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descrição <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Descreva o que o aluno vai aprender nesta atividade..."
                                        required
                                    />
                                    {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Conteúdo da Atividade
                                    </label>
                                    <textarea
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        rows={8}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder={
                                            data.type === 'lesson' ? 'Conteúdo da lição em texto...' :
                                            data.type === 'video' ? 'URL do vídeo ou embed code...' :
                                            data.type === 'quiz' ? 'Perguntas e respostas do quiz (JSON)...' :
                                            'Instruções da tarefa...'
                                        }
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {data.type === 'lesson' && 'Conteúdo em texto, markdown ou HTML'}
                                        {data.type === 'video' && 'URL do YouTube, Vimeo ou código de embed'}
                                        {data.type === 'quiz' && 'Formato JSON com perguntas e alternativas'}
                                        {data.type === 'assignment' && 'Instruções detalhadas da tarefa'}
                                    </p>
                                    {errors.content && <div className="text-red-600 text-sm mt-1">{errors.content}</div>}
                                </div>

                                {/* Points and Duration */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pontos por Conclusão
                                        </label>
                                        <input
                                            type="number"
                                            value={data.points_value}
                                            onChange={(e) => setData('points_value', parseInt(e.target.value) || 0)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            min="0"
                                            placeholder="10"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Pontos que o aluno ganha ao completar</p>
                                        {errors.points_value && <div className="text-red-600 text-sm mt-1">{errors.points_value}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Duração Estimada (minutos)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.duration_minutes}
                                            onChange={(e) => setData('duration_minutes', parseInt(e.target.value) || 0)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            min="0"
                                            placeholder="15"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Tempo estimado para completar (opcional)</p>
                                        {errors.duration_minutes && <div className="text-red-600 text-sm mt-1">{errors.duration_minutes}</div>}
                                    </div>
                                </div>

                                {/* Settings */}
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_required"
                                            checked={data.is_required}
                                            onChange={(e) => setData('is_required', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_required" className="ml-2 block text-sm text-gray-900">
                                            Atividade obrigatória (deve ser completada para finalizar o curso)
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                            Atividade ativa (visível para os alunos)
                                        </label>
                                    </div>
                                </div>

                                {/* Type-specific helpers */}
                                {data.type === 'quiz' && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">Formato para Quiz (JSON):</h4>
                                        <pre className="text-xs text-blue-800 bg-blue-100 p-2 rounded overflow-x-auto">
{`{
  "questions": [
    {
      "question": "Qual é a capital do Brasil?",
      "options": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
      "correct": 2,
      "points": 5
    }
  ]
}`}
                                        </pre>
                                    </div>
                                )}

                                {data.type === 'video' && (
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-purple-900 mb-2">Formatos de vídeo aceitos:</h4>
                                        <ul className="text-xs text-purple-800 space-y-1">
                                            <li>• URL do YouTube: https://www.youtube.com/watch?v=...</li>
                                            <li>• URL do Vimeo: https://vimeo.com/...</li>
                                            <li>• Código embed completo: &lt;iframe src="..."&gt;&lt;/iframe&gt;</li>
                                        </ul>
                                    </div>
                                )}

                                {/* Submit Buttons */}
                                <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                                    <Link
                                        href={route('admin.activities.index')}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded transition"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
                                    >
                                        {processing ? '⏳ Criando...' : '✅ Criar Atividade'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}