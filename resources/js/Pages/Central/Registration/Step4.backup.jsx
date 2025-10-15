import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RegistrationStep4({ step1Data, step2Data, step3Data, planPrice, isFree, tenantInfo: initialTenantInfo, creation_id: initialCreationId }) {
    const [loading, setLoading] = useState(!!initialCreationId);
    const [completed, setCompleted] = useState(!!initialTenantInfo);
    const [tenantInfo, setTenantInfo] = useState(initialTenantInfo);
    const [creationId, setCreationId] = useState(initialCreationId);
    const [error, setError] = useState(null);
    const [timeoutReached, setTimeoutReached] = useState(false);
    const [creationSteps, setCreationSteps] = useState([
        { id: 'validating', name: 'Validando dados', status: 'pending' },
        { id: 'creating_database', name: 'Criando base de dados', status: 'pending' },
        { id: 'configuring_domain', name: 'Configurando domínio', status: 'pending' },
        { id: 'running_migrations', name: 'Executando migrações', status: 'pending' },
        { id: 'creating_admin', name: 'Criando usuário administrador', status: 'pending' },
        { id: 'seeding_data', name: 'Configurando dados iniciais', status: 'pending' },
        { id: 'health_check', name: 'Validando integridade', status: 'pending' }
    ]);

    const updateStepStatus = (stepId, status) => {
        setCreationSteps(prev => prev.map(step =>
            step.id === stepId ? { ...step, status } : step
        ));
    };

    // Polling function to check creation status
    const checkCreationStatus = async (creationId) => {
        try {
            // Add CSRF token to headers as a precaution
            const response = await axios.get(`/signup/creation-status/${creationId}`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                const status = response.data.status;

                // Update current step status
                if (status.current_step && status.status === 'running') {
                    updateStepStatus(status.current_step, 'processing');

                    // Mark previous steps as completed
                    const stepOrder = ['validating', 'creating_database', 'configuring_domain', 'running_migrations', 'creating_admin', 'seeding_data', 'health_check'];
                    const currentIndex = stepOrder.indexOf(status.current_step);

                    for (let i = 0; i < currentIndex; i++) {
                        updateStepStatus(stepOrder[i], 'completed');
                    }
                }

                if (status.status === 'completed') {
                    // Mark all steps as completed
                    creationSteps.forEach(step => {
                        updateStepStatus(step.id, 'completed');
                    });

                    // Check if result is already included in status
                    if (status.result) {
                        setTenantInfo(status.result);
                        setCompleted(true);
                        setLoading(false);
                        return;
                    }

                    // Fallback: Try to fetch result separately
                    try {
                        const finalResult = await axios.get(`/api/tenant-creation-result/${creationId}`, {
                            headers: {
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        });
                        if (finalResult.data.success) {
                            setTenantInfo(finalResult.data.result);
                            setCompleted(true);
                            setLoading(false);
                            return;
                        }
                    } catch (e) {
                        console.warn('Could not fetch final result:', e);
                    }

                    // Last fallback: redirect with created parameter
                    window.location.href = `/signup/step4?created=true&slug=${step2Data.tenant_slug}`;
                    return;
                }

                if (status.status === 'failed') {
                    setError(status.message || 'Erro na criação da plataforma');
                    setLoading(false);
                    return;
                }

                // Continue polling if still running or started
                if (status.status === 'running' || status.status === 'started') {
                    setTimeout(() => checkCreationStatus(creationId), 2000); // Poll every 2 seconds
                }
            } else {
                setError('Erro ao verificar status da criação');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error checking creation status:', error);

            // Enhanced error logging for debugging
            if (error.response) {
                console.error('Error response status:', error.response.status);
                console.error('Error response data:', error.response.data);

                if (error.response.status === 419) {
                    setError('Erro de segurança (CSRF). Recarregue a página e tente novamente.');
                } else {
                    setError(`Erro do servidor (${error.response.status}): ${error.response.data?.message || 'Erro desconhecido'}`);
                }
            } else if (error.request) {
                console.error('Error request:', error.request);
                setError('Erro de rede. Verifique sua conexão.');
            } else {
                console.error('Error message:', error.message);
                setError('Erro de comunicação com servidor');
            }

            setLoading(false);
        }
    };

    // Auto-start polling when creation_id is provided on mount (from redirect)
    useEffect(() => {
        if (creationId && !completed) {
            console.log('Starting auto-polling for creation_id:', creationId);
            setLoading(true);
            setError(null);
            checkCreationStatus(creationId);
        }
    }, [creationId]); // Only run when creationId changes (on mount/redirect)

    // Timeout handler
    useEffect(() => {
        if (loading && creationId) {
            const timeoutId = setTimeout(() => {
                setTimeoutReached(true);
                setError('Tempo limite excedido. A criação pode ainda estar em andamento. Verifique seu email ou tente acessar a plataforma em alguns minutos.');
            }, 120000); // 2 minutes timeout

            return () => clearTimeout(timeoutId);
        }
    }, [loading, creationId]);

    const handleComplete = () => {
        setLoading(true);
        setError(null);
        setTimeoutReached(false);

        // Use Inertia form POST (will redirect to step4 with creation_id)
        router.post('/signup/start-creation', {}, {
            onError: (errors) => {
                console.error('Error starting creation:', errors);
                setError('Erro ao iniciar criação. Tente novamente.');
                setLoading(false);
            },
            onSuccess: () => {
                // Controller will redirect to step4 with creation_id
                // Page will reload with creation_id parameter
            }
        });
    };

    const handleRetry = () => {
        setError(null);
        setTimeoutReached(false);
        setCreationId(null);
        setCreationSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
        handleComplete();
    };

    const steps = [
        { number: 1, title: 'Informações da Empresa', completed: true },
        { number: 2, title: 'Configuração do Tenant', completed: true },
        { number: 3, title: 'Pagamento', completed: !isFree },
        { number: 4, title: 'Confirmação', active: true }
    ];

    if (completed && tenantInfo) {
        return (
            <>
                <Head title="Tenant Criado com Sucesso!" />
                
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
                    {/* Confetti Animation */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className={`absolute w-3 h-3 ${
                                    ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5]
                                } rounded-full animate-bounce opacity-70`}
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${2 + Math.random() * 2}s`
                                }}
                            />
                        ))}
                    </div>
                    
                    <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                                🎉 Plataforma Criada com Sucesso!
                            </h1>
                            
                            <p className="text-gray-600 mb-8">
                                Sua plataforma de gamificação educacional está pronta para uso!
                            </p>
                            
                            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                                <h3 className="font-semibold text-gray-900 mb-4">Informações de Acesso:</h3>
                                
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">URL da Plataforma:</span>
                                        <div className="mt-1">
                                            <a 
                                                href={tenantInfo.login_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 font-mono text-sm break-all"
                                            >
                                                {tenantInfo.login_url}
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Email de Login:</span>
                                        <div className="mt-1 font-mono text-sm text-gray-900">
                                            {tenantInfo.credentials.email}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Senha Temporária:</span>
                                        <div className="mt-1 font-mono text-sm text-gray-900">
                                            {tenantInfo.credentials.password}
                                        </div>
                                        <p className="text-xs text-orange-600 mt-1">
                                            ⚠️ Altere sua senha após o primeiro login
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">📧 Próximos Passos</h4>
                                    <ul className="text-sm text-blue-800 space-y-1 text-left">
                                        <li>• Altere sua senha no primeiro login</li>
                                        <li>• Configure seu perfil de administrador</li>
                                        <li>• Crie seus primeiros cursos</li>
                                        <li>• Convide instrutores e alunos</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-purple-900 mb-2">🚀 Recursos Disponíveis</h4>
                                    <ul className="text-sm text-purple-800 space-y-1 text-left">
                                        <li>• Sistema de gamificação</li>
                                        <li>• Gerenciamento de cursos</li>
                                        <li>• Dashboard com analytics</li>
                                        <li>• Suporte técnico incluído</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href={tenantInfo.login_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-center font-bold text-lg shadow-lg transform hover:scale-105 overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center">
                                        🔑 Acessar Minha Plataforma
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </a>
                                
                                <Link
                                    href="/"
                                    className="px-8 py-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 text-center transform hover:scale-105 hover:shadow-md"
                                >
                                    🏠 Voltar ao Início
                                </Link>
                            </div>
                            
                            {/* Animated celebration elements */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                                <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                                <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.7s'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Confirmação - Etapa 4" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <Link href="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">SG</span>
                                </div>
                                <span className="font-bold text-xl text-gray-900">SaaS Gamificação</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Progress Steps */}
                    <div className="mb-8">
                        <nav aria-label="Progress">
                            <ol className="flex items-center">
                                {steps.map((step, stepIdx) => (
                                    <li key={step.number} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                                        <div className="flex items-center">
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                                step.completed 
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : step.active
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'border-gray-300 bg-white text-gray-500'
                                            }`}>
                                                {step.completed ? (
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <span className="text-sm font-medium">{step.number}</span>
                                                )}
                                            </div>
                                            <div className="ml-4 hidden sm:block">
                                                <div className={`text-sm font-medium ${
                                                    step.completed || step.active ? 'text-blue-600' : 'text-gray-500'
                                                }`}>
                                                    {step.title}
                                                </div>
                                            </div>
                                        </div>
                                        {stepIdx !== steps.length - 1 && (
                                            <div className="hidden sm:block absolute top-5 left-10 w-full h-0.5" 
                                                 style={{
                                                     backgroundColor: step.completed ? '#2563eb' : '#e5e7eb'
                                                 }} 
                                            />
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Tudo pronto para finalizar!
                            </h2>
                            
                            <p className="text-gray-600 mb-8">
                                {isFree 
                                    ? 'Seu teste gratuito será criado em instantes.'
                                    : 'Confirme os dados e finalize seu pedido.'
                                }
                            </p>

                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
                                <h3 className="font-semibold text-gray-900 mb-4 text-center">Resumo do Pedido</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Empresa:</span>
                                        <span className="font-medium">{step1Data.company_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Plataforma:</span>
                                        <span className="font-medium">{step2Data.tenant_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">URL:</span>
                                        <span className="font-medium text-sm">{step2Data.tenant_slug}.saas-gamificacao.local</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Plano:</span>
                                        <span className="font-medium uppercase">{step1Data.plan}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-3">
                                        <span className="text-gray-600">Valor:</span>
                                        <span className="font-bold text-lg">
                                            {isFree ? 'Grátis' : `R$ ${planPrice}/mês`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {loading ? (
                                <div className="space-y-4">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="animate-spin w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Criando sua plataforma...</h3>
                                        <p className="text-gray-600">Este processo pode levar alguns minutos.</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="space-y-3">
                                            {creationSteps.map((step, index) => (
                                                <div key={step.id} className="flex items-center">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                                                        step.status === 'completed' ? 'bg-green-500 text-white' :
                                                        step.status === 'processing' ? 'bg-blue-500 text-white' :
                                                        'bg-gray-200 text-gray-500'
                                                    }`}>
                                                        {step.status === 'completed' ? (
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : step.status === 'processing' ? (
                                                            <svg className="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : (
                                                            <span className="text-xs">{index + 1}</span>
                                                        )}
                                                    </div>
                                                    <span className={`text-sm ${
                                                        step.status === 'completed' ? 'text-green-700 font-medium' :
                                                        step.status === 'processing' ? 'text-blue-700 font-medium' :
                                                        'text-gray-600'
                                                    }`}>
                                                        {step.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="space-y-4">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">
                                                    Erro na Criação da Plataforma
                                                </h3>
                                                <div className="mt-2 text-sm text-red-700">
                                                    <p>{error}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            onClick={handleRetry}
                                            className="relative px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                                        >
                                            🔄 Tentar Novamente
                                        </button>

                                        {timeoutReached && (
                                            <button
                                                onClick={() => window.location.href = '/signup/step2'}
                                                className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                                            >
                                                ← Voltar para Editar
                                            </button>
                                        )}

                                        <Link
                                            href="/"
                                            className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 text-center transform hover:scale-105"
                                        >
                                            🏠 Ir para Início
                                        </Link>
                                    </div>

                                    {timeoutReached && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-yellow-800">
                                                        Informação Importante
                                                    </h3>
                                                    <div className="mt-2 text-sm text-yellow-700">
                                                        <p>
                                                            Se o processo estava quase concluído, sua plataforma pode ter sido criada com sucesso.
                                                            Aguarde alguns minutos e tente acessar: <br/>
                                                            <strong className="font-mono text-xs">
                                                                http://{step2Data.tenant_slug}.saas-gamificacao.local:8000
                                                            </strong>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    disabled={loading}
                                    className="relative px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform hover:scale-105 overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center">
                                        🚀 Criar Minha Plataforma
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                                </button>
                            )}

                            <div className="flex justify-center mt-6">
                                <Link
                                    href={isFree ? "/signup/step2" : "/signup/step3"}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                                >
                                    ← Voltar para editar
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}