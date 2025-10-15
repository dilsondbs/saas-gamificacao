import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function RegistrationStep4({ step1Data, step2Data, step3Data, planPrice, isFree, errors }) {
    const [showPreview, setShowPreview] = useState(false);
    const { post, processing } = useForm();

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('central.register.complete'), {
            onError: (errors) => {
                console.error('Registration errors:', errors);
            }
        });
    };

    const getPlanName = (plan) => {
        const plans = {
            'teste': 'Teste Gratuito',
            'basic': 'Básico',
            'premium': 'Premium',
            'enterprise': 'Empresarial'
        };
        return plans[plan] || plan;
    };

    if (processing) {
        return (
            <>
                <Head title="Criando sua Plataforma" />

                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                        <div className="text-center">
                            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                🚀 Criando sua plataforma...
                            </h2>

                            <p className="text-gray-600 mb-6">
                                Este processo pode levar alguns minutos. Por favor, não feche esta janela.
                            </p>

                            <div className="space-y-4">
                                <div className="text-left">
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <div className="animate-pulse h-2 w-2 bg-blue-500 rounded-full"></div>
                                        <span>Configurando banco de dados...</span>
                                    </div>
                                </div>

                                <div className="text-left">
                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                                        <span>Criando usuário administrador...</span>
                                    </div>
                                </div>

                                <div className="text-left">
                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                        <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                                        <span>Finalizando configuração...</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                <p className="text-xs text-blue-600">
                                    💡 Em breve você receberá os dados de acesso à sua plataforma
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Finalizar Registro" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">
                            🎯 Revisão Final
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Confira os dados da sua plataforma antes de finalizar
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-center space-x-2">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                ✓
                            </div>
                            <span className="ml-2 text-sm text-green-600">Dados Básicos</span>
                        </div>
                        <div className="w-8 h-0.5 bg-green-500"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                ✓
                            </div>
                            <span className="ml-2 text-sm text-green-600">Configuração</span>
                        </div>
                        <div className="w-8 h-0.5 bg-green-500"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                ✓
                            </div>
                            <span className="ml-2 text-sm text-green-600">Pagamento</span>
                        </div>
                        <div className="w-8 h-0.5 bg-blue-500"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                4
                            </div>
                            <span className="ml-2 text-sm text-blue-600 font-semibold">Finalização</span>
                        </div>
                    </div>

                    {/* Error Display */}
                    {errors && Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="font-medium text-red-900">Erro na criação da plataforma</h3>
                            </div>
                            <div className="mt-2">
                                {Object.values(errors).map((error, index) => (
                                    <p key={index} className="text-sm text-red-700">{error}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Summary Card */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                📋 Resumo da Plataforma
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">🏢 Dados da Empresa</h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p><strong>Nome:</strong> {step1Data.company_name}</p>
                                        <p><strong>Email:</strong> {step1Data.company_email}</p>
                                        <p><strong>Admin:</strong> {step1Data.admin_name}</p>
                                        <p><strong>Telefone:</strong> {step1Data.admin_phone}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">⚙️ Configuração</h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p><strong>Nome da Plataforma:</strong> {step2Data.tenant_name}</p>
                                        <p><strong>URL:</strong> {step2Data.tenant_slug}.saas-gamificacao.local</p>
                                        <p><strong>Descrição:</strong> {step2Data.tenant_description}</p>
                                        <div className="flex items-center space-x-2">
                                            <strong>Cor Principal:</strong>
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                style={{ backgroundColor: step2Data.primary_color }}
                                            ></div>
                                            <span>{step2Data.primary_color}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium text-gray-900">💳 Plano Selecionado</h3>
                                        <p className="text-sm text-gray-600">{getPlanName(step1Data.plan)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {isFree ? 'GRATUITO' : `R$ ${planPrice}`}
                                        </p>
                                        {!isFree && <p className="text-sm text-gray-600">por mês</p>}
                                    </div>
                                </div>
                            </div>

                            {!showPreview && (
                                <div className="pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(true)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Ver todos os detalhes ▼
                                    </button>
                                </div>
                            )}

                            {showPreview && (
                                <div className="pt-4 border-t border-gray-200 space-y-2">
                                    <h4 className="font-medium text-gray-900">📊 Detalhes Adicionais</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><strong>Setor:</strong> {step1Data.industry}</p>
                                        <p><strong>Usuários Esperados:</strong> {step1Data.expected_users}</p>
                                        {step2Data.custom_domain && (
                                            <p><strong>Domínio Personalizado:</strong> {step2Data.custom_domain}</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(false)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Ocultar detalhes ▲
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href={route('central.register.step3')}
                                className="flex-1 bg-gray-200 text-gray-700 text-center py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200 font-medium"
                            >
                                ← Voltar
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Criando Plataforma...
                                    </>
                                ) : (
                                    '🚀 Criar Minha Plataforma'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                            <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <h4 className="font-medium text-blue-900 mb-1">O que acontece agora?</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Criação da sua plataforma (1-2 minutos)</li>
                                    <li>• Configuração do banco de dados</li>
                                    <li>• Criação do usuário administrador</li>
                                    <li>• Envio dos dados de acesso</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}