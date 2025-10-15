import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ isCentral }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const handleOnChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const submit = (e) => {
        e.preventDefault();

        // Use central register route if in central context, otherwise regular register
        const registerRoute = isCentral ? '/signup' : route('register');
        post(registerRoute);
    };

    return (
        <GuestLayout>
            <Head title="Criar Conta - SaaS Gamificação" />

            {/* Header Section */}
            <div className="text-center mb-8">
                <div className="text-4xl mb-4">🎓</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Bem-vindo ao SaaS Gamificação!
                </h2>
                <p className="text-gray-600">
                    Crie sua conta e comece sua jornada de aprendizado gamificada
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nome Completo" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={handleOnChange}
                        placeholder="Digite seu nome completo"
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
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
                        autoComplete="new-password"
                        onChange={handleOnChange}
                        placeholder="Mínimo 8 caracteres"
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmar Senha" />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={handleOnChange}
                        placeholder="Digite a senha novamente"
                        required
                    />

                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* Features Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">
                        🎯 O que você ganhará:
                    </h3>
                    <ul className="text-xs text-blue-700 space-y-1">
                        <li>✅ Acesso a cursos interativos</li>
                        <li>✅ Sistema de pontos e badges</li>
                        <li>✅ Ranking competitivo</li>
                        <li>✅ Quizzes gamificados</li>
                    </ul>
                </div>

                <div>
                    <PrimaryButton 
                        className="w-full justify-center py-3 text-lg" 
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <span className="inline-block animate-spin mr-2">⏳</span>
                                Criando conta...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">🚀</span>
                                Criar Minha Conta
                            </>
                        )}
                    </PrimaryButton>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Já tem uma conta?{' '}
                        <Link
                            href={isCentral ? '/login' : route('login')}
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                        >
                            Faça login aqui
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
