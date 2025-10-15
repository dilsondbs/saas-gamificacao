import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function DashboardSimple({ auth, generalStats }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Admin (Simple)</h2>}
        >
            <Head title="Dashboard Admin" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-semibold mb-4">Estatísticas Gerais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900">Total de Usuários</h4>
                                    <p className="text-2xl font-bold text-blue-600">{generalStats?.totalUsers || 0}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-green-900">Total de Cursos</h4>
                                    <p className="text-2xl font-bold text-green-600">{generalStats?.totalCourses || 0}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-purple-900">Status</h4>
                                    <p className="text-sm text-purple-600">Sistema funcionando</p>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-yellow-900">Debug</h4>
                                    <p className="text-sm text-yellow-600">Dashboard simples</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}