import { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function ChangePassword({ must_change }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showPasswords, setShowPasswords] = useState(false);

    useEffect(() => {
        return () => {
            reset('current_password', 'password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        put(route('password.change.update'));
    };

    return (
        <GuestLayout>
            <Head title="Alterar Senha" />

            <div className="mb-4 text-sm text-gray-600">
                {must_change ? (
                    <div className="p-4 mb-4 text-sm text-orange-800 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            <strong className="font-semibold">Senha Temporária Detectada!</strong>
                        </div>
                        <p className="mt-2">
                            Por motivos de segurança, você precisa alterar sua senha temporária antes de acessar a plataforma.
                        </p>
                    </div>
                ) : (
                    <p>Altere sua senha para manter sua conta segura.</p>
                )}
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="current_password" value="Senha Atual (Temporária)" />

                    <TextInput
                        id="current_password"
                        type={showPasswords ? 'text' : 'password'}
                        name="current_password"
                        value={data.current_password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        isFocused
                        onChange={(e) => setData('current_password', e.target.value)}
                        placeholder="Digite sua senha temporária"
                    />

                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Nova Senha" />

                    <TextInput
                        id="password"
                        type={showPasswords ? 'text' : 'password'}
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                    />

                    <InputError message={errors.password} className="mt-2" />

                    <p className="mt-1 text-xs text-gray-500">
                        Sua senha deve ter no mínimo 8 caracteres e incluir letras, números e caracteres especiais.
                    </p>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirmar Nova Senha" />

                    <TextInput
                        id="password_confirmation"
                        type={showPasswords ? 'text' : 'password'}
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="Digite a nova senha novamente"
                    />

                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center">
                    <input
                        type="checkbox"
                        id="show_passwords"
                        checked={showPasswords}
                        onChange={(e) => setShowPasswords(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                    />
                    <label htmlFor="show_passwords" className="ml-2 text-sm text-gray-600 cursor-pointer">
                        Mostrar senhas
                    </label>
                </div>

                <div className="flex items-center justify-end mt-6">
                    <PrimaryButton className="w-full justify-center" disabled={processing}>
                        {processing ? 'Alterando...' : 'Alterar Senha'}
                    </PrimaryButton>
                </div>

                {must_change && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Dica:</strong> Escolha uma senha forte e única que você não usa em outros sites.
                        </p>
                    </div>
                )}
            </form>
        </GuestLayout>
    );
}