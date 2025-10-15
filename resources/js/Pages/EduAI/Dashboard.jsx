import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function EduAIDashboard({ auth, recentGenerations, monthlyStats }) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        🤖 EduAI Assistant
                    </h2>
                    <Link href="/eduai/generate-complete">
                        <PrimaryButton>
                            ✨ Gerar Curso Completo
                        </PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="EduAI Assistant" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Welcome Card */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-bold mb-2">
                                    Bem-vindo ao EduAI Assistant! 🚀
                                </h3>
                                <p className="text-blue-100 text-lg">
                                    Crie cursos, atividades e experiências educacionais com o poder da Inteligência Artificial
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="text-6xl opacity-50">🤖</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <span className="text-2xl">📚</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Cursos Gerados</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {monthlyStats?.courses_generated || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <span className="text-2xl">🎮</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Atividades</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {monthlyStats?.activities_generated || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <span className="text-2xl">🏆</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Badges</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {monthlyStats?.badges_generated || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <span className="text-2xl">🎨</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Canvas</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {monthlyStats?.canvas_generated || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-3xl mr-3">📚</span>
                                    <h3 className="text-xl font-bold text-gray-900">Gerar Curso</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Crie um curso completo com módulos, aulas e objetivos de aprendizagem
                                </p>
                                <Link href="/eduai/generate-complete?type=course">
                                    <PrimaryButton className="w-full">
                                        Criar Curso
                                    </PrimaryButton>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-3xl mr-3">🎮</span>
                                    <h3 className="text-xl font-bold text-gray-900">Atividades Gamificadas</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Gere atividades interativas com quiz, desafios e elementos de jogo
                                </p>
                                <Link href="/eduai/generate-complete?type=activities">
                                    <PrimaryButton className="w-full">
                                        Criar Atividades
                                    </PrimaryButton>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-3xl mr-3">🏆</span>
                                    <h3 className="text-xl font-bold text-gray-900">Badges Personalizadas</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Crie badges únicas para motivar e reconhecer conquistas dos alunos
                                </p>
                                <Link href="/eduai/generate-complete?type=badges">
                                    <PrimaryButton className="w-full">
                                        Criar Badges
                                    </PrimaryButton>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-3xl mr-3">🎨</span>
                                    <h3 className="text-xl font-bold text-gray-900">Canvas Interativo</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Gere mapas mentais, diagramas e experiências visuais interativas
                                </p>
                                <Link href="/eduai/canvas">
                                    <PrimaryButton className="w-full">
                                        Criar Canvas
                                    </PrimaryButton>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-3xl mr-3">✨</span>
                                    <h3 className="text-xl font-bold text-gray-900">Pacote Completo</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Gere curso + atividades + badges + canvas tudo de uma vez
                                </p>
                                <Link href="/eduai/generate-complete">
                                    <PrimaryButton className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
                                        Gerar Tudo
                                    </PrimaryButton>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-3xl mr-3">📊</span>
                                    <h3 className="text-xl font-bold text-gray-900">Histórico</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Veja suas gerações anteriores e reutilize conteúdos
                                </p>
                                <SecondaryButton className="w-full">
                                    Ver Histórico
                                </SecondaryButton>
                            </div>
                        </div>
                    </div>

                    {/* Recent Generations */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            📝 Gerações Recentes
                        </h3>

                        {recentGenerations && recentGenerations.length > 0 ? (
                            <div className="space-y-3">
                                {recentGenerations.map((generation) => (
                                    <div key={generation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-3">
                                                {generation.type === 'course' ? '📚' :
                                                 generation.type === 'activities' ? '🎮' :
                                                 generation.type === 'badges' ? '🏆' : '🎨'}
                                            </span>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{generation.title}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(generation.created_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                        <SecondaryButton>
                                            Visualizar
                                        </SecondaryButton>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <span className="text-4xl mb-4 block">🤖</span>
                                <p className="text-gray-600">
                                    Você ainda não gerou nenhum conteúdo com IA.
                                </p>
                                <p className="text-gray-500 text-sm mt-2">
                                    Comece criando seu primeiro curso ou atividade!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                            💡 Dicas para Melhores Resultados
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start">
                                <span className="text-xl mr-3">📝</span>
                                <div>
                                    <h4 className="font-medium text-gray-900">Seja Específico</h4>
                                    <p className="text-sm text-gray-600">
                                        Quanto mais detalhes você fornecer, melhor será o resultado da IA
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="text-xl mr-3">🎯</span>
                                <div>
                                    <h4 className="font-medium text-gray-900">Defina o Público</h4>
                                    <p className="text-sm text-gray-600">
                                        Especifique idade, nível e contexto dos seus alunos
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}