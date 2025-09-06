import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ auth, user }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student',
        total_points: user.total_points || 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        ✏️ Editar Usuário: {user.name}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.users.show', user.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            👁️ Ver Perfil
                        </Link>
                        <Link
                            href={route('admin.users.index')}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            ← Voltar à Lista
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Editar: ${user.name}`} />

            <div className="py-8">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* User Info Card */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg mb-6">
                        <div className="p-6 bg-gray-50 border-b">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'instructor' ? 'bg-purple-100 text-purple-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {user.role === 'admin' ? '👑 Admin' :
                                             user.role === 'instructor' ? '👨‍🏫 Instrutor' : '🎓 Estudante'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                
                                {/* Name Field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                            errors.name ? 'border-red-500' : ''
                                        }`}
                                        placeholder="Ex: João da Silva"
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                            errors.email ? 'border-red-500' : ''
                                        }`}
                                        placeholder="usuario@exemplo.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Role Field */}
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                        Papel no Sistema
                                    </label>
                                    <select
                                        id="role"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                            errors.role ? 'border-red-500' : ''
                                        }`}
                                        disabled={user.id === auth.user.id} // Prevent changing own role
                                    >
                                        <option value="student">🎓 Estudante</option>
                                        <option value="instructor">👨‍🏫 Instrutor</option>
                                        <option value="admin">👑 Administrador</option>
                                    </select>
                                    {errors.role && (
                                        <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                                    )}
                                    {user.id === auth.user.id && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            Você não pode alterar seu próprio papel
                                        </p>
                                    )}
                                </div>

                                {/* Total Points Field - Only for students */}
                                {data.role === 'student' && (
                                    <div>
                                        <label htmlFor="total_points" className="block text-sm font-medium text-gray-700">
                                            Total de Pontos
                                        </label>
                                        <input
                                            type="number"
                                            id="total_points"
                                            min="0"
                                            value={data.total_points}
                                            onChange={(e) => setData('total_points', parseInt(e.target.value) || 0)}
                                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                                errors.total_points ? 'border-red-500' : ''
                                            }`}
                                            placeholder="0"
                                        />
                                        {errors.total_points && (
                                            <p className="mt-2 text-sm text-red-600">{errors.total_points}</p>
                                        )}
                                        <p className="mt-2 text-sm text-gray-500">
                                            ⚠️ Altere com cuidado - isso afetará o ranking do usuário
                                        </p>
                                    </div>
                                )}

                                {/* Warning Box */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div className="text-yellow-400 text-xl">⚠️</div>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                                Atenção ao editar usuários:
                                            </h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li>Alterações de papel podem afetar as permissões do usuário</li>
                                                    <li>Mudanças de pontos afetarão rankings e badges</li>
                                                    <li>Para alterar senhas, use o recurso de redefinição</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end space-x-4 pt-4">
                                    <Link
                                        href={route('admin.users.index')}
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`${
                                            processing
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        } text-white font-bold py-2 px-4 rounded transition flex items-center space-x-2`}
                                    >
                                        {processing && (
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        <span>{processing ? 'Salvando...' : '💾 Salvar Alterações'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}