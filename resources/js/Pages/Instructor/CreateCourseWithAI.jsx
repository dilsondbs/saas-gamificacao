import { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function CreateCourseWithAI({ auth }) {
    const [content, setContent] = useState('');
    const [contentType, setContentType] = useState('text');
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('input');
    
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 2 * 1024 * 1024) { // 2MB limit
                setError('Arquivo muito grande. Tamanho máximo: 2MB');
                return;
            }
            
            const allowedTypes = ['text/plain', 'application/pdf'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setError('Tipo de arquivo não suportado. Use apenas TXT ou PDF.');
                return;
            }
            
            setFile(selectedFile);
            setError(null);
            
            // For text files, read content directly
            if (selectedFile.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setContent(e.target.result);
                };
                reader.readAsText(selectedFile);
            }
        }
    };

    const handlePreview = async () => {
        if (!content.trim()) {
            setError('Por favor, insira ou faça upload de conteúdo para análise.');
            return;
        }

        setIsPreviewLoading(true);
        setError(null);

        try {
            const response = await fetch('/instructor/courses/ai/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    content: content,
                    preview_only: true
                })
            });

            const data = await response.json();

            if (data.success) {
                setPreview(data.preview);
                setActiveTab('preview');
            } else {
                setError(data.message || 'Erro ao gerar preview');
            }
        } catch (err) {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!content.trim()) {
            setError('Por favor, insira ou faça upload de conteúdo para gerar o curso.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('content_type', contentType);
            
            if (file && contentType === 'file') {
                formData.append('file', file);
            }

            const response = await fetch('/instructor/courses/ai/generate', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
                setActiveTab('result');
                
                // Show success message and redirect after 3 seconds
                setTimeout(() => {
                    router.visit(`/instructor/courses/${data.course.id}/edit`);
                }, 3000);
            } else {
                setError(data.message || 'Erro ao gerar curso');
            }
        } catch (err) {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setContent('');
        setFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
        setActiveTab('input');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const TabButton = ({ id, active, children }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
                active 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
        >
            {children}
        </button>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            🤖 Criar Curso com IA
                        </h1>
                        <p className="text-gray-600 mt-1">Transforme qualquer conteúdo em um curso estruturado automaticamente</p>
                    </div>
                </div>
            }
        >
            <Head title="Criar Curso com IA" />

            <div className="py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Tab Navigation */}
                    <div className="mb-8">
                        <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                            <TabButton id="input" active={activeTab === 'input'}>
                                📝 Inserir Conteúdo
                            </TabButton>
                            <TabButton id="preview" active={activeTab === 'preview'}>
                                👁️ Preview
                            </TabButton>
                            <TabButton id="result" active={activeTab === 'result'}>
                                ✅ Resultado
                            </TabButton>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <span className="text-red-600 text-lg mr-2">⚠️</span>
                                <p className="text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Input Tab */}
                    {activeTab === 'input' && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <span className="mr-3">📚</span>
                                    Conteúdo do Curso
                                </h2>
                                <p className="text-gray-600 mt-1">Cole seu texto ou faça upload de um arquivo PDF/TXT (máximo 50KB)</p>
                            </div>

                            <div className="p-8">
                                {/* Content Type Selector */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Como você quer adicionar o conteúdo?
                                    </label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="text"
                                                checked={contentType === 'text'}
                                                onChange={(e) => setContentType(e.target.value)}
                                                className="mr-2 text-blue-600"
                                            />
                                            <span className="text-gray-700">📝 Digitar/Colar Texto</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="file"
                                                checked={contentType === 'file'}
                                                onChange={(e) => setContentType(e.target.value)}
                                                className="mr-2 text-blue-600"
                                            />
                                            <span className="text-gray-700">📄 Upload de Arquivo</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Text Input */}
                                {contentType === 'text' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Conteúdo do Curso
                                        </label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Cole aqui o conteúdo que será transformado em curso. Pode ser texto de livros, apostilas, artigos, etc..."
                                            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            maxLength="51200"
                                        />
                                        <div className="mt-2 flex justify-between text-sm text-gray-500">
                                            <span>{content.length} / 51,200 caracteres</span>
                                            <span className={`${content.length > 51200 ? 'text-red-500' : ''}`}>
                                                {content.length > 51200 ? 'Limite excedido!' : 'Máximo 50KB'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* File Upload */}
                                {contentType === 'file' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload de Arquivo
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors duration-200">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                onChange={handleFileChange}
                                                accept=".txt,.pdf"
                                                className="hidden"
                                            />
                                            <div className="text-center">
                                                <div className="text-4xl mb-4">📄</div>
                                                {file ? (
                                                    <div>
                                                        <p className="text-green-600 font-medium">{file.name}</p>
                                                        <p className="text-gray-500 text-sm mt-1">
                                                            {(file.size / 1024).toFixed(1)} KB
                                                        </p>
                                                        <button
                                                            onClick={() => fileInputRef.current.click()}
                                                            className="mt-3 text-blue-600 hover:text-blue-800 text-sm"
                                                        >
                                                            Escolher outro arquivo
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-gray-600 mb-2">
                                                            Arraste um arquivo aqui ou clique para selecionar
                                                        </p>
                                                        <button
                                                            onClick={() => fileInputRef.current.click()}
                                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                                        >
                                                            Selecionar Arquivo
                                                        </button>
                                                        <p className="text-gray-500 text-sm mt-2">
                                                            Formatos: TXT, PDF • Máximo: 2MB
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Content preview for uploaded text */}
                                        {content && contentType === 'file' && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                                <h4 className="font-medium text-gray-700 mb-2">Preview do Conteúdo:</h4>
                                                <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                                                    {content.substring(0, 500)}
                                                    {content.length > 500 && '...'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={handlePreview}
                                        disabled={!content.trim() || isPreviewLoading}
                                        className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {isPreviewLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Gerando Preview...
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">👁️</span>
                                                Ver Preview
                                            </>
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={handleGenerate}
                                        disabled={!content.trim() || isLoading}
                                        className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Gerando Curso...
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">🤖</span>
                                                Gerar Curso com IA
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-blue-800 mb-2">💡 Dicas para melhores resultados:</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Use conteúdo bem estruturado com títulos e subtítulos</li>
                                        <li>• Inclua informações detalhadas sobre o assunto</li>
                                        <li>• Textos maiores geram cursos mais completos</li>
                                        <li>• A IA criará automaticamente módulos, quizzes e exercícios</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Tab */}
                    {activeTab === 'preview' && preview && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <span className="mr-3">👁️</span>
                                    Preview do Curso
                                </h2>
                                <p className="text-gray-600 mt-1">Veja como ficará seu curso antes de criar</p>
                            </div>

                            <div className="p-8">
                                {/* Course Info */}
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{preview.title}</h3>
                                    <p className="text-gray-600 mb-4">{preview.description}</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-blue-600">{preview.modules?.length || 0}</div>
                                            <div className="text-sm text-blue-800">Módulos</div>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-green-600">{preview.activities_count || 0}</div>
                                            <div className="text-sm text-green-800">Atividades</div>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-purple-600">{preview.points_per_completion || 0}</div>
                                            <div className="text-sm text-purple-800">Pontos</div>
                                        </div>
                                        <div className="bg-orange-50 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-orange-600">{preview.estimated_duration || 'N/A'}</div>
                                            <div className="text-sm text-orange-800">Duração</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="font-semibold text-blue-600">{preview.quiz_count || 0}</div>
                                            <div className="text-xs text-gray-600">Quizzes</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="font-semibold text-green-600">{preview.reading_count || 0}</div>
                                            <div className="text-xs text-gray-600">Leituras</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="font-semibold text-purple-600">{preview.assignment_count || 0}</div>
                                            <div className="text-xs text-gray-600">Exercícios</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modules */}
                                {preview.modules && preview.modules.length > 0 && (
                                    <div className="space-y-6">
                                        <h4 className="text-xl font-bold text-gray-900">📋 Módulos do Curso</h4>
                                        {preview.modules.map((module, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="bg-gray-50 px-6 py-4 border-b">
                                                    <h5 className="text-lg font-semibold text-gray-900">
                                                        Módulo {module.order}: {module.title}
                                                    </h5>
                                                    <p className="text-gray-600 text-sm mt-1">{module.description}</p>
                                                </div>
                                                <div className="p-6">
                                                    {module.activities && module.activities.length > 0 && (
                                                        <div className="space-y-3">
                                                            {module.activities.map((activity, actIndex) => (
                                                                <div key={actIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                    <div className="flex items-center">
                                                                        <span className="mr-3">
                                                                            {activity.type === 'quiz' ? '❓' : 
                                                                             activity.type === 'reading' ? '📖' : '✍️'}
                                                                        </span>
                                                                        <div>
                                                                            <div className="font-medium text-gray-900">{activity.title}</div>
                                                                            <div className="text-sm text-gray-600">{activity.description}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-sm font-semibold text-blue-600">{activity.points} pts</div>
                                                                        <div className="text-xs text-gray-500">{activity.duration_minutes}min</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                    <button
                                        onClick={() => setActiveTab('input')}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                                    >
                                        ← Voltar ao Editor
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isLoading}
                                        className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Criando Curso...
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">✅</span>
                                                Confirmar e Criar Curso
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Result Tab */}
                    {activeTab === 'result' && result && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <span className="mr-3">🎉</span>
                                    Curso Criado com Sucesso!
                                </h2>
                                <p className="text-gray-600 mt-1">Seu curso foi gerado pela IA e está pronto para uso</p>
                            </div>

                            <div className="p-8 text-center">
                                <div className="text-6xl mb-4">🚀</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{result.course?.title}</h3>
                                <p className="text-gray-600 mb-6">
                                    Curso criado com {result.preview?.activities_count || 0} atividades e {result.preview?.badges_count || 0} badges
                                </p>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                                    <h4 className="font-semibold text-green-800 mb-2">✅ O que foi criado:</h4>
                                    <ul className="text-green-700 space-y-1">
                                        <li>• Estrutura completa do curso com módulos organizados</li>
                                        <li>• Atividades variadas (quizzes, leituras, exercícios)</li>
                                        <li>• Sistema de pontuação e badges</li>
                                        <li>• Conteúdo baseado no material fornecido</li>
                                    </ul>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                    <p className="text-blue-800">
                                        <strong>Próximos passos:</strong> Você será redirecionado para o editor do curso 
                                        onde poderá fazer ajustes finais antes de publicar.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={resetForm}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                                    >
                                        🔄 Criar Outro Curso
                                    </button>
                                    <button
                                        onClick={() => router.visit(`/instructor/courses/${result.course.id}/edit`)}
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                                    >
                                        ✏️ Editar Curso Agora
                                    </button>
                                </div>

                                <div className="mt-4 text-sm text-gray-500">
                                    Redirecionamento automático em 3 segundos...
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}