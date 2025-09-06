import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ auth, badge, earned_users = [] }) {
    const handleDelete = () => {
        if (confirm(`Tem certeza que deseja excluir o badge "${badge.name}"?`)) {
            router.delete(route('admin.badges.destroy', badge.id));
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            completion: '✅',
            points: '⭐',
            streak: '🔥',
            special: '👑'
        };
        return icons[type] || '🏅';
    };

    const getTypeName = (type) => {
        const names = {
            completion: 'Conclusão',
            points: 'Pontos',
            streak: 'Sequência',
            special: 'Especial'
        };
        return names[type] || type;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        🏅 Badge: {badge.name}
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route('admin.badges.index')}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            ← Voltar
                        </Link>
                        <Link
                            href={route('admin.badges.edit', badge.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            ✏️ Editar
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Badge: ${badge.name}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Badge Info */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="flex items-start space-x-6">
                                <div 
                                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
                                    style={{ backgroundColor: badge.color || '#6B7280' }}
                                >
                                    {getTypeIcon(badge.type)}
                                </div>
                                
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{badge.name}</h1>
                                    <p className="text-lg text-gray-600 mb-4">{badge.description}</p>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                                            <div className="text-lg font-bold text-blue-600">{getTypeIcon(badge.type)}</div>
                                            <div className="text-sm text-blue-800">{getTypeName(badge.type)}</div>
                                        </div>
                                        
                                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                                            <div className="text-lg font-bold text-purple-600">⭐ {badge.points_value || 0}</div>
                                            <div className="text-sm text-purple-800">Pontos</div>
                                        </div>
                                        
                                        <div className="bg-green-50 p-3 rounded-lg text-center">
                                            <div className="text-lg font-bold text-green-600">{badge.earned_count || 0}</div>
                                            <div className="text-sm text-green-800">Conquistas</div>
                                        </div>
                                        
                                        <div className="bg-yellow-50 p-3 rounded-lg text-center">
                                            <div className="text-lg font-bold text-yellow-600">
                                                {badge.is_active ? '✅' : '❌'}
                                            </div>
                                            <div className="text-sm text-yellow-800">
                                                {badge.is_active ? 'Ativo' : 'Inativo'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Criteria */}
                    {badge.criteria && (
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Critérios para Conquista</h3>
                                
                                {badge.type === 'completion' && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-blue-800">
                                            <strong>Conclusão de Cursos:</strong> O usuário deve concluir{' '}
                                            <span className="font-bold">{badge.criteria.target_value || 1}</span>{' '}
                                            curso(s) para conquistar este badge.
                                        </p>
                                    </div>
                                )}

                                {badge.type === 'points' && (
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-purple-800">
                                            <strong>Acúmulo de Pontos:</strong> O usuário deve acumular{' '}
                                            <span className="font-bold">{badge.criteria.target_value || 100}</span>{' '}
                                            pontos para conquistar este badge.
                                        </p>
                                    </div>
                                )}

                                {badge.type === 'streak' && (
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <p className="text-orange-800">
                                            <strong>Sequência de Dias:</strong> O usuário deve acessar a plataforma por{' '}
                                            <span className="font-bold">{badge.criteria.target_value || 7}</span>{' '}
                                            dias consecutivos.
                                        </p>
                                    </div>
                                )}

                                {badge.type === 'special' && (
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                        <p className="text-yellow-800">
                                            <strong>Badge Especial:</strong>{' '}
                                            {badge.criteria.description || 'Badge concedido manualmente por administradores.'}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Critérios Completos (JSON):</p>
                                    <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto">
                                        {JSON.stringify(badge.criteria, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users who earned this badge */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Usuários que Conquistaram este Badge ({earned_users.length})
                            </h3>
                            
                            {earned_users.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conquistado em</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pontos Totais</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {earned_users.map((user, index) => (
                                                <tr key={user.id || index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                        {user.name || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500">
                                                        {user.email || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500">
                                                        {user.earned_at ? new Date(user.earned_at).toLocaleDateString('pt-BR') : 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500">
                                                        ⭐ {user.total_points || 0}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">🏅</div>
                                    <p className="text-gray-500">Nenhum usuário conquistou este badge ainda.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Badge Details */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes Técnicos</h3>
                            
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">ID do Badge</dt>
                                    <dd className="text-sm text-gray-900">{badge.id}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Cor</dt>
                                    <dd className="text-sm text-gray-900 flex items-center space-x-2">
                                        <div 
                                            className="w-4 h-4 rounded border"
                                            style={{ backgroundColor: badge.color }}
                                        ></div>
                                        <span>{badge.color}</span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Criado em</dt>
                                    <dd className="text-sm text-gray-900">
                                        {badge.created_at ? new Date(badge.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Atualizado em</dt>
                                    <dd className="text-sm text-gray-900">
                                        {badge.updated_at ? new Date(badge.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}