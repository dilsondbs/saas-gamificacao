import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function RegistrationStep2({ step1Data, suggestedSlug }) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        tenant_name: step1Data.company_name || '',
        tenant_slug: suggestedSlug || '',
        tenant_description: '',
        custom_domain: '',
        primary_color: '#3B82F6',
        logo_url: ''
    });

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

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log('🚀 Step2 form submission started', formData);
        setLoading(true);
        setErrors({});

        router.post('/signup/step2', formData, {
            onBefore: (visit) => {
                console.log('📤 About to send request to:', visit.url);
                console.log('📝 Form data being sent:', formData);
                return true;
            },
            onStart: (visit) => {
                console.log('🔄 Request started');
            },
            onProgress: (progress) => {
                console.log('⏳ Progress:', progress);
            },
            onSuccess: (page) => {
                console.log('✅ Step2 submitted successfully, received page:', page.component);
            },
            onError: (errors) => {
                console.error('❌ Step2 validation errors:', errors);
                setErrors(errors);
            },
            onFinish: () => {
                console.log('🏁 Request finished');
                setLoading(false);
            },
            preserveScroll: false,
            preserveState: false
        });
    };

    const steps = [
        { number: 1, title: 'Informações da Empresa', completed: true },
        { number: 2, title: 'Configuração do Tenant', active: true },
        { number: 3, title: 'Pagamento', disabled: true },
        { number: 4, title: 'Confirmação', disabled: true }
    ];

    return (
        <>
            <Head title="Configuração do Tenant - Etapa 2" />
            
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
                        <div className="p-8">
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

                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                    <Link
                                        href="/signup"
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
                    </div>
                </div>
            </div>
        </>
    );
}