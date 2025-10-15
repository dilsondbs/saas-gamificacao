import { Head, Link } from '@inertiajs/react';

export default function RegistrationSuccess({ tenantInfo }) {
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copiado para a área de transferência!');
        });
    };

    return (
        <>
            <Head title="Plataforma Criada com Sucesso" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            🎉 Parabéns! Sua plataforma foi criada com sucesso!
                        </h1>
                        <p className="text-lg text-gray-600">
                            Sua plataforma <strong>{tenantInfo.tenant_name}</strong> está pronta para uso.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            📋 Informações de Acesso
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-blue-900 mb-2">🌐 URL da Plataforma</h3>
                                <div className="flex items-center space-x-2">
                                    <code className="bg-white px-2 py-1 rounded text-sm flex-1">
                                        {tenantInfo.access_url}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(tenantInfo.access_url)}
                                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                    >
                                        Copiar
                                    </button>
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-green-900 mb-2">📧 Email Admin</h3>
                                <div className="flex items-center space-x-2">
                                    <code className="bg-white px-2 py-1 rounded text-sm flex-1">
                                        {tenantInfo.admin_email}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(tenantInfo.admin_email)}
                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                    >
                                        Copiar
                                    </button>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-yellow-900 mb-2">🔑 Senha Temporária</h3>
                                <div className="flex items-center space-x-2">
                                    <code className="bg-white px-2 py-1 rounded text-sm flex-1">
                                        {tenantInfo.admin_password}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(tenantInfo.admin_password)}
                                        className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                                    >
                                        Copiar
                                    </button>
                                </div>
                                <p className="text-xs text-yellow-700 mt-1">
                                    ⚠️ Altere esta senha no primeiro acesso
                                </p>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-purple-900 mb-2">📦 Plano</h3>
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                                    {tenantInfo.plan.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">🚀 Próximos Passos</h3>
                            <ol className="space-y-2">
                                {tenantInfo.login_instructions.map((instruction, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium min-w-[24px] text-center">
                                            {index + 1}
                                        </span>
                                        <span className="text-gray-700 text-sm">{instruction}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <a
                                href={tenantInfo.access_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                            >
                                🌐 Acessar Minha Plataforma
                            </a>

                            <Link
                                href="/"
                                className="flex-1 bg-gray-200 text-gray-700 text-center py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200 font-medium"
                            >
                                🏠 Voltar ao Início
                            </Link>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                            <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <h4 className="font-medium text-blue-900 mb-1">💡 Dica Importante</h4>
                                <p className="text-sm text-blue-800">
                                    Para acessar sua plataforma, você precisa configurar o arquivo hosts do seu computador ou usar um domínio personalizado.
                                    Consulte a documentação para instruções detalhadas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}