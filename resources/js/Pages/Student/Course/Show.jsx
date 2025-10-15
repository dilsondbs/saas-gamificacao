import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Show({ auth, course, activities, progress, enrollment }) {
    const [loading, setLoading] = useState(false);

    const handleStartActivity = (activity) => {
        setLoading(true);
        router.get(route('student.activities.show', activity.id));
    };

    const getActivityIcon = (type) => {
        const icons = {
            'lesson': '📚',
            'quiz': '❓',
            'video': '🎥',
            'reading': '📖',
            'assignment': '📝',
            'project': '🚀'
        };
        return icons[type] || '📄';
    };

    const getActivityStatus = (activity) => {
        if (activity.completed) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Concluído
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⏳ Pendente
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        📚 {course.title}
                    </h2>
                    <div className="text-sm text-gray-600">
                        Progresso: {progress.percentage}% ({progress.completed}/{progress.total})
                    </div>
                </div>
            }
        >
            <Head title={`${course.title} - Curso`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Course Info Card */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {course.title}
                                    </h1>
                                    <p className="text-gray-700 mb-4">
                                        {course.description}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <span className="mr-4">
                                            👨‍🏫 {course.instructor.name}
                                        </span>
                                        <span className="mr-4">
                                            📅 Matriculado em: {new Date(enrollment.enrolled_at).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span>
                                            📊 Status: {course.status === 'published' ? 'Publicado' : course.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                                <div
                                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${progress.percentage}%` }}
                                ></div>
                            </div>
                            <div className="text-sm text-gray-600">
                                {progress.completed} de {progress.total} atividades concluídas ({progress.percentage}%)
                            </div>
                        </div>
                    </div>

                    {/* Activities List */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                🎮 Atividades do Curso
                            </h3>

                            {activities && activities.length > 0 ? (
                                <div className="space-y-4">
                                    {activities.map((activity, index) => (
                                        <div
                                            key={activity.id}
                                            className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                                                activity.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-start flex-1">
                                                    <div className="flex-shrink-0 mr-4">
                                                        <span className="text-2xl">
                                                            {getActivityIcon(activity.type)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <span className="text-sm font-medium text-gray-500 mr-2">
                                                                #{activity.order}
                                                            </span>
                                                            <h4 className="text-lg font-semibold text-gray-900">
                                                                {activity.title}
                                                            </h4>
                                                        </div>
                                                        <p className="text-gray-600 mb-3">
                                                            {activity.description}
                                                        </p>
                                                        <div className="flex items-center space-x-4 text-sm">
                                                            <span className="text-gray-500">
                                                                📈 Tipo: {activity.type}
                                                            </span>
                                                            <span className="text-gray-500">
                                                                🎯 {activity.points} pontos
                                                            </span>
                                                            {activity.completed && activity.completed_at && (
                                                                <span className="text-gray-500">
                                                                    ✅ Concluído em: {new Date(activity.completed_at).toLocaleDateString('pt-BR')}
                                                                </span>
                                                            )}
                                                            {activity.score && (
                                                                <span className="text-gray-500">
                                                                    📊 Nota: {activity.score}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    {getActivityStatus(activity)}
                                                    <PrimaryButton
                                                        onClick={() => handleStartActivity(activity)}
                                                        disabled={loading}
                                                        className="whitespace-nowrap"
                                                    >
                                                        {activity.completed ? 'Revisar' : 'Continuar'}
                                                    </PrimaryButton>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-4">📚</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Nenhuma atividade disponível
                                    </h3>
                                    <p className="text-gray-500">
                                        Este curso ainda não possui atividades cadastradas.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Final Challenge Card */}
                    {progress.percentage === 100 && (
                        <div className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden shadow-lg sm:rounded-lg">
                            <div className="p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-3">
                                            <span className="text-4xl mr-3">🏆</span>
                                            <h3 className="text-2xl font-bold">
                                                Desafio Final Disponível!
                                            </h3>
                                        </div>
                                        <p className="text-purple-100 mb-4">
                                            Parabéns por completar todas as atividades! Agora você está pronto para o Desafio Final.
                                            Teste seus conhecimentos em 30 questões divididas em 3 níveis de dificuldade.
                                        </p>
                                        <div className="flex items-center space-x-6 text-sm text-purple-100">
                                            <span className="flex items-center">
                                                <span className="mr-2">📝</span>
                                                30 questões
                                            </span>
                                            <span className="flex items-center">
                                                <span className="mr-2">⏱️</span>
                                                3 níveis progressivos
                                            </span>
                                            <span className="flex items-center">
                                                <span className="mr-2">🎯</span>
                                                Desbloqueie conquistas
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-6">
                                        <Link href={route('student.challenge.show', course.id)}>
                                            <PrimaryButton className="bg-white text-purple-600 hover:bg-purple-50 font-bold py-3 px-6 text-lg">
                                                Iniciar Desafio Final →
                                            </PrimaryButton>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Back to Courses */}
                    <div className="mt-6">
                        <Link href={route('student.courses')}>
                            <SecondaryButton>
                                ← Voltar aos Meus Cursos
                            </SecondaryButton>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}