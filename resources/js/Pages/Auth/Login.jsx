import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword, isCentral }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const handleOnChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const submit = (e) => {
        e.preventDefault();

        // Use central-login route if in central context, otherwise regular login
        const loginRoute = isCentral ? '/central-login' : route('login');
        post(loginRoute);
    };

    return (
        <GuestLayout>
            <Head title="Login - SaaS Gamificação" />

            {/* Header Section */}
            <div className="text-center mb-8">
                <div className="text-4xl mb-4">🎮</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Bem-vindo de volta!
                </h2>
                <p className="text-gray-600">
                    Acesse sua conta e continue sua jornada gamificada
                </p>
            </div>

            {status && <div className="mb-4 font-medium text-sm text-green-600 text-center bg-green-50 border border-green-200 rounded-lg p-3">{status}</div>}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={handleOnChange}
                        placeholder="seu@email.com"
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Senha" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={handleOnChange}
                        placeholder="Digite sua senha"
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox name="remember" value={data.remember} onChange={handleOnChange} />
                        <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
                    </label>
                    
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
                        >
                            Esqueceu a senha?
                        </Link>
                    )}
                </div>

                <div>
                    <PrimaryButton 
                        className="w-full justify-center py-3 text-lg" 
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <span className="inline-block animate-spin mr-2">⏳</span>
                                Entrando...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">🚀</span>
                                Entrar
                            </>
                        )}
                    </PrimaryButton>
                </div>

                {/* Register Link */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Ainda não tem uma conta?{' '}
                        <Link
                            href={route('register')}
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                        >
                            Criar conta grátis
                        </Link>
                    </p>
                </div>

                {/* Demo Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">
                        💡 Para demonstração:
                    </h3>
                    <div className="text-xs text-yellow-700 space-y-1">
                        <p><strong>Admin:</strong> admin@sistema.com / admin123</p>
                        <p><strong>Ou crie sua conta de estudante gratuitamente!</strong></p>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
