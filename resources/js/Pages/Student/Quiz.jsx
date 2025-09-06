import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Quiz({ auth, activity, course, userActivity, hasCompleted, quiz_result }) {
    const user = auth.user;
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
    const [particles, setParticles] = useState([]);
    const [shake, setShake] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    
    const questions = activity.content?.questions || [];
    
    const { data, setData, post, processing, errors } = useForm({
        answers: {}
    });

    // Som de acerto/erro (simulado com vibração no mobile)
    const playSuccessSound = () => {
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    };

    const playErrorSound = () => {
        if (navigator.vibrate) {
            navigator.vibrate([200]);
        }
    };

    // Criar particles de estrelas
    const createStarParticles = () => {
        const newParticles = [];
        for (let i = 0; i < 12; i++) {
            newParticles.push({
                id: Math.random(),
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                delay: Math.random() * 0.5
            });
        }
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 2000);
    };

    const handleAnswerSelect = (questionIndex, optionIndex) => {
        if (showFeedback) return; // Não permitir resposta durante feedback
        
        const question = questions[questionIndex];
        const isCorrect = optionIndex === question.correct;
        
        // Atualizar resposta
        setData('answers', {
            ...data.answers,
            [questionIndex]: optionIndex
        });
        
        // Marcar questão como respondida
        setAnsweredQuestions(prev => new Set([...prev, questionIndex]));
        
        // Calcular pontos instantaneamente
        if (isCorrect && !answeredQuestions.has(questionIndex)) {
            const pointsPerQuestion = Math.round(activity.points_value / questions.length);
            setScore(prev => prev + pointsPerQuestion);
            setStreak(prev => prev + 1);
            setMaxStreak(prev => Math.max(prev, streak + 1));
            
            // Efeitos de acerto
            playSuccessSound();
            createStarParticles();
        } else if (!isCorrect) {
            setStreak(0);
            
            // Efeitos de erro
            playErrorSound();
            setShake(true);
            setTimeout(() => setShake(false), 600);
        }
        
        // Mostrar feedback
        setLastAnswerCorrect(isCorrect);
        setShowFeedback(true);
        
        // Auto-avançar após 2 segundos
        setTimeout(() => {
            setShowFeedback(false);
            if (questionIndex < questions.length - 1) {
                setCurrentQuestion(questionIndex + 1);
            }
        }, 2500);
    };

    const nextQuestion = () => {
        if (showFeedback) return;
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const prevQuestion = () => {
        if (showFeedback) return;
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const submitQuiz = () => {
        if (showFeedback) return;
        
        // Mostrar confetti
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        
        setTimeout(() => {
            post(route('student.quiz.submit', activity.id));
        }, 1000);
    };

    const allQuestionsAnswered = () => {
        return questions.every((_, index) => data.answers.hasOwnProperty(index));
    };

    if (hasCompleted && quiz_result) {
        return (
            <AuthenticatedLayout
                user={user}
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        🎯 Quiz Completado - Gabarito
                    </h2>
                }
            >
                <Head title={`Quiz: ${activity.title}`} />

                <div className="py-8">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8">
                        
                        {/* Results Section */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className={`p-8 text-center ${
                                quiz_result.percentage >= 70 ? 'bg-green-50' : 'bg-orange-50'
                            }`}>
                                <div className={`text-6xl mb-4 ${
                                    quiz_result.percentage >= 70 ? 'text-green-500' : 'text-orange-500'
                                }`}>
                                    {quiz_result.percentage >= 70 ? '🎉' : '📝'}
                                </div>
                                
                                <h1 className="text-3xl font-bold mb-4 text-gray-900">
                                    {quiz_result.percentage >= 70 ? 'Parabéns!' : 'Quiz Completado!'}
                                </h1>
                                
                                <div className="text-lg text-gray-700 mb-6">
                                    Você acertou <span className="font-bold text-2xl text-green-600">{quiz_result.score}</span> de{' '}
                                    <span className="font-bold">{quiz_result.total}</span> questões
                                </div>
                                
                                <div className="flex justify-center mb-6">
                                    <div className={`text-4xl font-bold ${
                                        quiz_result.percentage >= 70 ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                        {Math.round(quiz_result.percentage)}%
                                    </div>
                                </div>
                                
                                {quiz_result.points_earned > 0 ? (
                                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
                                        <div className="flex items-center justify-center">
                                            <span className="text-2xl mr-2">🏆</span>
                                            <span className="text-lg font-medium text-yellow-800">
                                                Você ganhou {quiz_result.points_earned} pontos!
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
                                        <div className="text-blue-800">
                                            <span className="font-medium">💡 Dica:</span> Você precisa acertar pelo menos 70% das questões para ganhar pontos!
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detailed Results */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="text-2xl mr-2">📋</span>
                                    Gabarito Detalhado
                                </h3>
                                
                                <div className="space-y-6">
                                    {questions.map((question, index) => {
                                        const userAnswer = userActivity.metadata?.answers?.[index];
                                        const isCorrect = userAnswer === question.correct;
                                        
                                        return (
                                            <div key={index} className={`border rounded-lg p-4 ${
                                                isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                            }`}>
                                                <div className="flex items-start mb-3">
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                                                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                                                    }`}>
                                                        {isCorrect ? '✓' : '✗'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 mb-2">
                                                            Questão {index + 1}: {question.question}
                                                        </h4>
                                                        
                                                        <div className="space-y-2 mb-3">
                                                            {question.options.map((option, optionIndex) => (
                                                                <div key={optionIndex} className={`p-2 rounded ${
                                                                    optionIndex === question.correct ? 'bg-green-100 border border-green-300' :
                                                                    optionIndex === userAnswer && !isCorrect ? 'bg-red-100 border border-red-300' :
                                                                    'bg-gray-50'
                                                                }`}>
                                                                    <div className="flex items-center">
                                                                        <span className="font-medium mr-2">
                                                                            {String.fromCharCode(65 + optionIndex)}.
                                                                        </span>
                                                                        <span>{option}</span>
                                                                        {optionIndex === question.correct && (
                                                                            <span className="ml-2 text-green-600 font-medium">
                                                                                ✓ Resposta correta
                                                                            </span>
                                                                        )}
                                                                        {optionIndex === userAnswer && !isCorrect && (
                                                                            <span className="ml-2 text-red-600 font-medium">
                                                                                ✗ Sua resposta
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        
                                                        {question.explanation && (
                                                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                                                <div className="flex items-start">
                                                                    <span className="text-blue-500 mr-2">💡</span>
                                                                    <div>
                                                                        <span className="font-medium text-blue-900">Explicação:</span>
                                                                        <p className="text-blue-800 text-sm mt-1">{question.explanation}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.href = route('student.courses')}
                                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200"
                            >
                                📚 Voltar aos Cursos
                            </button>
                            <button
                                onClick={() => window.location.href = route('student.dashboard')}
                                className="px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200"
                            >
                                🎯 Ver Dashboard Atualizado
                            </button>
                        </div>
                        
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (questions.length === 0) {
        return (
            <AuthenticatedLayout
                user={user}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Quiz</h2>}
            >
                <Head title={`Quiz: ${activity.title}`} />
                <div className="py-8">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 text-center">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="text-6xl mb-4">❓</div>
                            <h2 className="text-2xl font-bold mb-4">Nenhuma questão disponível</h2>
                            <p className="text-gray-600">Este quiz ainda não possui questões configuradas.</p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const currentQuestionData = questions[currentQuestion];

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        🎯 {activity.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                            🎯 {score} pts
                        </div>
                        <div className="text-gray-600">
                            {currentQuestion + 1}/{questions.length}
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Quiz: ${activity.title}`} />

            {/* Particles Effect */}
            <div className="fixed inset-0 pointer-events-none z-50">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute text-2xl animate-bounce"
                        style={{
                            left: particle.x,
                            top: particle.y,
                            animationDelay: `${particle.delay}s`,
                            animationDuration: '1s'
                        }}
                    >
                        ⭐
                    </div>
                ))}
            </div>

            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-ping"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                fontSize: '24px'
                            }}
                        >
                            {['🎉', '🎊', '⭐', '💫', '✨'][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            )}

            <div className={`py-8 transition-all duration-300 ${shake ? 'animate-pulse' : ''}`}>
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Game Stats Header */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold animate-pulse">{score}</div>
                            <div className="text-sm opacity-90">Pontos</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{streak}</div>
                            <div className="text-sm opacity-90">Sequência</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{maxStreak}</div>
                            <div className="text-sm opacity-90">Recorde</div>
                        </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span className="font-medium">Progresso do Quiz</span>
                            <span className="font-bold text-blue-600">
                                {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                            <div 
                                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-700 relative overflow-hidden"
                                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Card with shake animation */}
                    <div className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
                        shake ? 'animate-bounce border-4 border-red-500' : ''
                    }`}>
                        <div className="p-8">
                            
                            {/* Question Number Badge */}
                            <div className="flex items-center justify-center mb-6">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-bold text-lg">
                                    Questão {currentQuestion + 1}
                                </div>
                            </div>

                            {/* Question */}
                            <div className="mb-8 text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                    {currentQuestionData.question}
                                </h2>
                            </div>

                            {/* Options with hover animations */}
                            <div className="space-y-4 mb-8">
                                {currentQuestionData.options.map((option, index) => {
                                    const isSelected = data.answers[currentQuestion] === index;
                                    const isCorrect = index === currentQuestionData.correct;
                                    const showCorrection = showFeedback;
                                    
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(currentQuestion, index)}
                                            disabled={showFeedback}
                                            className={`w-full text-left p-6 rounded-xl border-3 transition-all duration-300 transform hover:scale-105 ${
                                                showCorrection && isCorrect 
                                                    ? 'border-green-500 bg-green-100 text-green-900 animate-pulse' :
                                                showCorrection && isSelected && !isCorrect
                                                    ? 'border-red-500 bg-red-100 text-red-900 animate-bounce' :
                                                isSelected && !showCorrection
                                                    ? 'border-blue-500 bg-blue-100 text-blue-900 scale-105' :
                                                'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 hover:shadow-lg'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 rounded-full border-3 mr-4 flex items-center justify-center text-lg font-bold transition-all ${
                                                    showCorrection && isCorrect
                                                        ? 'border-green-500 bg-green-500 text-white' :
                                                    showCorrection && isSelected && !isCorrect
                                                        ? 'border-red-500 bg-red-500 text-white' :
                                                    isSelected && !showCorrection
                                                        ? 'border-blue-500 bg-blue-500 text-white' :
                                                    'border-gray-300'
                                                }`}>
                                                    {showCorrection && isCorrect ? '✓' :
                                                     showCorrection && isSelected && !isCorrect ? '✗' :
                                                     isSelected ? '●' : String.fromCharCode(65 + index)}
                                                </div>
                                                <span className="text-xl font-medium flex-1">
                                                    {option}
                                                </span>
                                                {showCorrection && isCorrect && (
                                                    <div className="text-2xl animate-spin">⭐</div>
                                                )}
                                                {showCorrection && isSelected && !isCorrect && (
                                                    <div className="text-2xl animate-bounce">💥</div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Instant Feedback */}
                            {showFeedback && (
                                <div className={`p-6 rounded-xl mb-6 animate-fadeIn border-2 ${
                                    lastAnswerCorrect 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-red-50 border-red-200'
                                }`}>
                                    <div className="flex items-center mb-3">
                                        <div className="text-3xl mr-3">
                                            {lastAnswerCorrect ? '🎉' : '😅'}
                                        </div>
                                        <h3 className={`text-xl font-bold ${
                                            lastAnswerCorrect ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            {lastAnswerCorrect ? 'Parabéns! Resposta Correta!' : 'Ops! Resposta Incorreta'}
                                        </h3>
                                    </div>
                                    
                                    {currentQuestionData.explanation && (
                                        <div className={`p-4 rounded-lg ${
                                            lastAnswerCorrect ? 'bg-green-100' : 'bg-blue-100'
                                        }`}>
                                            <div className="flex items-start">
                                                <span className="text-xl mr-2">💡</span>
                                                <div>
                                                    <span className="font-medium text-gray-900">Explicação:</span>
                                                    <p className="text-gray-800 text-sm mt-1">{currentQuestionData.explanation}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={prevQuestion}
                                    disabled={currentQuestion === 0 || showFeedback}
                                    className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                >
                                    ← Anterior
                                </button>

                                <div className="flex space-x-2">
                                    {questions.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                                index === currentQuestion
                                                    ? 'bg-blue-500 scale-125 animate-pulse'
                                                    : data.answers.hasOwnProperty(index)
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-300'
                                            }`}
                                        ></div>
                                    ))}
                                </div>

                                {currentQuestion === questions.length - 1 ? (
                                    <button
                                        onClick={submitQuiz}
                                        disabled={!allQuestionsAnswered() || processing || showFeedback}
                                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        {processing ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                Finalizando...
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">🏆</span>
                                                Finalizar Quiz
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={nextQuestion}
                                        disabled={!data.answers.hasOwnProperty(currentQuestion) || showFeedback}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        Próxima →
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>

                </div>
            </div>
            
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}