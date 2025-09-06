import React, { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    CloudArrowUpIcon, 
    DocumentIcon, 
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Create({ auth, courses, selectedCourse }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        course_id: selectedCourse?.id || '',
        title: '',
        file: null
    });

    const allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validateFile = (file) => {
        const errors = [];
        
        if (!file) {
            errors.push('Por favor selecione um arquivo');
            return errors;
        }

        // Check file size
        if (file.size > maxSize) {
            errors.push('O arquivo deve ter no máximo 10MB');
        }

        // Check file type
        const extension = file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(extension)) {
            errors.push('Formato não suportado. Use: PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, PNG');
        }

        return errors;
    };

    const handleFileSelect = (file) => {
        const errors = validateFile(file);
        setValidationErrors(errors);

        if (errors.length === 0) {
            setData('file', file);
            setFilePreview({
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2),
                type: file.type
            });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const removeFile = () => {
        setData('file', null);
        setFilePreview(null);
        setValidationErrors([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (!data.file) {
            setValidationErrors(['Por favor selecione um arquivo']);
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        post(route('instructor.materials.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setUploadProgress(100);
                setTimeout(() => {
                    router.visit(route('instructor.courses.show', data.course_id));
                }, 1000);
            },
            onError: () => {
                setIsUploading(false);
                setUploadProgress(0);
                clearInterval(progressInterval);
            },
            onFinish: () => {
                clearInterval(progressInterval);
            }
        });
    };

    const getFileIcon = (fileName) => {
        const extension = fileName?.split('.').pop().toLowerCase();
        const iconClass = "w-8 h-8";
        
        if (['pdf'].includes(extension)) {
            return <DocumentIcon className={`${iconClass} text-red-500`} />;
        } else if (['doc', 'docx'].includes(extension)) {
            return <DocumentIcon className={`${iconClass} text-blue-500`} />;
        } else if (['ppt', 'pptx'].includes(extension)) {
            return <DocumentIcon className={`${iconClass} text-orange-500`} />;
        } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
            return <DocumentIcon className={`${iconClass} text-green-500`} />;
        }
        return <DocumentIcon className={`${iconClass} text-gray-500`} />;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Adicionar Material</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Faça upload de materiais de apoio para seus cursos
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Adicionar Material" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-2xl">
                        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-8 py-12">
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
                            <div className="relative">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <CloudArrowUpIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Upload de Material</h3>
                                        <p className="text-gray-600">Adicione recursos para enriquecer suas aulas</p>
                                    </div>
                                </div>

                                <form onSubmit={submit} className="space-y-8">
                                    {/* Course Selection */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Curso
                                        </label>
                                        <select
                                            value={data.course_id}
                                            onChange={e => setData('course_id', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                                            required
                                        >
                                            <option value="">Selecione um curso</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>
                                                    {course.title}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.course_id && (
                                            <p className="text-red-500 text-sm">{errors.course_id}</p>
                                        )}
                                    </div>

                                    {/* Material Title */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Título do Material
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                                            placeholder="Ex: Apostila Módulo 1, Slides Introdutórios..."
                                            required
                                        />
                                        {errors.title && (
                                            <p className="text-red-500 text-sm">{errors.title}</p>
                                        )}
                                    </div>

                                    {/* File Upload Area */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Arquivo
                                        </label>
                                        
                                        {!filePreview ? (
                                            <div
                                                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
                                                    isDragOver
                                                        ? 'border-blue-500 bg-blue-50/80 scale-102'
                                                        : 'border-gray-300 bg-white/50 hover:bg-blue-50/50 hover:border-blue-400'
                                                }`}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    onChange={handleFileInputChange}
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                                                />
                                                
                                                <div className="space-y-4">
                                                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                        <CloudArrowUpIcon className="w-8 h-8 text-white" />
                                                    </div>
                                                    
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                            Arraste e solte seu arquivo aqui
                                                        </h4>
                                                        <p className="text-gray-600 mb-4">
                                                            ou clique para selecionar
                                                        </p>
                                                        
                                                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200">
                                                            Escolher Arquivo
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-sm text-gray-500">
                                                        <p>Formatos aceitos: PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, PNG</p>
                                                        <p>Tamanho máximo: 10MB</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        {getFileIcon(filePreview.name)}
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{filePreview.name}</h4>
                                                            <p className="text-sm text-gray-500">{filePreview.size} MB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={removeFile}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                    >
                                                        <XMarkIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                
                                                {isUploading && (
                                                    <div className="mt-4">
                                                        <div className="flex items-center justify-between text-sm mb-2">
                                                            <span className="text-gray-600">Enviando...</span>
                                                            <span className="text-gray-600">{uploadProgress}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${uploadProgress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Validation Errors */}
                                        {validationErrors.length > 0 && (
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                                <div className="flex items-start space-x-3">
                                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-medium text-red-800 mb-1">Erro no arquivo</h4>
                                                        <ul className="text-sm text-red-600 space-y-1">
                                                            {validationErrors.map((error, index) => (
                                                                <li key={index}>• {error}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {errors.file && (
                                            <p className="text-red-500 text-sm">{errors.file}</p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex items-center justify-end space-x-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => router.visit(route('instructor.courses.index'))}
                                            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                                        >
                                            Cancelar
                                        </button>
                                        
                                        <button
                                            type="submit"
                                            disabled={processing || isUploading || !data.file || validationErrors.length > 0}
                                            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                                                    Fazer Upload
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}