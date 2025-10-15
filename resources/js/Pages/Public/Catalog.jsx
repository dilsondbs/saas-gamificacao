import { Head } from '@inertiajs/react';
import { useState } from 'react';
import TenantBranding from '@/Components/TenantBranding';

export default function Catalog({ courses, filters = {}, tenant = null }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort || 'popular');

    const handleSearch = (e) => {
        e.preventDefault();
        window.location.href = `/cursos?search=${encodeURIComponent(searchTerm)}&sort=${sortBy}`;
    };

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        window.location.href = `/cursos?search=${encodeURIComponent(searchTerm)}&sort=${newSort}`;
    };

    return (
        <>
            <Head title="Catálogo de Cursos" />
            <TenantBranding tenant={tenant} />
            
            <div className="min-h-screen bg-gray-50 tenant-branded">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center">
                                <a href="/" className="text-2xl font-bold text-gray-900 hover:text-primary">
                                    {tenant?.name || 'Plataforma de Cursos'}
                                </a>
                            </div>
                            <nav className="hidden md:flex space-x-8">
                                <a href="/" className="text-gray-900 hover:text-primary">Início</a>
                                <a href="/cursos" className="text-primary font-medium">Cursos</a>
                                <a href="/login" className="text-gray-900 hover:text-primary">Login</a>
                                <a href="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-600">
                                    Cadastrar
                                </a>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Page Header */}
                <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-4">Catálogo de Cursos</h1>
                            <p className="text-xl">Descubra o curso perfeito para acelerar sua carreira</p>
                        </div>
                    </div>
                </section>

                {/* Search and Filters */}
                <section className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar cursos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </form>

                            {/* Sort */}
                            <div className="flex items-center gap-2">
                                <span className="text-gray-700">Ordenar por:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="popular">Mais Popular</option>
                                    <option value="newest">Mais Recente</option>
                                    <option value="name">Nome A-Z</option>
                                </select>
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="mt-4 text-gray-600">
                            {courses.data && (
                                <p>
                                    Exibindo {courses.data.length} de {courses.total} cursos
                                    {filters.search && ` para "${filters.search}"`}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Courses Grid */}
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {courses.data && courses.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {courses.data.map((course) => (
                                        <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                                            <div className="p-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                                                
                                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                    <span>por {course.instructor?.name}</span>
                                                    <span>{course.enrollments_count} alunos</span>
                                                </div>

                                                {course.activities_count > 0 && (
                                                    <div className="text-sm text-gray-500 mb-4">
                                                        {course.activities_count} atividades
                                                    </div>
                                                )}

                                                <a 
                                                    href={`/curso/${course.slug}`} 
                                                    className="block w-full bg-primary text-white text-center py-2 rounded-md hover:bg-primary-600 transition-colors duration-200"
                                                >
                                                    Ver Detalhes
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {courses.last_page > 1 && (
                                    <div className="mt-12 flex justify-center">
                                        <nav className="flex items-center space-x-2">
                                            {courses.prev_page_url && (
                                                <a 
                                                    href={courses.prev_page_url} 
                                                    className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                                >
                                                    Anterior
                                                </a>
                                            )}

                                            {Array.from({ length: courses.last_page }, (_, i) => i + 1).map((page) => (
                                                <a
                                                    key={page}
                                                    href={`?page=${page}&search=${encodeURIComponent(searchTerm)}&sort=${sortBy}`}
                                                    className={`px-3 py-2 border rounded-md ${
                                                        page === courses.current_page
                                                            ? 'bg-primary text-white border-primary'
                                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </a>
                                            ))}

                                            {courses.next_page_url && (
                                                <a 
                                                    href={courses.next_page_url} 
                                                    className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                                >
                                                    Próximo
                                                </a>
                                            )}
                                        </nav>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* No Results */
                            <div className="text-center py-16">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.084-2.334.414-.056.858-.087 1.334-.087.221 0 .426.018.626.05z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum curso encontrado</h3>
                                <p className="text-gray-500 mb-6">
                                    {filters.search 
                                        ? `Não encontramos cursos para "${filters.search}". Tente outros termos de busca.`
                                        : 'Não há cursos disponíveis no momento.'
                                    }
                                </p>
                                {filters.search && (
                                    <a href="/cursos" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-600">
                                        Ver Todos os Cursos
                                    </a>
                                )}
                            </div>
                        )}
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