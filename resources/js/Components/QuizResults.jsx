import React from 'react';
import { Link } from '@inertiajs/react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function QuizResults({ quizResult, courseId, onClose }) {
    if (!quizResult) return null;

    const { score, total, percentage, points_earned, detailed_results } = quizResult;

    const getScoreColor = () => {
        if (percentage >= 70) return 'text-green-600';
        return 'text-red-600';  // ❌ Falhou
    };

    const getScoreEmoji = () => {
        if (percentage >= 70) return '🎉';
        return '😞';  // Não passou
    };

    const getPerformanceColor = () => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPerformanceMessage = () => {
        if (percentage >= 80) return 'Excelente trabalho!';
        if (percentage >= 60) return 'Bom trabalho!';
        return 'Continue estudando!';
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-8 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Resultado do Quiz
                    </h2>
                    <p className={`text-xl font-semibold ${getPerformanceColor()}`}>
                        {getPerformanceMessage()}
                    </p>
                </div>

                {/* Alerta se não passou */}
                {percentage < 70 && (
                    <div className="bg-red-50 border-2 border-red-300 p-6 mb-6 rounded-xl">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">⚠️</div>
                            <div>
                                <h3 className="text-xl font-bold text-red-700 mb-2">
                                    Nota Insuficiente para Progressão
                                </h3>
                                <p className="text-red-600 mb-3">
                                    Você precisa de <strong>pelo menos 70%</strong> para desbloquear as próximas atividades.
                                </p>
                                <p className="text-red-600">
                                    Sua nota atual: <strong>{percentage.toFixed(0)}%</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                        <p className="text-sm text-blue-600 font-medium mb-2">Pontuação</p>
                        <p className="text-4xl font-bold text-blue-900">
                            {score}/{total}
                        </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6 text-center">
                        <p className="text-sm text-purple-600 font-medium mb-2">Percentual</p>
                        <p className={`text-4xl font-bold ${getPerformanceColor()}`}>
                            {percentage.toFixed(1)}%
                        </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6 text-center">
                        <p className="text-sm text-green-600 font-medium mb-2">Pontos Ganhos</p>
                        <p className="text-4xl font-bold text-green-900">
                            {points_earned}
                        </p>
                    </div>
                </div>

                {/* Detailed Results */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Revisão das Questões
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {detailed_results.map((result, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-2 ${
                                    result.is_correct
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {result.is_correct ? (
                                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                        ) : (
                                            <XCircleIcon className="w-6 h-6 text-red-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 mb-2">
                                            {index + 1}. {result.question}
                                        </p>
                                        <div className="text-sm space-y-1">
                                            <p>
                                                <span className="font-medium">Sua resposta:</span>{' '}
                                                <span className={result.is_correct ? 'text-green-700' : 'text-red-700'}>
                                                    {result.user_answer !== null
                                                        ? String.fromCharCode(65 + result.user_answer)
                                                        : 'Não respondida'}
                                                </span>
                                            </p>
                                            {!result.is_correct && (
                                                <p>
                                                    <span className="font-medium">Resposta correta:</span>{' '}
                                                    <span className="text-green-700">
                                                        {String.fromCharCode(65 + result.correct_answer)}
                                                    </span>
                                                </p>
                                            )}
                                            {result.explanation && (
                                                <p className="mt-2 text-gray-600 italic">
                                                    <span className="font-medium not-italic">Explicação:</span>{' '}
                                                    {result.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-4">
                    {percentage < 70 ? (
                        <>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                🔄 Refazer Quiz
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                            >
                                📚 Voltar ao Curso
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/student/dashboard"
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-center"
                            >
                                🎯 Ver Dashboard
                            </Link>
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                            >
                                📚 Voltar ao Curso
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
