import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Landing({ auth, catalogPrices = {} }) {
    const [activeTab, setActiveTab] = useState('monthly');
    const [isVisible, setIsVisible] = useState({});
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Função para formatar preços
    const formatPrice = (plan, price) => {
        if (plan === 'teste' && price == 0) {
            return 'Grátis';
        }
        const numericPrice = parseFloat(price || 0);
        // Se o preço for um número inteiro, não mostrar casas decimais
        if (numericPrice % 1 === 0) {
            return `R$ ${numericPrice.toFixed(0)}`;
        }
        // Se tiver decimais, mostrar com 2 casas
        return `R$ ${numericPrice.toFixed(2).replace('.', ',')}`;
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsVisible(prev => ({
                        ...prev,
                        [entry.target.id]: entry.isIntersecting
                    }));
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach((el) => observer.observe(el));

        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        document.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            observer.disconnect();
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);
    return (
        <>
            <Head title="VemComigoJa - Plataforma de Gamificação Educacional" />
            
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
                            <img src="/images/logo.png" alt="VemComigoJa" className="w-16 h-16" />
                            <span className="font-bold text-xl text-gray-900">VemComigoJa</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Preços</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Cases</a>
                            {auth && auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/central-login"
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Entrar
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Começar Agora
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                            🚀 VemComigoJa - Gamificação que funciona: +300% de engajamento
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Transforme sua
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Educação </span>
                            com Gamificação
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Plataforma completa que revoluciona o aprendizado através de gamificação inteligente,
                            analytics avançado e experiências personalizadas que geram resultados reais para sua instituição.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/signup"
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                🎯 Começar Teste Grátis 7 Dias
                                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <button className="inline-flex items-center px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors">
                                📺 Ver Demo (2min)
                                <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div className="mt-8 text-sm text-gray-500">
                            ✅ Sem cartão de crédito • ✅ Setup em 2 minutos • ✅ Suporte 24/7
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl mb-2">👥</div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">50K+</div>
                            <div className="text-gray-600">Alunos Ativos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-2">📚</div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">1.2M+</div>
                            <div className="text-gray-600">Horas de Estudo</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-2">⭐</div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">95%</div>
                            <div className="text-gray-600">Satisfação</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-2">🚀</div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">300%</div>
                            <div className="text-gray-600">Mais Engajamento</div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50" data-animate>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Tecnologia que Gera Resultados Reais
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Recursos enterprise projetados para maximizar o engajamento e acelerar o aprendizado
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible['features'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Gamificação Inteligente</h3>
                            <p className="text-gray-600 leading-relaxed">Sistema de pontos, badges e rankings que aumenta o engajamento em até 300%</p>
                        </div>
                        <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible['features'] ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Avançado</h3>
                            <p className="text-gray-600 leading-relaxed">BI completo com insights em tempo real para tomada de decisão estratégica</p>
                        </div>
                        <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible['features'] ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
                            <div className="text-4xl mb-4">🚀</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Tenancy</h3>
                            <p className="text-gray-600 leading-relaxed">Arquitetura enterprise com isolamento total de dados e domínios personalizados</p>
                        </div>
                        <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible['features'] ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
                            <div className="text-4xl mb-4">🔒</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Segurança Enterprise</h3>
                            <p className="text-gray-600 leading-relaxed">Criptografia de ponta, backups automáticos e compliance com LGPD</p>
                        </div>
                        <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible['features'] ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '400ms' }}>
                            <div className="text-4xl mb-4">🎨</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">White-Label</h3>
                            <p className="text-gray-600 leading-relaxed">Personalize completamente com sua marca, cores e domínio exclusivo</p>
                        </div>
                        <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible['features'] ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '500ms' }}>
                            <div className="text-4xl mb-4">⚡</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Performance</h3>
                            <p className="text-gray-600 leading-relaxed">Infraestrutura cloud escalável com 99.9% de uptime garantido</p>
                        </div>
                    </div>
                </div>
            </section>
            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-white" data-animate>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Planos que Crescem com Você
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Escolha o plano ideal para sua instituição. Upgrade ou downgrade a qualquer momento.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* TESTE */}
                        <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="p-8">
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">TESTE</h3>
                                    <p className="text-sm text-gray-600 mb-4">Experimente grátis</p>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-gray-900">Grátis</span>
                                        <span className="text-gray-600">7 dias</span>
                                    </div>
                                    <p className="text-sm text-gray-600">Perfeito para testar todas as funcionalidades</p>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">1 usuário</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">1 curso</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">50MB de armazenamento</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Suporte básico</span>
                                    </li>
                                </ul>

                                <Link
                                    href="/signup?plan=teste"
                                    className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 block text-center bg-gray-100 text-gray-900 hover:bg-gray-200"
                                >
                                    Começar Teste Grátis
                                </Link>
                            </div>
                        </div>

                        {/* BÁSICO */}
                        <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="p-8">
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">BÁSICO</h3>
                                    <p className="text-sm text-gray-600 mb-4">Para pequenas instituições</p>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-gray-900">{formatPrice('basic', catalogPrices.basic || 19.90)}</span>
                                        <span className="text-gray-600">/mês</span>
                                    </div>
                                    <p className="text-sm text-gray-600">Ideal para escolas e cursos pequenos</p>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Até 50 usuários</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Até 10 cursos</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">1GB de armazenamento</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Suporte por email</span>
                                    </li>
                                </ul>

                                <Link
                                    href="/signup?plan=basic"
                                    className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 block text-center bg-gray-100 text-gray-900 hover:bg-gray-200"
                                >
                                    Escolher Básico
                                </Link>
                            </div>
                        </div>

                        {/* PREMIUM - Mais Popular */}
                        <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ring-2 ring-indigo-500 scale-105">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                                    ⭐ Mais Popular
                                </span>
                            </div>
                            
                            <div className="p-8">
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">PREMIUM</h3>
                                    <p className="text-sm text-gray-600 mb-4">Para instituições em crescimento</p>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-gray-900">{formatPrice('premium', catalogPrices.premium || 49.90)}</span>
                                        <span className="text-gray-600">/mês</span>
                                    </div>
                                    <p className="text-sm text-gray-600">Para instituições em crescimento</p>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Até 200 usuários</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Até 50 cursos</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">10GB de armazenamento</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">BI Analytics completo</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">API personalizada</span>
                                    </li>
                                </ul>

                                <Link
                                    href="/signup?plan=premium"
                                    className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 block text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                                >
                                    Escolher Premium
                                </Link>
                            </div>
                        </div>

                        {/* ENTERPRISE */}
                        <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="p-8">
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">ENTERPRISE</h3>
                                    <p className="text-sm text-gray-600 mb-4">Para grandes organizações</p>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-gray-900">{formatPrice('enterprise', catalogPrices.enterprise || 199.00)}</span>
                                        <span className="text-gray-600">/mês</span>
                                    </div>
                                    <p className="text-sm text-gray-600">Solução completa para grandes instituições</p>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Usuários ilimitados</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Cursos ilimitados</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">100GB de armazenamento</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">White-label completo</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Gerente dedicado</span>
                                    </li>
                                </ul>

                                <Link
                                    href="/signup?plan=enterprise"
                                    className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 block text-center bg-gray-100 text-gray-900 hover:bg-gray-200"
                                >
                                    Falar com Especialista
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">
                            💳 Aceita todos os cartões • 🔄 Cancele quando quiser • 📞 Suporte especializado
                        </p>
                        <div className="text-sm text-gray-500">
                            Processamento seguro via Stripe • Nota fiscal automática • 30 dias de garantia
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Resultados que Falam por Si
                        </h2>
                        <p className="text-xl text-gray-600">
                            Veja como outras instituições transformaram seus resultados
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-white font-bold text-lg">MS</span>
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Maria Silva</div>
                                    <div className="text-sm text-gray-600">Diretora Pedagógica</div>
                                    <div className="text-sm text-blue-600">Escola Inovação</div>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">"Transformou completamente nossa forma de ensinar. Os alunos estão 300% mais engajados!"</p>
                            <div className="flex text-yellow-400 mt-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-white font-bold text-lg">JS</span>
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">João Santos</div>
                                    <div className="text-sm text-gray-600">CEO</div>
                                    <div className="text-sm text-blue-600">TechEducar</div>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">"ROI de 400% em 6 meses. Melhor investimento que fizemos para nossa instituição."</p>
                            <div className="flex text-yellow-400 mt-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-white font-bold text-lg">AC</span>
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Ana Costa</div>
                                    <div className="text-sm text-gray-600">Coordenadora</div>
                                    <div className="text-sm text-blue-600">UniversiTech</div>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">"Sistema intuitivo e resultados impressionantes. Recomendo para qualquer instituição séria."</p>
                            <div className="flex text-yellow-400 mt-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Pronto para Revolucionar sua Educação?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Junte-se a milhares de educadores que já transformaram seus resultados
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            🚀 Começar Agora - 7 Dias Grátis
                        </Link>
                        <button className="inline-flex items-center px-6 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                            📞 Falar com Especialista
                        </button>
                    </div>
                    <div className="mt-6 text-blue-100 text-sm">
                        ✅ Setup em 2 minutos • ✅ Sem compromisso • ✅ Suporte incluído
                    </div>
                </div>
            </section>
            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <img src="/images/logo_para_fundo_escuro.png" alt="VemComigoJa" className="w-16 h-16" />
                                <span className="font-bold text-xl">VemComigoJa</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Transformando a educação através da gamificação inteligente
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Produto</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Empresa</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Suporte</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Segurança</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <p className="text-gray-400 text-sm">
                                © 2024 VemComigoJa. Todos os direitos reservados.
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm">Hospedagem confiável:</span>
                                <a href="https://app.hostbraza.com.br/aff.php?aff=6" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                    <img src="/images/hostbraza.png" alt="HostBraza - Hospedagem Confiável" className="h-6" />
                                </a>
                            </div>
                        </div>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                Privacidade
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                Termos
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                LGPD
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
            `}</style>
        </>
    );
}