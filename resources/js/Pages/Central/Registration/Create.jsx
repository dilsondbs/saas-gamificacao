import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function RegistrationCreate({ selectedPlan, planDetails, allPlans, flash, step1_completed, step2_completed, step2_active, step3_active, step4_active, free_plan, step = 1 }) {
    const [currentStep, setCurrentStep] = useState(step4_active ? 4 : step3_active ? 3 : step2_active ? 2 : step);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        // Step 1: Company Information
        company_name: '',
        company_email: '',
        admin_name: '',
        admin_phone: '',
        plan: selectedPlan,
        industry: '',
        expected_users: '',
        
        // Step 2: Tenant Configuration
        tenant_name: '',
        tenant_slug: '',
        tenant_description: '',
        custom_domain: '',
        primary_color: '#3B82F6',
        logo_url: ''
    });

    const industries = [
        'Educação Superior',
        'Ensino Médio/Fundamental',
        'Cursos Profissionalizantes',
        'Cursos Online',
        'Treinamento Corporativo',
        'Consultoria',
        'Tecnologia',
        'Saúde',
        'Outros'
    ];

    // Função para formatar preços consistentemente
    const formatPrice = (price) => {
        if (price === 0) return 'Grátis';
        const numericPrice = parseFloat(price || 0);
        // Se o preço for um número inteiro, não mostrar casas decimais
        if (numericPrice % 1 === 0) {
            return `R$ ${numericPrice.toFixed(0)}`;
        }
        // Se tiver decimais, mostrar com 2 casas
        return `R$ ${numericPrice.toFixed(2).replace('.', ',')}`;
    };

    const steps = [
        { number: 1, title: 'Informações da Empresa', description: 'Dados básicos e seleção de plano' },
        { number: 2, title: 'Configuração do Tenant', description: 'Personalização e domínio' },
        { number: 3, title: 'Pagamento', description: 'Dados de cobrança (se aplicável)' },
        { number: 4, title: 'Confirmação', description: 'Revisão e finalização' }
    ];

    // Check for step completion from server responses
    useEffect(() => {
        if (step1_completed) {
            setCurrentStep(2);
            // Auto-generate suggested values for step 2
            if (formData.company_name && !formData.tenant_name) {
                setFormData(prev => ({
                    ...prev,
                    tenant_name: prev.company_name
                }));
            }
        }
        
        if (step2_completed) {
            if (free_plan) {
                setCurrentStep(4); // Skip payment for free plans
            } else {
                setCurrentStep(3);
            }
        }
    }, [step1_completed, step2_completed, free_plan]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const step1Data = {
            company_name: formData.company_name,
            company_email: formData.company_email,
            admin_name: formData.admin_name,
            admin_phone: formData.admin_phone,
            plan: formData.plan,
            industry: formData.industry,
            expected_users: formData.expected_users
        };

        router.post('/signup/step1', step1Data, {
            onSuccess: () => {
                // Success handled by server redirect
                console.log('Step 1 completed successfully');
            },
            onError: (errors) => {
                setErrors(errors);
                setLoading(false);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    const checkSlugAvailability = async (slug) => {
        if (!slug || slug.length < 3) return;

        try {
            const response = await fetch(`/central/api/check-slug?slug=${encodeURIComponent(slug)}`);
            const result = await response.json();
            
            if (!result.available) {
                setErrors(prev => ({
                    ...prev,
                    tenant_slug: result.message
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    tenant_slug: null
                }));
            }
        } catch (error) {
            console.error('Error checking slug:', error);
        }
    };

    const handleStep2Submit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const step2Data = {
            tenant_name: formData.tenant_name,
            tenant_slug: formData.tenant_slug,
            tenant_description: formData.tenant_description,
            custom_domain: formData.custom_domain,
            primary_color: formData.primary_color,
            logo_url: formData.logo_url
        };

        router.post('/signup/step2', step2Data, {
            onSuccess: () => {
                // Success handled by server redirect
                console.log('Step 2 completed successfully');
            },
            onError: (errors) => {
                setErrors(errors);
                setLoading(false);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    // selectedPlanDetails pode vir como objeto específico ou de dentro de allPlans
    const selectedPlanDetails = planDetails?.name ? planDetails : allPlans?.[formData.plan] || planDetails || {
        name: 'Plano Premium',
        price: 49.90,
        period: '/mês',
        tagline: 'Mais Popular',
        features: [
            'Até 100 usuários',
            'Cursos ilimitados',
            'Gamificação completa',
            'Relatórios avançados',
            'Suporte prioritário',
            'Integrações'
        ]
    };

    return (
        <>
            <Head title="Criar sua Conta - SaaS Gamificação" />
            
            {/* Header */}
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
                            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Já tem uma conta? Faça login
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
                                                step.number <= currentStep 
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'border-gray-300 bg-white text-gray-500'
                                            }`}>
                                                {step.number < currentStep ? (
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <span className="text-sm font-medium">{step.number}</span>
                                                )}
                                            </div>
                                            <div className="ml-4 hidden sm:block">
                                                <div className={`text-sm font-medium ${
                                                    step.number <= currentStep ? 'text-blue-600' : 'text-gray-500'
                                                }`}>
                                                    {step.title}
                                                </div>
                                                <div className="text-xs text-gray-500">{step.description}</div>
                                            </div>
                                        </div>
                                        {stepIdx !== steps.length - 1 && (
                                            <div className="hidden sm:block absolute top-5 left-10 w-full h-0.5 bg-gray-200" 
                                                 style={{
                                                     backgroundColor: step.number < currentStep ? '#2563eb' : '#e5e7eb'
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
                        <div className="grid md:grid-cols-3">
                            {/* Sidebar - Plan Summary */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 border-r border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Plano</h3>
                                
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl font-bold text-gray-900">{selectedPlanDetails?.name}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            formData.plan === 'premium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {selectedPlanDetails?.tagline}
                                        </span>
                                    </div>
                                    
                                    <div className="text-3xl font-bold text-gray-900 mb-4">
                                        {formatPrice(selectedPlanDetails?.price || (formData.plan === 'premium' ? 49.90 : formData.plan === 'basic' ? 19.90 : formData.plan === 'enterprise' ? 199.00 : 0))}
                                        <span className="text-lg text-gray-600 font-normal">{selectedPlanDetails?.period || '/mês'}</span>
                                    </div>

                                    <div className="space-y-2">
                                        {selectedPlanDetails?.features?.slice(0, 6)?.map((feature, idx) => (
                                            <div key={idx} className="flex items-center text-sm">
                                                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-600">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={() => setFormData(prev => ({ ...prev, showPlanSelector: true }))}
                                        className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        Alterar plano
                                    </button>
                                </div>

                                {/* Security badges */}
                                <div className="mt-6 space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        Dados protegidos com SSL
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Compliance LGPD
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Cancele quando quiser
                                    </div>
                                </div>
                            </div>

                            {/* Main Form */}
                            <div className="md:col-span-2 p-8">
                                {currentStep === 1 && (
                                    <div>
                                        <div className="mb-8">
                                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                                Informações da sua Empresa
                                            </h1>
                                            <p className="text-gray-600">
                                                Vamos começar com algumas informações básicas sobre sua instituição.
                                            </p>
                                        </div>

                                        {errors.general && (
                                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                                {errors.general}
                                            </div>
                                        )}

                                        <form onSubmit={handleStep1Submit} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nome da Empresa *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.company_name}
                                                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Ex: Escola Inovação"
                                                        required
                                                    />
                                                    {errors.company_name && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Email Administrativo *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={formData.company_email}
                                                        onChange={(e) => handleInputChange('company_email', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="admin@empresa.com"
                                                        required
                                                    />
                                                    {errors.company_email && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.company_email}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nome do Administrador *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.admin_name}
                                                        onChange={(e) => handleInputChange('admin_name', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="João Silva"
                                                        required
                                                    />
                                                    {errors.admin_name && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.admin_name}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Telefone
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={formData.admin_phone}
                                                        onChange={(e) => handleInputChange('admin_phone', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="(11) 99999-9999"
                                                    />
                                                    {errors.admin_phone && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.admin_phone}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Segmento/Área
                                                    </label>
                                                    <select
                                                        value={formData.industry}
                                                        onChange={(e) => handleInputChange('industry', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {industries.map(industry => (
                                                            <option key={industry} value={industry}>{industry}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Usuários Esperados
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.expected_users}
                                                        onChange={(e) => handleInputChange('expected_users', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Ex: 100"
                                                        min="1"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Quantos alunos/usuários você espera ter?
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between pt-6 border-t border-gray-200">
                                                <Link
                                                    href="/"
                                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Voltar
                                                </Link>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {loading ? 'Processando...' : 'Continuar'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div>
                                        <div className="mb-8">
                                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                                Configure seu Tenant
                                            </h1>
                                            <p className="text-gray-600">
                                                Personalize sua plataforma e defina como ela será acessada.
                                            </p>
                                        </div>

                                        {errors.general && (
                                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                                {errors.general}
                                            </div>
                                        )}

                                        <form onSubmit={handleStep2Submit} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nome da Plataforma *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.tenant_name}
                                                        onChange={(e) => handleInputChange('tenant_name', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Ex: Portal de Ensino da Escola Inovação"
                                                        required
                                                    />
                                                    {errors.tenant_name && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.tenant_name}</p>
                                                    )}
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Slug da URL *
                                                    </label>
                                                    <div className="flex">
                                                        <input
                                                            type="text"
                                                            value={formData.tenant_slug}
                                                            onChange={(e) => {
                                                                const slug = e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '');
                                                                handleInputChange('tenant_slug', slug);
                                                                checkSlugAvailability(slug);
                                                            }}
                                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="escola-inovacao"
                                                            required
                                                        />
                                                        <div className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 text-sm">
                                                            .saas-gamificacao.local
                                                        </div>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Sua plataforma será acessível em: http://{formData.tenant_slug || 'seu-slug'}.saas-gamificacao.local
                                                    </p>
                                                    {errors.tenant_slug && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.tenant_slug}</p>
                                                    )}
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Descrição da Plataforma
                                                    </label>
                                                    <textarea
                                                        value={formData.tenant_description}
                                                        onChange={(e) => handleInputChange('tenant_description', e.target.value)}
                                                        rows={3}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Descreva brevemente sua plataforma educacional..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Cor Principal
                                                    </label>
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="color"
                                                            value={formData.primary_color}
                                                            onChange={(e) => handleInputChange('primary_color', e.target.value)}
                                                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={formData.primary_color}
                                                            onChange={(e) => handleInputChange('primary_color', e.target.value)}
                                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="#3B82F6"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Logo URL (opcional)
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={formData.logo_url}
                                                        onChange={(e) => handleInputChange('logo_url', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="https://exemplo.com/logo.png"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-between pt-6 border-t border-gray-200">
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentStep(1)}
                                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Voltar
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {loading ? 'Processando...' : 'Continuar'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div>
                                        <div className="mb-8">
                                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                                Finalizar Pagamento
                                            </h1>
                                            <p className="text-gray-600">
                                                {formData.plan === 'teste' 
                                                    ? 'Confirme seus dados para ativar o teste gratuito.'
                                                    : 'Confirme seus dados e escolha a forma de pagamento.'
                                                }
                                            </p>
                                        </div>

                                        {formData.plan !== 'teste' && (
                                            <div className="space-y-8">
                                                {/* Payment Method */}
                                                <div className="bg-gray-50 p-6 rounded-lg">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                        Forma de Pagamento
                                                    </h3>
                                                    <div className="space-y-3">
                                                        <label className="flex items-center p-4 border-2 border-blue-500 bg-blue-50 rounded-lg cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="payment_method"
                                                                value="credit_card"
                                                                defaultChecked
                                                                className="w-4 h-4 text-blue-600"
                                                            />
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    💳 Cartão de Crédito
                                                                </div>
                                                                <div className="text-xs text-gray-600">
                                                                    Visa, Mastercard, Elo
                                                                </div>
                                                            </div>
                                                        </label>
                                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                                                            <input
                                                                type="radio"
                                                                name="payment_method"
                                                                value="pix"
                                                                className="w-4 h-4 text-blue-600"
                                                            />
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    📱 PIX
                                                                </div>
                                                                <div className="text-xs text-gray-600">
                                                                    Pagamento instantâneo
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Credit Card Form (conditional) */}
                                                <div className="space-y-4">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Número do Cartão
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="1234 5678 9012 3456"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Nome no Cartão
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="João Silva"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Validade
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="MM/AA"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                CVV
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="123"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Billing Address */}
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-medium text-gray-900">Endereço de Cobrança</h4>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Endereço
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="Rua, número, bairro"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Cidade
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="São Paulo"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                CEP
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="12345-678"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Terms and Privacy */}
                                        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                                            <label className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    required
                                                />
                                                <span className="ml-2 text-sm text-gray-700">
                                                    Eu concordo com os{' '}
                                                    <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                                                        Termos de Serviço
                                                    </a>{' '}
                                                    e{' '}
                                                    <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                                                        Política de Privacidade
                                                    </a>
                                                </span>
                                            </label>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-between mt-8">
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(2)}
                                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                ← Voltar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(4)}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                            >
                                                {formData.plan === 'teste' ? 'Ativar Teste Gratuito' : 'Processar Pagamento'} →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                            Tudo pronto para finalizar!
                                        </h2>
                                        <p className="text-gray-600 mb-8">
                                            {formData.plan === 'teste' 
                                                ? 'Seu teste gratuito será criado em instantes.'
                                                : 'Confirme os dados e finalize seu pedido.'
                                            }
                                        </p>
                                        <button
                                            onClick={() => {
                                                console.log('Clicou no botão Criar Minha Plataforma');
                                                // Debug log para ver dados antes de enviar
                                                console.log('Dados do formData:', formData);
                                                
                                                router.post('/signup/complete', {
                                                    plan: formData.plan || 'premium',
                                                    company_name: formData.company_name || 'Empresa Teste',
                                                    company_email: formData.company_email || 'teste@teste.com',
                                                    admin_name: formData.admin_name || 'Admin Teste',
                                                    industry: formData.industry || 'educacao',
                                                    expected_users: formData.expected_users || '50',
                                                    tenant_name: formData.tenant_name || 'Escola Teste',
                                                    tenant_slug: formData.tenant_slug || 'escola-teste-' + Date.now(),
                                                    tenant_description: formData.tenant_description || 'Escola de teste',
                                                    primary_color: formData.primary_color || '#3B82F6'
                                                }, {
                                                    onStart: () => console.log('Iniciando requisição...'),
                                                    onError: (errors) => console.error('Erro na requisição:', errors),
                                                    onSuccess: (response) => console.log('Sucesso:', response)
                                                });
                                            }}
                                            className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
                                        >
                                            🚀 Criar Minha Plataforma
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}