import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'student',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        ➕ Criar Novo Usuário
                    </h2>
                    <Link
                        href={route('admin.users.index')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        ← Voltar à Lista
                    </Link>
                </div>
            }
        >
            <Head title="Criar Usuário" />

            <div className="py-8">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
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
                                    >
                                        <option value="student">🎓 Estudante</option>
                                        <option value="instructor">👨‍🏫 Instrutor</option>
                                        <option value="admin">👑 Administrador</option>
                                    </select>
                                    {errors.role && (
                                        <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Senha
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                            errors.password ? 'border-red-500' : ''
                                        }`}
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                {/* Password Confirmation Field */}
                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                        Confirmar Senha
                                    </label>
                                    <input
                                        type="password"
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                            errors.password_confirmation ? 'border-red-500' : ''
                                        }`}
                                        placeholder="Digite a senha novamente"
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div className="text-blue-400 text-xl">💡</div>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-blue-800">
                                                Informações sobre os papéis:
                                            </h3>
                                            <div className="mt-2 text-sm text-blue-700">
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li><strong>Estudante:</strong> Pode se matricular em cursos e fazer atividades</li>
                                                    <li><strong>Instrutor:</strong> Pode criar e gerenciar cursos</li>
                                                    <li><strong>Admin:</strong> Acesso total ao sistema</li>
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
                                        <span>{processing ? 'Criando...' : '✅ Criar Usuário'}</span>
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