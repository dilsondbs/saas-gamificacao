import { Head } from '@inertiajs/react';
import TenantBranding from '@/Components/TenantBranding';

export default function Homepage({ featuredCourses = [], stats = {}, tenant = null }) {
    return (
        <>
            <Head title="Cursos Online - Transforme seu conhecimento" />
            <TenantBranding tenant={tenant} />
            
            <div className="min-h-screen bg-gray-50 tenant-branded">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {tenant?.name || 'Plataforma de Cursos'}
                                </h1>
                            </div>
                            <nav className="hidden md:flex space-x-8">
                                <a href="/" className="text-gray-900 hover:text-primary">Início</a>
                                <a href="/cursos" className="text-gray-900 hover:text-primary">Cursos</a>
                                <a href="/login" className="text-gray-900 hover:text-primary">Login</a>
                                <a href="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-600">
                                    Cadastrar
                                </a>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                Transforme seu futuro com
                                <span className="block text-yellow-300">Conhecimento de qualidade</span>
                            </h1>
                            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                                Acesse cursos práticos e atualizados que vão acelerar sua carreira e realizar seus sonhos profissionais.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="/cursos" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition">
                                    Ver Todos os Cursos
                                </a>
                                <a href="/register" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition">
                                    Começar Agora
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-3xl font-bold text-primary">{stats.total_courses || 0}</div>
                                <div className="text-gray-600">Cursos Disponíveis</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary">{stats.total_students || 0}</div>
                                <div className="text-gray-600">Alunos Ativos</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary">{stats.total_instructors || 0}</div>
                                <div className="text-gray-600">Instrutores</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary">{stats.completion_rate || 0}%</div>
                                <div className="text-gray-600">Taxa de Conclusão</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Courses */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cursos em Destaque</h2>
                            <p className="text-lg text-gray-600">Os cursos mais procurados pelos nossos alunos</p>
                        </div>
                        
                        {featuredCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {featuredCourses.map((course) => (
                                    <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                                        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                                            <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm text-gray-500">por {course.instructor?.name}</span>
                                                    <div className="text-sm text-gray-500">{course.enrollments_count} alunos</div>
                                                </div>
                                                <a href={`/curso/${course.slug}`} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-600 transition">
                                                    Ver Curso
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">Nenhum curso disponível no momento.</p>
                            </div>
                        )}
                        
                        <div className="text-center mt-12">
                            <a href="/cursos" className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition">
                                Ver Todos os Cursos
                            </a>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher nossa plataforma?</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Conteúdo Prático</h3>
                                <p className="text-gray-600">Aprenda com projetos reais e aplicáveis no mercado de trabalho.</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Certificado de Conclusão</h3>
                                <p className="text-gray-600">Receba certificados reconhecidos para valorizar seu currículo.</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Suporte Especializado</h3>
                                <p className="text-gray-600">Tire suas dúvidas diretamente com instrutores experientes.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-primary text-white">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold mb-4">Pronto para começar sua jornada?</h2>
                        <p className="text-xl mb-8">
                            Junte-se a milhares de pessoas que já transformaram suas carreiras conosco.
                        </p>
                        <a href="/register" className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">
                            Começar Agora Gratuitamente
                        </a>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">{tenant?.name || 'Plataforma de Cursos'}</h3>
                                <p className="text-gray-400">
                                    Transformando vidas através da educação online de qualidade.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="/" className="hover:text-white transition">Início</a></li>
                                    <li><a href="/cursos" className="hover:text-white transition">Cursos</a></li>
                                    <li><a href="/login" className="hover:text-white transition">Login</a></li>
                                    <li><a href="/register" className="hover:text-white transition">Cadastrar</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Contato</h3>
                                <p className="text-gray-400">
                                    Email: contato@{tenant?.name?.toLowerCase() || 'plataforma'}.com
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>&copy; 2024 {tenant?.name || 'Plataforma de Cursos'}. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}