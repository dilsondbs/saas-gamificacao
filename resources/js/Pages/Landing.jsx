import { Head, Link } from '@inertiajs/react';

export default function Landing({ canLogin, canRegister }) {
    return (
        <>
            <Head title="SaaS Gamificação - Plataforma de Aprendizado" />
            
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                {/* Navigation */}
                <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <h1 className="text-xl font-bold text-gray-900">
                                        SaaS Gamificação
                                    </h1>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/central-login"
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Admin Login
                                </Link>
                                <Link
                                    href="#pricing"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Ver Planos
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                            Nova versão - Transforme o aprendizado em
                            <span className="text-blue-600 block">uma jornada épica</span>
                        </h1>
                        
                        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
                            Plataforma completa de gamificação para empresas que querem 
                            revolucionar o treinamento e desenvolvimento de seus colaboradores.
                        </p>
                        
                        <div className="mt-10 flex justify-center gap-4">
                            <a
                                href="#pricing"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium shadow-lg transform hover:scale-105 transition"
                            >
                                Ver Planos e Preços
                            </a>
                            <a
                                href="#features"
                                className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-medium shadow-lg transform hover:scale-105 transition"
                            >
                                Saiba Mais
                            </a>
                        </div>
                    </div>
                    
                    {/* Features Section */}
                    <div id="features" className="mt-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Recursos Poderosos
                            </h2>
                            <p className="text-xl text-gray-600">
                                Tudo o que você precisa para gamificar o aprendizado
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🏆</span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Sistema de Pontos</h3>
                                <p className="text-gray-600">
                                    Ganhe pontos por atividades completadas e suba no ranking
                                </p>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🎖️</span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Badges & Conquistas</h3>
                                <p className="text-gray-600">
                                    Colecione badges exclusivos e mostre suas conquistas
                                </p>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">📚</span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Cursos Interativos</h3>
                                <p className="text-gray-600">
                                    Crie e gerencie cursos com quizzes, leituras e exercícios
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Pricing Section */}
                    <div id="pricing" className="mt-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Planos para Todos os Tamanhos
                            </h2>
                            <p className="text-xl text-gray-600">
                                Escolha o plano perfeito para sua empresa
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
                                <h3 className="text-xl font-semibold text-center mb-4">Básico</h3>
                                <div className="text-center mb-6">
                                    <span className="text-3xl font-bold">R$ 29</span>
                                    <span className="text-gray-600">/mês</span>
                                </div>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Até 10 usuários
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        5 cursos
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        100 MB storage
                                    </li>
                                </ul>
                                <Link
                                    href="/central-login"
                                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-center"
                                >
                                    Teste Grátis
                                </Link>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-500 relative">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">Mais Popular</span>
                                </div>
                                <h3 className="text-xl font-semibold text-center mb-4">Premium</h3>
                                <div className="text-center mb-6">
                                    <span className="text-3xl font-bold">R$ 99</span>
                                    <span className="text-gray-600">/mês</span>
                                </div>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Até 50 usuários
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        25 cursos
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        1 GB storage
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Relatórios avançados
                                    </li>
                                </ul>
                                <Link
                                    href="/central-login"
                                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-center"
                                >
                                    Começar Agora
                                </Link>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
                                <h3 className="text-xl font-semibold text-center mb-4">Enterprise</h3>
                                <div className="text-center mb-6">
                                    <span className="text-3xl font-bold">R$ 299</span>
                                    <span className="text-gray-600">/mês</span>
                                </div>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Até 200 usuários
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Cursos ilimitados
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        5 GB storage
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        API personalizada
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Suporte priority
                                    </li>
                                </ul>
                                <a
                                    href="mailto:contato@saas-gamificacao.com"
                                    className="block w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg font-medium text-center"
                                >
                                    Falar com Vendas
                                </a>
                            </div>
                        </div>
                    </div>
                </main>
                
                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-4">SaaS Gamificação</h3>
                            <p className="text-gray-400 mb-6">
                                Transformando o aprendizado através da gamificação
                            </p>
                            <div className="flex justify-center space-x-6">
                                <a href="#" className="text-gray-400 hover:text-white">Sobre</a>
                                <a href="#" className="text-gray-400 hover:text-white">Contato</a>
                                <a href="#" className="text-gray-400 hover:text-white">Suporte</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}