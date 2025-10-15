import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { PhotoIcon, SparklesIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CourseCreate({ auth }) {
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [showAIForm, setShowAIForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        image: null,
        status: 'draft',
        points_per_completion: 100,
    });

    const { data: aiData, setData: setAIData, post: postAI, processing: processingAI, errors: aiErrors } = useForm({
        description: '',
        target_audience: '',
        difficulty: 'intermediate',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('courses.store'));
    };

    const handleAIGeneration = (e) => {
        e.preventDefault();
        setIsGeneratingAI(true);

        postAI(route('courses.generate-ai'), {
            onSuccess: (response) => {
                // AI generation successful, redirect to course
                setIsGeneratingAI(false);
            },
            onError: () => {
                setIsGeneratingAI(false);
            },
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center">
                    <Link
                        href={route('courses.index')}
                        className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Voltar
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Criar Novo Curso
                    </h2>
                </div>
            }
        >
            <Head title="Criar Curso" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Creation Method Choice */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Como você gostaria de criar seu curso?
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowAIForm(false)}
                                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                        !showAIForm
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <h4 className="font-medium text-gray-900 mb-2">Criação Manual</h4>
                                    <p className="text-sm text-gray-600">
                                        Crie seu curso do zero, definindo título, descrição e outros detalhes manualmente.
                                    </p>
                                </button>
                                <button
                                    onClick={() => setShowAIForm(true)}
                                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                        showAIForm
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center mb-2">
                                        <SparklesIcon className="h-5 w-5 text-indigo-600 mr-2" />
                                        <h4 className="font-medium text-gray-900">Geração com IA</h4>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Deixe nossa IA criar um curso completo baseado na sua descrição.
                                    </p>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI Generation Form */}
                    {showAIForm ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center mb-6">
                                    <SparklesIcon className="h-6 w-6 text-indigo-600 mr-2" />
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Gerar Curso com IA
                                    </h3>
                                </div>

                                <form onSubmit={handleAIGeneration} className="space-y-6">
                                    <div>
                                        <label htmlFor="ai_description" className="block text-sm font-medium text-gray-700">
                                            Descreva o curso que você quer criar *
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="ai_description"
                                                rows={4}
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                placeholder="Ex: Um curso sobre programação em Python para iniciantes, cobrindo variáveis, estruturas de controle e funções..."
                                                value={aiData.description}
                                                onChange={(e) => setAIData('description', e.target.value)}
                                                required
                                            />
                                        </div>
                                        {aiErrors.description && <div className="mt-2 text-sm text-red-600">{aiErrors.description}</div>}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700">
                                                Público-alvo
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="text"
                                                    id="target_audience"
                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                    placeholder="Ex: Estudantes universitários, profissionais de TI..."
                                                    value={aiData.target_audience}
                                                    onChange={(e) => setAIData('target_audience', e.target.value)}
                                                />
                                            </div>
                                            {aiErrors.target_audience && <div className="mt-2 text-sm text-red-600">{aiErrors.target_audience}</div>}
                                        </div>

                                        <div>
                                            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                                                Nível de Dificuldade *
                                            </label>
                                            <div className="mt-1">
                                                <select
                                                    id="difficulty"
                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                    value={aiData.difficulty}
                                                    onChange={(e) => setAIData('difficulty', e.target.value)}
                                                    required
                                                >
                                                    <option value="beginner">Iniciante</option>
                                                    <option value="intermediate">Intermediário</option>
                                                    <option value="advanced">Avançado</option>
                                                </select>
                                            </div>
                                            {aiErrors.difficulty && <div className="mt-2 text-sm text-red-600">{aiErrors.difficulty}</div>}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={processingAI || isGeneratingAI}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            {(processingAI || isGeneratingAI) ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Gerando curso...
                                                </>
                                            ) : (
                                                <>
                                                    <SparklesIcon className="h-4 w-4 mr-2" />
                                                    Gerar Curso com IA
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        /* Manual Creation Form */
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-6">
                                    Informações do Curso
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                            Título do Curso *
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                id="title"
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                placeholder="Digite o título do seu curso"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                required
                                            />
                                        </div>
                                        {errors.title && <div className="mt-2 text-sm text-red-600">{errors.title}</div>}
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Descrição *
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="description"
                                                rows={4}
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                placeholder="Descreva o que os alunos irão aprender neste curso"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                required
                                            />
                                        </div>
                                        {errors.description && <div className="mt-2 text-sm text-red-600">{errors.description}</div>}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                                Status *
                                            </label>
                                            <div className="mt-1">
                                                <select
                                                    id="status"
                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                    value={data.status}
                                                    onChange={(e) => setData('status', e.target.value)}
                                                    required
                                                >
                                                    <option value="draft">Rascunho</option>
                                                    <option value="published">Publicado</option>
                                                    <option value="archived">Arquivado</option>
                                                </select>
                                            </div>
                                            {errors.status && <div className="mt-2 text-sm text-red-600">{errors.status}</div>}
                                        </div>

                                        <div>
                                            <label htmlFor="points_per_completion" className="block text-sm font-medium text-gray-700">
                                                Pontos por Conclusão *
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="number"
                                                    id="points_per_completion"
                                                    min="1"
                                                    max="1000"
                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                    value={data.points_per_completion}
                                                    onChange={(e) => setData('points_per_completion', parseInt(e.target.value))}
                                                    required
                                                />
                                            </div>
                                            {errors.points_per_completion && <div className="mt-2 text-sm text-red-600">{errors.points_per_completion}</div>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Imagem do Curso
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                            <div className="space-y-1 text-center">
                                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label
                                                        htmlFor="image"
                                                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                    >
                                                        <span>Escolher arquivo</span>
                                                        <input
                                                            id="image"
                                                            name="image"
                                                            type="file"
                                                            accept="image/*"
                                                            className="sr-only"
                                                            onChange={handleImageChange}
                                                        />
                                                    </label>
                                                    <p className="pl-1">ou arraste e solte</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF até 2MB</p>
                                            </div>
                                        </div>
                                        {data.image && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                Arquivo selecionado: {data.image.name}
                                            </div>
                                        )}
                                        {errors.image && <div className="mt-2 text-sm text-red-600">{errors.image}</div>}
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <Link
                                            href={route('courses.index')}
                                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Cancelar
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            {processing ? 'Criando...' : 'Criar Curso'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}