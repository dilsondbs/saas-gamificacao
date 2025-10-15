import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function RegistrationStep3({ step1Data, step2Data, planPrice, stripePublishableKey }) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
    
    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setPaymentStatus('processing');

        // Simulate payment processing with more realistic flow
        setTimeout(() => {
            // Simulate payment validation
            setPaymentStatus('validating');
        }, 800);

        setTimeout(() => {
            // Simulate bank authorization  
            setPaymentStatus('authorizing');
        }, 2000);

        setTimeout(() => {
            // Simulate success
            setPaymentStatus('success');
            setTimeout(() => {
                // Submit payment data to backend
                router.post('/signup/step3', {
                    payment_method: paymentMethod,
                    // Add other payment data as needed
                });
            }, 1500);
        }, 3500);
    };

    const steps = [
        { number: 1, title: 'Informações da Empresa', completed: true },
        { number: 2, title: 'Configuração do Tenant', completed: true },
        { number: 3, title: 'Pagamento', active: true },
        { number: 4, title: 'Confirmação', disabled: true }
    ];

    return (
        <>
            <Head title="Pagamento - Etapa 3" />
            
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
                        <div className="grid md:grid-cols-3">
                            {/* Sidebar - Order Summary */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 border-r border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Plano {step1Data.plan.toUpperCase()}</h4>
                                        <p className="text-sm text-gray-600">{step2Data.tenant_name}</p>
                                    </div>
                                    
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Valor mensal:</span>
                                            <span className="font-semibold">R$ {planPrice}</span>
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <span className="text-gray-600">Taxa de setup:</span>
                                            <span className="font-semibold text-green-600">Grátis</span>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total:</span>
                                            <span>R$ {planPrice}/mês</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        💳 Primeiro mês grátis para novos clientes
                                    </p>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="md:col-span-2 p-8">
                                <div className="mb-8">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        Informações de Pagamento
                                    </h1>
                                    <p className="text-gray-600">
                                        Configure sua forma de pagamento para começar a usar a plataforma.
                                    </p>
                                </div>

                                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                    {/* Payment Method Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Forma de Pagamento
                                        </label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="relative">
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value="credit_card"
                                                    checked={paymentMethod === 'credit_card'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="sr-only"
                                                />
                                                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                                    paymentMethod === 'credit_card' 
                                                        ? 'border-blue-500 bg-blue-50' 
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}>
                                                    <div className="flex items-center">
                                                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                                            paymentMethod === 'credit_card' 
                                                                ? 'border-blue-500 bg-blue-500' 
                                                                : 'border-gray-300'
                                                        }`}>
                                                            {paymentMethod === 'credit_card' && (
                                                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">Cartão de Crédito</div>
                                                            <div className="text-sm text-gray-500">Visa, Mastercard, American Express</div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-auto flex space-x-1">
                                                        <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                                                        <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Credit Card Form (placeholder for now) */}
                                    {paymentMethod === 'credit_card' && (
                                        <div className="space-y-4">
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
                                    )}

                                    {/* Security Notice */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm text-green-800">
                                                Seus dados de pagamento são protegidos com criptografia SSL de 256 bits
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-6 border-t border-gray-200">
                                        <Link
                                            href="/signup/step2"
                                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Voltar
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    {paymentStatus === 'processing' && 'Validando dados...'}
                                                    {paymentStatus === 'validating' && 'Verificando cartão...'}
                                                    {paymentStatus === 'authorizing' && 'Autorizando pagamento...'}
                                                    {paymentStatus === 'success' && '✅ Pagamento aprovado!'}
                                                </span>
                                            ) : (
                                                'Finalizar Pedido'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}