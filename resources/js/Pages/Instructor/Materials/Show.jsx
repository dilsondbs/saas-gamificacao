import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ auth = {}, material = {}, course = {}, suggestions = [] }) {
    const [isCreatingActivities, setIsCreatingActivities] = useState(false);
    
    // Safe extraction with fallbacks
    const user = auth?.user || {};
    const materialData = material || {};
    const courseData = course || {};
    const suggestionsList = Array.isArray(suggestions) ? suggestions : [];

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileTypeLabel = (filename) => {
        if (!filename) return 'Arquivo';
        const extension = filename?.split('.').pop()?.toLowerCase();
        const types = {
            pdf: 'Documento PDF',
            doc: 'Documento Word',
            docx: 'Documento Word',
            ppt: 'Apresentação PowerPoint',
            pptx: 'Apresentação PowerPoint',
            jpg: 'Imagem JPEG',
            jpeg: 'Imagem JPEG',
            png: 'Imagem PNG'
        };
        return types[extension] || 'Arquivo';
    };

    const getFileIcon = (filename) => {
        if (!filename) {
            return <div className="w-8 h-8 flex items-center justify-center text-gray-500 text-2xl">📄</div>;
        }
        const extension = filename?.split('.').pop()?.toLowerCase();
        const iconClass = "w-8 h-8";
        
        if (['pdf'].includes(extension)) {
            return <div className="w-8 h-8 flex items-center justify-center text-red-500 text-2xl">📄</div>;
        } else if (['doc', 'docx'].includes(extension)) {
            return <div className="w-8 h-8 flex items-center justify-center text-blue-500 text-2xl">📄</div>;
        } else if (['ppt', 'pptx'].includes(extension)) {
            return <div className="w-8 h-8 flex items-center justify-center text-orange-500 text-2xl">📄</div>;
        } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
            return <div className="w-8 h-8 flex items-center justify-center text-green-500 text-2xl">📄</div>;
        }
        return <div className="w-8 h-8 flex items-center justify-center text-gray-500 text-2xl">📄</div>;
    };

    const getSuggestionIcon = (type) => {
        const iconClass = "w-6 h-6";
        switch (type) {
            case 'structure':
                return <div className="w-6 h-6 flex items-center justify-center text-blue-500 text-lg">📄</div>;
            case 'activities':
                return <div className="w-6 h-6 flex items-center justify-center text-purple-500 text-lg">🧩</div>;
            case 'completion':
                return <div className="w-6 h-6 flex items-center justify-center text-green-500 text-lg">✅</div>;
            case 'engagement':
                return <div className="w-6 h-6 flex items-center justify-center text-orange-500 text-lg">🔥</div>;
            case 'assessment':
                return <div className="w-6 h-6 flex items-center justify-center text-indigo-500 text-lg">📊</div>;
            case 'interaction':
                return <div className="w-6 h-6 flex items-center justify-center text-pink-500 text-lg">👥</div>;
            default:
                return <div className="w-6 h-6 flex items-center justify-center text-yellow-500 text-lg">💡</div>;
        }
    };

    const handleCreateActivities = () => {
        setIsCreatingActivities(true);
        // Future: API call to create activities automatically
        setTimeout(() => {
            setIsCreatingActivities(false);
            router.visit(route('instructor.activities.index'));
        }, 2000);
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Material Enviado com Sucesso!</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Confira nossas sugestões inteligentes para maximizar o aprendizado
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Material - Sugestões" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    {/* Success Banner */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl">
                                ✅
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-green-900">Upload Realizado com Sucesso!</h3>
                                <p className="text-green-700">Seu material foi processado e está pronto para uso</p>
                            </div>
                            <div className="flex-1"></div>
                            <div className="animate-bounce text-green-500 text-3xl">
                                ✨
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Material Information */}
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-8">
                                    <div className="flex items-center space-x-4 mb-6">
                                        {getFileIcon(materialData?.filename)}
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{materialData?.title || 'Título não disponível'}</h3>
                                            <p className="text-gray-600 text-sm">{getFileTypeLabel(materialData?.filename)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-5 h-5 flex items-center justify-center text-gray-500">📁</div>
                                            <div>
                                                <p className="text-sm text-gray-500">Curso</p>
                                                <p className="font-medium text-gray-900">{courseData?.title || 'Curso não encontrado'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <div className="w-5 h-5 flex items-center justify-center text-gray-500">📄</div>
                                            <div>
                                                <p className="text-sm text-gray-500">Tamanho</p>
                                                <p className="font-medium text-gray-900">{formatFileSize(materialData?.file_size)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <div className="w-5 h-5 flex items-center justify-center text-gray-500">📅</div>
                                            <div>
                                                <p className="text-sm text-gray-500">Data de Upload</p>
                                                <p className="font-medium text-gray-900">
                                                    {materialData?.created_at ? new Date(materialData.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Suggestions */}
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 px-8 py-6">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl">
                                            ✨
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Sugestões Inteligentes</h3>
                                            <p className="text-gray-600">Baseadas no seu material e nas melhores práticas pedagógicas</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {suggestionsList && suggestionsList.length > 0 ? suggestionsList.map((suggestion, index) => (
                                            <div key={index} className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200">
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                                                        {getSuggestionIcon(suggestion?.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 mb-2 text-lg">{suggestion?.title || 'Sugestão'}</h4>
                                                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{suggestion?.description || 'Descrição não disponível'}</p>
                                                        
                                                        {suggestion?.items && Array.isArray(suggestion.items) && suggestion.items.length > 0 && (
                                                            <ul className="space-y-2">
                                                                {suggestion.items.map((item, itemIndex) => (
                                                                    <li key={itemIndex} className="flex items-start space-x-2">
                                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                        <span className="text-sm text-gray-700">{item || 'Item'}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="col-span-2 text-center py-8">
                                                <p className="text-gray-500">Nenhuma sugestão disponível no momento.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Benefits Banner */}
                                    <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl">
                                                🚀
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-blue-900 mb-1">Potencialize seu Material</h4>
                                                <p className="text-blue-700 text-sm">
                                                    Nossas sugestões são baseadas em análise de conteúdo e boas práticas de ensino. 
                                                    Implemente-as para aumentar o engajamento e melhorar os resultados de aprendizado.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white shadow-xl rounded-2xl p-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="text-center sm:text-left">
                                <h4 className="font-bold text-gray-900 text-lg mb-2">Próximos Passos</h4>
                                <p className="text-gray-600">Escolha como você gostaria de proceder com seu material</p>
                            </div>

                            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                <Link
                                    href={materialData?.id ? route('instructor.materials.file', materialData.id) : '#'}
                                    target="_blank"
                                    className="inline-flex items-center px-6 py-3 text-blue-600 hover:text-blue-700 font-medium border border-blue-300 rounded-xl hover:bg-blue-50 transition-all duration-200"
                                >
                                    <div className="w-5 h-5 mr-2 flex items-center justify-center">👁️</div>
                                    Visualizar Material
                                </Link>

                                <Link
                                    href={courseData?.id ? route('instructor.courses.show', courseData.id) : '#'}
                                    className="inline-flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                                >
                                    <div className="w-5 h-5 mr-2 flex items-center justify-center">📁</div>
                                    Voltar ao Curso
                                </Link>

                                <Link
                                    href={route('instructor.materials.index')}
                                    className="inline-flex items-center px-6 py-3 text-blue-600 hover:text-blue-700 font-medium border border-blue-300 rounded-xl hover:bg-blue-50 transition-all duration-200"
                                >
                                    <div className="w-5 h-5 mr-2 flex items-center justify-center">📄</div>
                                    Gerenciar Materiais
                                </Link>

                                <button
                                    onClick={handleCreateActivities}
                                    disabled={isCreatingActivities}
                                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    {isCreatingActivities ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Criando...
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-5 h-5 mr-2 flex items-center justify-center">✨</div>
                                            Criar Atividades Automaticamente
                                            <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">Em Breve</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl">
                                    🏆
                                </div>
                                <div>
                                    <h4 className="font-bold text-green-900">Qualidade do Material</h4>
                                    <p className="text-green-600 text-2xl font-bold">Excelente</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl">
                                    ⏰
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900">Tempo de Estudo Estimado</h4>
                                    <p className="text-blue-600 text-2xl font-bold">{suggestionsList?.length ? suggestionsList.length * 15 : 0}min</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl">
                                    🎓
                                </div>
                                <div>
                                    <h4 className="font-bold text-purple-900">Potencial de Aprendizado</h4>
                                    <p className="text-purple-600 text-2xl font-bold">Alto</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}