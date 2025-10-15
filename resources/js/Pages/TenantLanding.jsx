import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function TenantLanding({ tenantInfo = {}, auth }) {
    const [isVisible, setIsVisible] = useState({});

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

        return () => observer.disconnect();
    }, []);

    const schoolName = tenantInfo?.name || tenantInfo?.domain || 'Nossa Escola';
    const schoolDomain = tenantInfo?.domain || '';

    return (
        <>
            <Head title={`${schoolName} - Aprenda com Gamificação`} />

            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
                            <img src="/images/logo.png" alt="Logo" className="w-16 h-16" />
                            <span className="font-bold text-xl text-gray-900">{schoolName}</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#sobre" className="text-gray-600 hover:text-gray-900 transition-colors">Sobre</a>
                            <a href="#cursos" className="text-gray-600 hover:text-gray-900 transition-colors">Cursos</a>
                            <a href="#diferenciais" className="text-gray-600 hover:text-gray-900 transition-colors">Diferenciais</a>
                            {auth && auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Acessar Plataforma
                                </Link>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/login"
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Entrar
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Inscrever-se
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
                            🎓 Bem-vindo à {schoolName}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Transforme seu
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Aprendizado </span>
                            com Gamificação
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Plataforma educacional inovadora que torna o aprendizado divertido através de gamificação,
                            conquistas e competições saudáveis entre alunos.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {!auth?.user && (
                                <>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                    >
                                        🚀 Comece Agora Gratuitamente
                                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
                                    >
                                        🔑 Já tem conta? Entre aqui
                                    </Link>
                                </>
                            )}
                            {auth?.user && (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    🎯 Acessar Plataforma
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            )}
                        </div>
                        <div className="mt-8 text-sm text-gray-500">
                            ✅ Acesso imediato • ✅ Aprendizado gamificado • ✅ Suporte personalizado
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl mb-2">🎯</div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">+95%</div>
                            <div className="text-gray-600">Engajamento</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-2">📚</div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">+80%</div>
                            <div className="text-gray-600">Retenção</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-2">⭐</div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">+90%</div>
                            <div className="text-gray-600">Satisfação</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-2">🏆</div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">+70%</div>
                            <div className="text-gray-600">Performance</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="diferenciais" className="py-20 bg-gray-50" data-animate>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Por que Escolher Nossa Plataforma?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Diferenciais exclusivos que tornam seu aprendizado mais eficaz e envolvente
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible['diferenciais'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
                            <div className="text-4xl mb-4">🎮</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Aprendizado Gamificado</h3>
                            <p className="text-gray-600 leading-relaxed">Sistema de pontos, conquistas e rankings que torna o estudo divertido através da gamificação</p>
                        </div>
                        <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible['diferenciais'] ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Progresso em Tempo Real</h3>
                            <p className="text-gray-600 leading-relaxed">Acompanhe seu desenvolvimento com métricas detalhadas e insights personalizados</p>
                        </div>
                        <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible['diferenciais'] ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
                            <div className="text-4xl mb-4">🏆</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Conquistas e Medalhas</h3>
                            <p className="text-gray-600 leading-relaxed">Desbloqueie conquistas exclusivas e colecione medalhas especiais conforme avança nos estudos</p>
                        </div>
                        <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible['diferenciais'] ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
                            <div className="text-4xl mb-4">👥</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Competição Saudável</h3>
                            <p className="text-gray-600 leading-relaxed">Rankings e placares de líderes para motivar você a superar seus limites</p>
                        </div>
                        <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible['diferenciais'] ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '400ms' }}>
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Aprendizado Personalizado</h3>
                            <p className="text-gray-600 leading-relaxed">Conteúdo adaptado ao seu ritmo e estilo de aprendizagem único</p>
                        </div>
                        <div className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible['diferenciais'] ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '500ms' }}>
                            <div className="text-4xl mb-4">📱</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Acesso Multiplataforma</h3>
                            <p className="text-gray-600 leading-relaxed">Estude onde quiser: computador, tablet ou smartphone - sempre sincronizado</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="sobre" className="py-20 bg-white" data-animate>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Sobre a {schoolName}
                            </h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Somos uma instituição inovadora que combina metodologias educacionais comprovadas
                                com tecnologia de ponta para criar experiências de aprendizado únicas e eficazes.
                            </p>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Nossa plataforma gamificada transforma o processo de aprendizagem em uma jornada
                                envolvente, onde cada conquista é recompensada e cada desafio superado gera crescimento real.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">5⭐</div>
                                    <div className="text-sm text-gray-600">Avaliação Média</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">24/7</div>
                                    <div className="text-sm text-gray-600">Suporte Disponível</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
                                <div className="text-6xl mb-4">🎓</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Metodologia Comprovada</h3>
                                <p className="text-gray-600">
                                    Combinamos ciência da educação, gamificação e tecnologia para criar a experiência
                                    de aprendizado mais divertida e eficaz.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Preview Section */}
            <section id="cursos" className="py-20 bg-gray-50" data-animate>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Nossos Cursos
                        </h2>
                        <p className="text-xl text-gray-600">
                            Explore nossa biblioteca de cursos desenvolvidos por especialistas
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <div className="text-white text-center">
                                    <div className="text-4xl mb-2">💻</div>
                                    <h3 className="text-xl font-bold">Tecnologia</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 mb-4">
                                    Cursos de programação, desenvolvimento web, mobile e muito mais
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">12 cursos disponíveis</span>
                                    <span className="text-blue-600 font-semibold">Ver cursos →</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                <div className="text-white text-center">
                                    <div className="text-4xl mb-2">📊</div>
                                    <h3 className="text-xl font-bold">Negócios</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 mb-4">
                                    Empreendedorismo, gestão, marketing digital e estratégia empresarial
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">8 cursos disponíveis</span>
                                    <span className="text-green-600 font-semibold">Ver cursos →</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                <div className="text-white text-center">
                                    <div className="text-4xl mb-2">🎨</div>
                                    <h3 className="text-xl font-bold">Design</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 mb-4">
                                    Design gráfico, UX/UI, ilustração e criatividade digital
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">15 cursos disponíveis</span>
                                    <span className="text-purple-600 font-semibold">Ver cursos →</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        {!auth?.user && (
                            <Link
                                href="/register"
                                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                            >
                                🎯 Explore Todos os Cursos
                                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Pronto para Começar sua Jornada?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Junte-se a milhares de estudantes que já transformaram seu aprendizado
                    </p>
                    {!auth?.user && (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                🚀 Inscrever-se Agora
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center px-6 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                            >
                                🔑 Já tenho conta
                            </Link>
                        </div>
                    )}
                    {auth?.user && (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            🎯 Continuar Aprendendo
                        </Link>
                    )}
                    <div className="mt-6 text-blue-100 text-sm">
                        ✅ Acesso instantâneo • ✅ Certificação inclusa • ✅ Suporte especializado
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <img src="/images/logo.png" alt="Logo" className="w-16 h-16" />
                                <span className="font-bold text-xl">{schoolName}</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Transformando o aprendizado através da gamificação
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Cursos</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Tecnologia</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Negócios</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Design</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Todos os cursos</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Suporte</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Como Funciona</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Instituição</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Metodologia</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Certificações</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © 2024 {schoolName}. Todos os direitos reservados.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                Privacidade
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                Termos
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