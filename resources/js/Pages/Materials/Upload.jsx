import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import {
    ArrowLeftIcon,
    CloudArrowUpIcon,
    SparklesIcon,
    DocumentIcon,
    TrashIcon,
    EyeIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function MaterialUpload({ auth, course, materials = [], canGenerate = false }) {
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        auto_generate: true,
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');

    // Handle drag events
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    // Handle drop event
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    }, []);

    // Handle file selection
    const handleFileSelect = async (file) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(pdf|doc|docx|txt|ppt|pptx)$/)) {
            setErrors({ file: 'Tipo de arquivo não suportado. Use PDF, DOC, DOCX, TXT, PPT ou PPTX.' });
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setErrors({ file: 'Arquivo muito grande. Tamanho máximo: 10MB.' });
            return;
        }

        setSelectedFile(file);
        setErrors({});

        // Auto-fill title if empty
        if (!uploadForm.title) {
            const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            setUploadForm(prev => ({ ...prev, title: fileName }));
        }
    };

    // Handle file input change
    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    // Handle form submission
    const handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setErrors({ file: 'Selecione um arquivo para enviar.' });
            return;
        }

        if (!uploadForm.title.trim()) {
            setErrors({ title: 'O título é obrigatório.' });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('material', selectedFile);
            formData.append('title', uploadForm.title.trim());
            formData.append('description', uploadForm.description.trim());
            formData.append('auto_generate', uploadForm.auto_generate ? '1' : '0');

            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const response = await fetch(route('materials.upload.store', course.id), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const result = await response.json();

            if (result.success) {
                setSuccess(result.message);
                setSelectedFile(null);
                setUploadForm({ title: '', description: '', auto_generate: true });

                // Refresh page to show new material
                setTimeout(() => {
                    if (result.redirect) {
                        window.location.href = result.redirect;
                    } else {
                        router.reload();
                    }
                }, 1500);
            } else {
                throw new Error(result.error || 'Erro no upload');
            }

        } catch (error) {
            console.error('Upload error:', error);
            setErrors({ general: error.message });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Generate activities from existing material
    const handleGenerateActivities = async (materialId) => {
        setIsGenerating(true);

        try {
            const response = await fetch(route('materials.generate', course.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({ material_id: materialId }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(result.message);

                // Redirect to course page to see generated activities
                setTimeout(() => {
                    if (result.redirect) {
                        window.location.href = result.redirect;
                    } else {
                        router.visit(route('courses.show', course.id));
                    }
                }, 1500);
            } else {
                throw new Error(result.error || 'Erro na geração');
            }

        } catch (error) {
            console.error('Generation error:', error);
            setErrors({ generation: error.message });
        } finally {
            setIsGenerating(false);
        }
    };

    // Delete material
    const handleDeleteMaterial = async (materialId) => {
        if (!confirm('Tem certeza que deseja excluir este material?')) return;

        try {
            const response = await fetch(route('materials.delete', materialId), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(result.message);
                router.reload();
            } else {
                throw new Error(result.error || 'Erro ao excluir');
            }

        } catch (error) {
            console.error('Delete error:', error);
            setErrors({ delete: error.message });
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes >= 1048576) {
            return (bytes / 1048576).toFixed(2) + ' MB';
        } else if (bytes >= 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        }
        return bytes + ' bytes';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center">
                    <Link
                        href={route('courses.show', course.id)}
                        className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Voltar ao Curso
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Enviar Material - {course.title}
                    </h2>
                </div>
            }
        >
            <Head title={`Enviar Material - ${course.title}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <div className="flex">
                                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">{success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Messages */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    {Object.entries(errors).map(([key, message]) => (
                                        <p key={key} className="text-sm font-medium text-red-800">{message}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Form */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <CloudArrowUpIcon className="h-6 w-6 text-indigo-600 mr-2" />
                                <h3 className="text-lg font-medium text-gray-900">
                                    Enviar Novo Material
                                </h3>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-6">
                                {/* Drag and Drop Area */}
                                <div
                                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                        dragActive
                                            ? 'border-indigo-400 bg-indigo-50'
                                            : selectedFile
                                            ? 'border-green-400 bg-green-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                                        onChange={handleFileInputChange}
                                        disabled={isUploading}
                                    />

                                    {selectedFile ? (
                                        <div className="space-y-2">
                                            <DocumentIcon className="mx-auto h-12 w-12 text-green-600" />
                                            <div className="text-sm font-medium text-green-900">
                                                {selectedFile.name}
                                            </div>
                                            <div className="text-xs text-green-600">
                                                {formatFileSize(selectedFile.size)}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedFile(null)}
                                                className="text-xs text-red-600 hover:text-red-800"
                                                disabled={isUploading}
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium text-indigo-600">Clique para enviar</span> ou
                                                arraste e solte
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PDF, DOC, DOCX, TXT, PPT, PPTX até 10MB
                                            </p>
                                        </div>
                                    )}

                                    {/* Upload Progress */}
                                    {isUploading && (
                                        <div className="mt-4">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Enviando... {uploadProgress}%
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Form Fields */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                            Título do Material *
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder="Ex: Apostila de Python Básico"
                                            value={uploadForm.title}
                                            onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                                            disabled={isUploading}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Descrição (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            id="description"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder="Breve descrição do material"
                                            value={uploadForm.description}
                                            onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                                            disabled={isUploading}
                                        />
                                    </div>
                                </div>

                                {/* AI Generation Option */}
                                <div className="flex items-center">
                                    <input
                                        id="auto_generate"
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        checked={uploadForm.auto_generate}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, auto_generate: e.target.checked }))}
                                        disabled={isUploading}
                                    />
                                    <label htmlFor="auto_generate" className="ml-2 block text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <SparklesIcon className="h-4 w-4 text-indigo-600 mr-1" />
                                            Gerar atividades automaticamente com IA
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            A IA analisará o material e criará atividades, quizzes e badges automaticamente
                                        </p>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isUploading || !selectedFile || !uploadForm.title.trim()}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploading ? (
                                            <>
                                                <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                                Enviar Material
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Existing Materials */}
                    {materials.length > 0 && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Materiais Enviados ({materials.length})
                                </h3>

                                <div className="space-y-4">
                                    {materials.map((material) => (
                                        <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                                        {material.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {material.file_name} • {formatFileSize(material.file_size)}
                                                    </p>
                                                    {material.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {material.description}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Enviado em: {new Date(material.created_at).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>

                                                <div className="flex items-center space-x-2 ml-4">
                                                    <button
                                                        onClick={() => handleGenerateActivities(material.id)}
                                                        disabled={isGenerating}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                                    >
                                                        {isGenerating ? (
                                                            <ArrowPathIcon className="animate-spin h-3 w-3 mr-1" />
                                                        ) : (
                                                            <SparklesIcon className="h-3 w-3 mr-1" />
                                                        )}
                                                        Gerar IA
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteMaterial(material.id)}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        <TrashIcon className="h-3 w-3 mr-1" />
                                                        Excluir
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {materials.length === 0 && (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum material enviado</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Envie seu primeiro material para começar a gerar conteúdo automaticamente com IA.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}