import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    CloudArrowUpIcon,
    DocumentIcon,
    SparklesIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PlayIcon,
    VideoCameraIcon,
    LinkIcon
} from '@heroicons/react/24/outline';

console.log('🎬 GenerateComplete.jsx CARREGADO');

export default function GenerateComplete({ auth, csrf_token, success, courseData, message, stats, errors: flashErrors }) {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(success ? { data: courseData, stats } : null);
    const [errors, setErrors] = useState(flashErrors || {});
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [generationStage, setGenerationStage] = useState('input'); // 'input', 'generating', 'results'
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        description: '',
        target_audience: '',
        difficulty: 'intermediate',
        include_canvas: true,
        file: null,
        youtube_url: '',
        video_url: '',
        title: '',
        generation_mode: 'file', // Padrão para upload
    });

    const difficulties = {
        'beginner': { label: '🟢 Iniciante', color: 'bg-green-100 text-green-800' },
        'intermediate': { label: '🟡 Intermediário', color: 'bg-yellow-100 text-yellow-800' },
        'advanced': { label: '🔴 Avançado', color: 'bg-red-100 text-red-800' }
    };

    // Atualizar resultados quando chegarem via Inertia
    useEffect(() => {
        console.log('🔄 useEffect EXECUTADO - Props recebidas:', { success, courseData, message });
        if (success && courseData) {
            console.log('✅ useEffect - Atualizando resultados');
            setResults({ data: courseData, stats });
            setGenerationStage('results');
            setIsLoading(false);
        }
    }, [success, courseData, stats]);

    const handleFileUpload = (files) => {
        const file = files[0];
        if (file) {
            // Validar tipo de arquivo
            const allowedTypes = [
                'application/pdf', 'text/plain', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv',
                'video/webm', 'video/x-msvideo', 'video/quicktime'
            ];

            const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i);
            const isDocument = allowedTypes.includes(file.type) || file.name.match(/\.(pdf|txt|doc|docx)$/i);

            if (!isVideo && !isDocument) {
                setErrors({ file: 'Tipo de arquivo não suportado. Use PDF, TXT, DOC, DOCX ou vídeos (MP4, AVI, MOV, etc.).' });
                return;
            }

            // Validar tamanho (500MB para vídeos, 10MB para documentos)
            const maxSize = isVideo ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
            if (file.size > maxSize) {
                const maxSizeText = isVideo ? '500MB' : '10MB';
                setErrors({ file: `Arquivo muito grande. Máximo ${maxSizeText}.` });
                return;
            }

            console.log('✅ handleFileUpload - Arquivo PASSOU nas validações');
            console.log('📁 File:', file);
            console.log('📁 File.name:', file.name);
            console.log('📁 File.size:', file.size);
            console.log('📁 File.type:', file.type);

            setUploadedFile(file);
            console.log('✅ setUploadedFile executado');

            setFormData(prev => ({ ...prev, file, title: file.name.replace(/\.[^/.]+$/, "") }));
            console.log('✅ setFormData executado com file');

            setErrors({ ...errors, file: null });
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const handleSubmit = (e) => {
        console.log('🎯 handleSubmit INICIADO');
        console.log('📦 formData.file:', formData.file);
        console.log('📦 uploadedFile:', uploadedFile);
        console.log('📦 formData completo:', formData);
        console.log('📦 generation_mode:', formData.generation_mode);
        e.preventDefault();
        console.log('🎯 preventDefault executado');
        setIsLoading(true);
        setGenerationStage('generating');
        setErrors({});
        console.log('🎯 Estados atualizados, criando FormData');

        const submitData = new FormData();

        if (formData.generation_mode === 'file') {
            console.log('🔍 Validando arquivo no modo file...');
            console.log('📦 formData.file existe?', !!formData.file);
            console.log('📦 formData.file:', formData.file);

            if (!formData.file) {
                console.log('❌ ERRO: formData.file é null/undefined - BLOQUEANDO ENVIO');
                setErrors({ file: 'Por favor, anexe um documento ou vídeo.' });
                setIsLoading(false);
                setGenerationStage('input');
                return;
            }

            console.log('✅ Arquivo validado, adicionando ao FormData');
            submitData.append('file', formData.file);
            submitData.append('title', formData.title);
            console.log('✅ Arquivo adicionado ao FormData');
        } else if (formData.generation_mode === 'youtube') {
            if (!formData.youtube_url.trim()) {
                setErrors({ youtube_url: 'Por favor, insira uma URL do YouTube.' });
                setIsLoading(false);
                setGenerationStage('input');
                return;
            }
            submitData.append('youtube_url', formData.youtube_url);
            submitData.append('title', formData.title);
        } else if (formData.generation_mode === 'video_url') {
            if (!formData.video_url.trim()) {
                setErrors({ video_url: 'Por favor, insira uma URL de vídeo.' });
                setIsLoading(false);
                setGenerationStage('input');
                return;
            }
            submitData.append('video_url', formData.video_url);
            submitData.append('title', formData.title);
        } else {
            if (!formData.description.trim()) {
                setErrors({ description: 'Por favor, descreva o curso que deseja criar.' });
                setIsLoading(false);
                setGenerationStage('input');
                return;
            }
            submitData.append('description', formData.description);
        }

        submitData.append('target_audience', formData.target_audience);
        submitData.append('difficulty', formData.difficulty);
        submitData.append('include_canvas', formData.include_canvas ? '1' : '0');
        submitData.append('generation_mode', formData.generation_mode);

        const endpoint = formData.generation_mode === 'file' ? 'generate-course-from-file' : 'generate-complete-package';

        console.log('🚀 Enviando dados:', { endpoint, formData: Object.fromEntries(submitData) });

        // Obter CSRF token de forma segura (priorizar do Inertia, fallback para meta tag)
        const csrfToken = csrf_token || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        if (!csrfToken) {
            console.error('❌ CSRF token não encontrado no HTML nem no Inertia!');
            setError('Erro de segurança: Token CSRF não encontrado. Recarregue a página.');
            setLoading(false);
            return;
        }

        console.log('🔑 CSRF Token obtido de:', csrf_token ? 'Inertia props' : 'meta tag HTML');
        console.log('🔑 CSRF Token:', csrfToken.substring(0, 10) + '...');

        // Usar fetch em vez de router.post para melhor controle
        fetch(route(`eduai.${endpoint}`), {
            method: 'POST',
            body: submitData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json',
            },
            credentials: 'same-origin'
        })
        .then(async response => {
            console.log('📄 Response status:', response.status);
            console.log('📄 Response headers:', Object.fromEntries(response.headers));

            const text = await response.text();
            console.log('📄 Response text:', text.substring(0, 500));

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error('Resposta inválida do servidor');
            }

            // Se não for sucesso (422, 500, etc)
            if (!response.ok) {
                if (data.errors) {
                    // Erros de validação Laravel
                    setErrors(data.errors);
                } else if (data.message) {
                    setErrors({ general: data.message });
                } else {
                    setErrors({ general: 'Erro ao processar requisição' });
                }
                setIsLoading(false);
                setGenerationStage('input');
                return;
            }

            // Resposta de sucesso
            console.log('✅ Resposta JSON:', data);
            if (data.success && data.courseData) {
                setResults({
                    data: data.courseData,
                    saved_course_id: data.courseData.saved_course_id // ID do curso já salvo
                });
                setGenerationStage('results');

                // Atualizar CSRF token com o novo fornecido pelo servidor
                if (data.csrf_token) {
                    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
                    if (csrfMetaTag) {
                        csrfMetaTag.setAttribute('content', data.csrf_token);
                        console.log('🔄 CSRF token atualizado:', data.csrf_token.substring(0, 10) + '...');
                    }
                }
            } else {
                console.log('⚠️ Sem courseData na resposta JSON');
                setErrors({ general: 'Curso gerado mas sem dados retornados' });
                setGenerationStage('input');
            }
            setIsLoading(false);
        })
        .catch(error => {
            console.log('❌ Erro na requisição:', error);
            setErrors({ general: error.message || 'Erro ao processar requisição' });
            setIsLoading(false);
            setGenerationStage('input');
        });
    };

    const resetForm = () => {
        setFormData({
            description: '',
            target_audience: '',
            difficulty: 'intermediate',
            include_canvas: true,
            file: null,
            youtube_url: '',
            video_url: '',
            title: '',
            generation_mode: 'file',
        });
        setUploadedFile(null);
        setResults(null);
        setGenerationStage('input');
        setErrors({});
    };

    const getFileIcon = (filename) => {
        const ext = filename?.split('.').pop()?.toLowerCase();
        const iconClass = "w-8 h-8";

        switch (ext) {
            case 'pdf':
                return <DocumentIcon className={`${iconClass} text-red-500`} />;
            case 'doc':
            case 'docx':
                return <DocumentIcon className={`${iconClass} text-blue-500`} />;
            case 'txt':
                return <DocumentIcon className={`${iconClass} text-gray-500`} />;
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'wmv':
            case 'webm':
            case 'mkv':
            case 'flv':
                return <VideoCameraIcon className={`${iconClass} text-purple-500`} />;
            default:
                return <DocumentIcon className={`${iconClass} text-gray-400`} />;
        }
    };

    // Loading Component
    const LoadingStage = () => (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-6">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin">
                    <div className="w-4 h-4 bg-indigo-600 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                </div>
                <SparklesIcon className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">IA Processando seu Conteúdo</h3>
                <p className="text-gray-600">Analisando documento e gerando curso estruturado...</p>
                <div className="mt-4 space-y-2">
                    <div className="text-sm text-gray-500">• Extraindo conteúdo do documento</div>
                    <div className="text-sm text-gray-500">• Estruturando módulos e lições</div>
                    <div className="text-sm text-gray-500">• Criando atividades gamificadas</div>
                </div>
            </div>
        </div>
    );

    // Results Component
    const ResultsStage = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-8 h-8 text-green-500" />
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Curso Gerado com Sucesso!</h3>
                        <p className="text-gray-600">Sua IA criou um curso completo baseado no seu documento</p>
                    </div>
                </div>
                <button
                    onClick={resetForm}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Gerar Novo</span>
                </button>
            </div>

            {results?.data && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b">
                        <h4 className="text-lg font-semibold text-gray-900">{results.data.title}</h4>
                        <p className="text-gray-600 mt-1">{results.data.description}</p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{results.data.modules?.length || 0}</div>
                                <div className="text-sm text-gray-600">Módulos</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {results.data.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0}
                                </div>
                                <div className="text-sm text-gray-600">Lições</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {results.data.modules?.reduce((total, module) =>
                                        total + (module.lessons?.reduce((ltotal, lesson) =>
                                            ltotal + (lesson.activities?.length || 0), 0) || 0), 0) || 0}
                                </div>
                                <div className="text-sm text-gray-600">Atividades</div>
                            </div>
                        </div>

                        {/* Módulos Preview */}
                        <div className="space-y-4">
                            <h5 className="font-semibold text-gray-900">Estrutura do Curso:</h5>
                            {results.data.modules?.map((module, moduleIndex) => (
                                <div key={moduleIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b">
                                        <h6 className="font-medium text-gray-900">
                                            Módulo {moduleIndex + 1}: {module.title}
                                        </h6>
                                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                                    </div>
                                    <div className="p-4">
                                        {module.lessons?.map((lesson, lessonIndex) => (
                                            <div key={lessonIndex} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {lesson.title}
                                                    </span>
                                                    <div className="text-xs text-gray-500">
                                                        {lesson.activities?.length || 0} atividades • {lesson.estimated_duration || '15min'}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Lição {lessonIndex + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex space-x-4">
                            {results?.saved_course_id ? (
                                // Curso já foi salvo automaticamente
                                <button
                                    onClick={() => {
                                        router.get(route('instructor.courses.show', results.saved_course_id));
                                    }}
                                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                    <span>✅ Curso Salvo - Ver Detalhes</span>
                                </button>
                            ) : (
                                // Curso não foi salvo automaticamente, permitir salvamento manual
                                <button
                                    onClick={() => {
                                        console.log('💾 Salvando curso...', results.data);

                                        // Usar router.post do Inertia com token atualizado
                                        router.post(route('eduai.save-course'), {
                                            course_data: results.data,
                                        }, {
                                            preserveScroll: true,
                                            preserveState: true,
                                            onSuccess: (page) => {
                                                console.log('✅ Curso salvo com sucesso!', page);
                                                alert('Curso salvo com sucesso! 🎉');
                                            },
                                            onError: (errors) => {
                                                console.error('❌ Erro ao salvar curso:', errors);
                                                alert('Erro ao salvar curso. Verifique o console para detalhes.');
                                            }
                                        });
                                    }}
                                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    💾 Salvar Curso
                                </button>
                            )}
                            <button
                                onClick={() => router.get(route('eduai.canvas', { canvasId: 'preview' }), { courseData: results.data })}
                                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                            >
                                🎨 Ver no Canvas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-4">
                    <SparklesIcon className="w-8 h-8 text-indigo-600" />
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            EduAI Assistant
                        </h2>
                        <p className="text-gray-600">Gere cursos completos com Inteligência Artificial</p>
                    </div>
                </div>
            }
        >
            <Head title="EduAI - Gerar Curso" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">

                    {generationStage === 'input' && (
                        <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    ✨ Crie seu Curso com IA
                                </h3>
                                <p className="text-indigo-100">
                                    Envie um documento ou descreva sua ideia. Nossa IA criará um curso completo com módulos, lições e atividades gamificadas.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8">
                                {/* Error Display */}
                                {(errors.general || Object.keys(errors).length > 0) && (
                                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                        <div className="flex items-start">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-red-800 mb-2">Erro ao gerar curso</h3>
                                                {errors.general && (
                                                    <p className="text-red-700 text-sm">{errors.general}</p>
                                                )}
                                                {Object.entries(errors).filter(([key]) => key !== 'general').map(([field, messages]) => (
                                                    <div key={field} className="text-red-700 text-sm mt-1">
                                                        <strong>{field}:</strong> {Array.isArray(messages) ? messages.join(', ') : messages}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mode Selector */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Como você quer criar seu curso?</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, generation_mode: 'file' }))}
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                formData.generation_mode === 'file'
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <CloudArrowUpIcon className="w-8 h-8 mx-auto mb-2" />
                                            <div className="font-medium">Upload de Arquivo</div>
                                            <div className="text-sm opacity-75">PDF, DOC, Vídeos</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, generation_mode: 'youtube' }))}
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                formData.generation_mode === 'youtube'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <PlayIcon className="w-8 h-8 mx-auto mb-2" />
                                            <div className="font-medium">YouTube</div>
                                            <div className="text-sm opacity-75">URL do YouTube</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, generation_mode: 'video_url' }))}
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                formData.generation_mode === 'video_url'
                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <LinkIcon className="w-8 h-8 mx-auto mb-2" />
                                            <div className="font-medium">URL de Vídeo</div>
                                            <div className="text-sm opacity-75">Link direto</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, generation_mode: 'description' }))}
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                formData.generation_mode === 'description'
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <SparklesIcon className="w-8 h-8 mx-auto mb-2" />
                                            <div className="font-medium">Texto Livre</div>
                                            <div className="text-sm opacity-75">Descreva sua ideia</div>
                                        </button>
                                    </div>
                                </div>

                                {/* File Upload Area */}
                                {formData.generation_mode === 'file' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Documento do Curso
                                        </label>
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                                                dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                                            } ${uploadedFile ? 'border-green-500 bg-green-50' : ''}`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            {uploadedFile ? (
                                                <div className="flex items-center justify-center space-x-4">
                                                    {getFileIcon(uploadedFile.name)}
                                                    <div className="text-left">
                                                        <div className="font-medium text-gray-900">{uploadedFile.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUploadedFile(null);
                                                            setFormData(prev => ({ ...prev, file: null }));
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <div className="text-lg font-medium text-gray-900 mb-2">
                                                        Arraste seu documento aqui
                                                    </div>
                                                    <div className="text-gray-500 mb-4">
                                                        Ou clique para selecionar
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                                    >
                                                        Selecionar Arquivo
                                                    </button>
                                                    <div className="text-xs text-gray-400 mt-2">
                                                        PDF, DOC, DOCX, TXT, MP4, AVI, MOV, WebM • Máx. 500MB
                                                    </div>
                                                </div>
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,.doc,.docx,.txt,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv"
                                                onChange={(e) => handleFileUpload(e.target.files)}
                                                className="hidden"
                                            />
                                        </div>
                                        {errors.file && (
                                            <div className="mt-2 text-sm text-red-600 flex items-center">
                                                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                                {errors.file}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* YouTube URL Input */}
                                {formData.generation_mode === 'youtube' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            URL do YouTube
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <PlayIcon className="h-5 w-5 text-red-400" />
                                            </div>
                                            <input
                                                type="url"
                                                value={formData.youtube_url}
                                                onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                                            />
                                        </div>
                                        {errors.youtube_url && (
                                            <div className="mt-2 text-sm text-red-600 flex items-center">
                                                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                                {errors.youtube_url}
                                            </div>
                                        )}
                                        <div className="mt-2 text-xs text-gray-500">
                                            Cole a URL completa do vídeo do YouTube que você quer usar como base para o curso.
                                        </div>
                                    </div>
                                )}

                                {/* Video URL Input */}
                                {formData.generation_mode === 'video_url' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            URL do Vídeo
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LinkIcon className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <input
                                                type="url"
                                                value={formData.video_url}
                                                onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                                                placeholder="https://exemplo.com/video.mp4"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                            />
                                        </div>
                                        {errors.video_url && (
                                            <div className="mt-2 text-sm text-red-600 flex items-center">
                                                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                                {errors.video_url}
                                            </div>
                                        )}
                                        <div className="mt-2 text-xs text-gray-500">
                                            Cole a URL direta do arquivo de vídeo (MP4, WebM, etc.) hospedado em qualquer plataforma.
                                        </div>
                                    </div>
                                )}

                                {/* Text Description */}
                                {formData.generation_mode === 'description' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descrição do Curso
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Descreva o curso que você quer criar. Ex: 'Quero um curso de matemática básica para estudantes do ensino fundamental, incluindo números, operações e frações...'"
                                            rows={6}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        {errors.description && (
                                            <div className="mt-2 text-sm text-red-600 flex items-center">
                                                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                                {errors.description}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Course Title */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Título do Curso
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Ex: Matemática Básica para Iniciantes"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {errors.title && (
                                        <div className="mt-2 text-sm text-red-600 flex items-center">
                                            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                            {errors.title}
                                        </div>
                                    )}
                                </div>

                                {/* Settings Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Público-Alvo
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.target_audience}
                                            onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                                            placeholder="Ex: Estudantes do ensino fundamental"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nível de Dificuldade
                                        </label>
                                        <select
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            {Object.entries(difficulties).map(([key, { label }]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        onClick={() => console.log('🎯 BOTÃO CLICADO!', {isLoading, formData})}
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <SparklesIcon className="w-5 h-5" />
                                        <span>Gerar Curso com IA</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {generationStage === 'generating' && <LoadingStage />}
                    {generationStage === 'results' && <ResultsStage />}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}