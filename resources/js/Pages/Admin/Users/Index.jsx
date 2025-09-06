import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index(props) {
    // Debug: Log what props we receive
    console.log('User Index Props:', props);
    
    // Safe extraction with defaults
    const auth = props.auth || {};
    const user = auth.user || {};
    const users = props.users || [];
    const stats = props.stats || {};
    const filters = props.filters || {};
    
    // Search and filter states
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [showDebug, setShowDebug] = useState(false);
    
    // Convert users to array if it's an object with data property
    let usersList = [];
    if (Array.isArray(users)) {
        usersList = users;
    } else if (users.data && Array.isArray(users.data)) {
        usersList = users.data;
    }
    
    console.log('Users List:', usersList);
    
    // Handle search and filters - Real-time filtering
    const handleSearch = () => {
        router.get(route('admin.users.index'), {
            search: search.trim(),
            role,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    
    // Auto-search on input change with debounce
    const [searchTimeout, setSearchTimeout] = useState(null);
    const handleSearchInput = (value) => {
        setSearch(value);
        
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        const timeout = setTimeout(() => {
            router.get(route('admin.users.index'), {
                search: value.trim(),
                role,
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 500); // 500ms debounce
        
        setSearchTimeout(timeout);
    };
    
    // Handle role filter change
    const handleRoleChange = (newRole) => {
        setRole(newRole);
        router.get(route('admin.users.index'), {
            search: search.trim(),
            role: newRole,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    
    const handleClear = () => {
        setSearch('');
        setRole('');
        router.get(route('admin.users.index'));
    };
    
    const handleDelete = (userId, userName) => {
        if (confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) {
            router.delete(route('admin.users.destroy', userId), {
                onSuccess: () => {
                    // Optionally show a success message
                }
            });
        }
    };
    
    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        👥 Gerenciamento de Usuários
                    </h2>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowDebug(!showDebug)}
                            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                        >
                            {showDebug ? 'Ocultar Debug' : 'Mostrar Debug'}
                        </button>
                        <Link
                            href={route('admin.users.create')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            + Novo Usuário
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Usuários" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Debug Info - Toggleable */}
                    {showDebug && (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                            <p><strong>Debug Info:</strong></p>
                            <p>Total Users: {usersList.length}</p>
                            <p>Stats Total: {stats.total || 'undefined'}</p>
                            <p>Auth User: {user.name || 'undefined'}</p>
                            <p>Search: {filters.search || 'empty'}</p>
                            <p>Role Filter: {filters.role || 'empty'}</p>
                        </div>
                    )}
                    
                    {/* Search and Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pesquisar por nome ou email
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => handleSearchInput(e.target.value)}
                                            placeholder="Digite nome ou email..."
                                            className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Filtrar por papel
                                    </label>
                                    <select
                                        value={role}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Todos os papéis</option>
                                        <option value="admin">👑 Admin</option>
                                        <option value="instructor">👨‍🏫 Instrutor</option>
                                        <option value="student">🎓 Estudante</option>
                                    </select>
                                </div>
                                
                                <div className="flex items-end space-x-2">
                                    <button
                                        onClick={handleSearch}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition inline-flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Buscar
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition inline-flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Limpar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Simple Stats */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Estatísticas</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {stats.total || usersList.length || 0}
                                    </div>
                                    <div className="text-sm text-gray-500">Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {stats.students || 0}
                                    </div>
                                    <div className="text-sm text-gray-500">Estudantes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {stats.instructors || 0}
                                    </div>
                                    <div className="text-sm text-gray-500">Instrutores</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {stats.admins || 0}
                                    </div>
                                    <div className="text-sm text-gray-500">Admins</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simple Users List */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Lista de Usuários</h3>
                            
                            {usersList.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Nenhum usuário encontrado.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Nome
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Papel
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Pontos
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Ações
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {usersList.map((userItem, index) => {
                                                // Safe extraction for each user
                                                const userId = userItem.id || index;
                                                const userName = userItem.name || 'N/A';
                                                const userEmail = userItem.email || 'N/A';
                                                const userRole = userItem.role || 'N/A';
                                                const userPoints = userItem.total_points || 0;
                                                
                                                return (
                                                    <tr key={userId}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {userId}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {userName}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {userEmail}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                userRole === 'admin' ? 'bg-red-100 text-red-800' :
                                                                userRole === 'instructor' ? 'bg-purple-100 text-purple-800' : 
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                                {userRole === 'admin' ? '👑 Admin' :
                                                                 userRole === 'instructor' ? '👨‍🏫 Instrutor' : 
                                                                 '🎓 Estudante'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            ⭐ {userPoints}
                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <Link
                                                                    href={route('admin.users.show', userId)}
                                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                                    title="Ver detalhes"
                                                                >
                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                    Ver
                                                                </Link>
                                                                <Link
                                                                    href={route('admin.users.edit', userId)}
                                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                                                                    title="Editar usuário"
                                                                >
                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                    Editar
                                                                </Link>
                                                                {userId !== user.id && (
                                                                    <button
                                                                        onClick={() => handleDelete(userId, userName)}
                                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                                        title="Excluir usuário"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Excluir
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        
                        {/* Pagination */}
                        {users.links && users.links.length > 3 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {users.prev_page_url && (
                                        <Link
                                            href={users.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Anterior
                                        </Link>
                                    )}
                                    {users.next_page_url && (
                                        <Link
                                            href={users.next_page_url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Próximo
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Mostrando <span className="font-medium">{users.from || 0}</span> a{' '}
                                            <span className="font-medium">{users.to || 0}</span> de{' '}
                                            <span className="font-medium">{users.total || usersList.length}</span> resultados
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {users.links && users.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    } ${index === 0 ? 'rounded-l-md' : ''} ${
                                                        index === users.links.length - 1 ? 'rounded-r-md' : ''
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                </div>
            </div>
        </AuthenticatedLayout>
    );
}