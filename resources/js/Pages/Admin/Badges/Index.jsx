import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index(props) {
    // Debug: Log what props we receive
    console.log('Badges Index Props:', props);
    
    // Safe extraction with defaults
    const auth = props.auth || {};
    const user = auth.user || {};
    const badges = props.badges || {};
    const stats = props.stats || {};
    const filters = props.filters || {};
    
    // Convert badges to array if it's an object with data property
    let badgesList = [];
    if (Array.isArray(badges)) {
        badgesList = badges;
    } else if (badges.data && Array.isArray(badges.data)) {
        badgesList = badges.data;
    }
    
    console.log('Badges List:', badgesList);
    
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');

    const handleSearch = () => {
        router.get(route('admin.badges.index'), {
            search,
            type,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getTypeBadge = (badgeType) => {
        const badges = {
            completion: 'bg-green-100 text-green-800',
            points: 'bg-blue-100 text-blue-800',
            streak: 'bg-orange-100 text-orange-800',
            special: 'bg-purple-100 text-purple-800'
        };
        return badges[badgeType] || 'bg-gray-100 text-gray-800';
    };

    const getTypeIcon = (badgeType) => {
        const icons = {
            completion: '✅',
            points: '⭐',
            streak: '🔥',
            special: '👑'
        };
        return icons[badgeType] || '🏅';
    };

    const formatCriteria = (criteria) => {
        if (!criteria) return 'Nenhum critério definido';
        
        try {
            const criteriaObj = typeof criteria === 'string' ? JSON.parse(criteria) : criteria;
            const formatted = [];
            
            if (criteriaObj.courses_completed) {
                const count = criteriaObj.courses_completed;
                formatted.push(`Complete ${count} curso${count > 1 ? 's' : ''}`);
            }
            
            if (criteriaObj.points) {
                formatted.push(`Acumule ${criteriaObj.points} pontos`);
            }
            
            if (criteriaObj.streak_days) {
                const days = criteriaObj.streak_days;
                formatted.push(`Mantenha ${days} dia${days > 1 ? 's' : ''} consecutivos`);
            }
            
            if (criteriaObj.lessons_completed) {
                const count = criteriaObj.lessons_completed;
                formatted.push(`Complete ${count} lição${count > 1 ? 'ões' : ''}`);
            }
            
            if (criteriaObj.exercises_completed) {
                const count = criteriaObj.exercises_completed;
                formatted.push(`Complete ${count} exercício${count > 1 ? 's' : ''}`);
            }
            
            if (criteriaObj.login_streak) {
                const days = criteriaObj.login_streak;
                formatted.push(`Faça login por ${days} dia${days > 1 ? 's' : ''} seguidos`);
            }
            
            return formatted.length > 0 ? formatted.join(' • ') : 'Critério especial';
        } catch (e) {
            return 'Critério inválido';
        }
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        🏅 Gerenciamento de Badges
                    </h2>
                    <Link
                        href={route('admin.badges.create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        + Novo Badge
                    </Link>
                </div>
            }
        >
            <Head title="Gerenciar Badges" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="text-2xl">🏅</div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Total</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats?.total || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="text-2xl">✅</div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Ativos</p>
                                        <p className="text-2xl font-semibold text-green-600">{stats?.active || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="text-2xl">⭐</div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Inativos</p>
                                        <p className="text-2xl font-semibold text-blue-600">{stats?.inactive || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="text-2xl">👤</div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Conquistas</p>
                                        <p className="text-2xl font-semibold text-purple-600">{stats?.total_earned || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pesquisar</label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Nome do badge..."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Todos os tipos</option>
                                        <option value="completion">Conclusão</option>
                                        <option value="points">Pontos</option>
                                        <option value="streak">Sequência</option>
                                        <option value="special">Especial</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={handleSearch}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                                    >
                                        🔍 Buscar
                                    </button>
                                </div>

                                <div className="flex items-end">
                                    <Link
                                        href={route('admin.badges.index')}
                                        className="w-full text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                                    >
                                        🔄 Limpar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Badges Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {badgesList && badgesList.length > 0 ? badgesList.map((badge) => (
                            <div key={badge.id} className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-col space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                <div 
                                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0"
                                                    style={{ backgroundColor: badge.color || '#6B7280' }}
                                                >
                                                    🏅
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{badge?.name}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{badge?.description}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${getTypeBadge(badge.type)}`}>
                                                {getTypeIcon(badge.type)} {badge.type === 'completion' ? 'Conclusão' :
                                                 badge.type === 'points' ? 'Pontos' :
                                                 badge.type === 'streak' ? 'Sequência' : 'Especial'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                                        <div className="text-center sm:text-left">
                                            <p className="text-xs sm:text-sm font-medium text-gray-500">Valor em Pontos</p>
                                            <p className="text-sm sm:text-lg font-semibold text-indigo-600">⭐ {badge?.points_value || 0}</p>
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <p className="text-xs sm:text-sm font-medium text-gray-500">Conquistas</p>
                                            <p className="text-sm sm:text-lg font-semibold text-green-600">👤 {badge?.user_badges_count || badge?.users_count || 0}</p>
                                        </div>
                                    </div>

                                    {badge?.criteria && (
                                        <div className="mt-4">
                                            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Critérios:</p>
                                            <div className="bg-gray-50 rounded-md p-2 sm:p-3">
                                                <p className="text-xs sm:text-sm text-gray-700">
                                                    {formatCriteria(badge?.criteria)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                        <Link
                                            href={route('admin.badges.show', badge?.id)}
                                            className="flex-1 text-center bg-blue-50 text-blue-700 py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium hover:bg-blue-100 transition"
                                        >
                                            <span className="hidden sm:inline">👁️ Ver</span>
                                            <span className="sm:hidden">👁️</span>
                                        </Link>
                                        <Link
                                            href={route('admin.badges.edit', badge?.id)}
                                            className="flex-1 text-center bg-yellow-50 text-yellow-700 py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium hover:bg-yellow-100 transition"
                                        >
                                            <span className="hidden sm:inline">✏️ Editar</span>
                                            <span className="sm:hidden">✏️</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('Tem certeza que deseja excluir este badge?')) {
                                                    router.delete(route('admin.badges.destroy', badge?.id));
                                                }
                                            }}
                                            className="flex-1 bg-red-50 text-red-700 py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium hover:bg-red-100 transition"
                                        >
                                            <span className="hidden sm:inline">🗑️ Excluir</span>
                                            <span className="sm:hidden">🗑️</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-8 sm:py-12">
                                <div className="text-4xl sm:text-6xl mb-4">🏅</div>
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Nenhum badge encontrado</h3>
                                <p className="text-sm sm:text-base text-gray-500 px-4">Crie seu primeiro badge para começar a gamificação!</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}