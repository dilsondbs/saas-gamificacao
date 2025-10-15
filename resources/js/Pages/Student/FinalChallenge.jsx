import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

// Templates de mensagens Skinnerianas
const skinnerianTemplates = [
    {
        title: 'Reforço de Dedicação',
        message: 'Sua **dedicação contínua** em completar todas as atividades gerou **resultados mensuráveis**. Esse **comportamento de estudo consistente** é a chave do sucesso. Continue reforçando esse padrão!'
    },
    {
        title: 'Reforço de Progresso',
        message: 'Cada **atividade que você completou** reforçou seu **aprendizado efetivo**. Seu **progresso visível** é **consequência direta** de suas ações repetidas. Mantenha esse ciclo!'
    },
    {
        title: 'Reforço de Colaboração',
        message: 'O **ambiente colaborativo** que você ajuda a criar **beneficia todo o grupo**. Seu **comportamento de engajamento** serve como **modelo positivo**. Continue contribuindo!'
    },
    {
        title: 'Reforço de Persistência',
        message: 'Sua **persistência em superar desafios** demonstrou que **comportamentos consistentes geram resultados**. Cada tentativa te aproximou da meta. Persista nessa estratégia!'
    },
    {
        title: 'Reforço de Melhoria',
        message: 'A **evolução no seu desempenho** mostra que **prática repetida gera aperfeiçoamento**. Seu **comportamento de revisão e estudo** está produzindo **consequências positivas mensuráveis**!'
    },
    {
        title: 'Reforço de Resultados',
        message: 'Os **resultados que você alcançou** são a **consequência natural** do seu **comportamento disciplinado**. Continue aplicando essas **ações produtivas** para manter o padrão de excelência!'
    }
];

// Validação de mensagem Skinneriana
const validateSkinnerianMessage = (message) => {
    const keywords = ['comportamento', 'consequência', 'resultado', 'ação', 'reforço', 'progresso', 'dedicação', 'padrão', 'persistência'];
    const hasKeyword = keywords.some(k => message.toLowerCase().includes(k));
    const hasLength = message.length >= 50;
    const hasBold = message.includes('**'); // Tem ênfase

    return { valid: hasKeyword && hasLength, hasKeyword, hasLength, hasBold };
};

export default function FinalChallenge({
    auth,
    course,
    challenge,
    attempts,
    progress,
    eligibleStudents = [],
    receivedMotivations = [],
    sentMotivations = []
}) {
    const user = auth.user;

    // Estados principais
    const [currentView, setCurrentView] = useState('levels'); // levels, playing, result, cooperation
    const [currentLevel, setCurrentLevel] = useState(null); // easy, medium, hard
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [attemptId, setAttemptId] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [result, setResult] = useState(null);

    // Estados de motivação
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [motivationMessage, setMotivationMessage] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [messageValidation, setMessageValidation] = useState({ valid: false });

    const timerRef = useRef(null);

    const { data, setData, post, processing } = useForm({
        answers: {}
    });

    // Timer countdown
    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmit(); // Auto-submit quando acaba o tempo
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timerRef.current);
        }
    }, [isPlaying, timeLeft]);

    // Validação em tempo real da mensagem
    useEffect(() => {
        setMessageValidation(validateSkinnerianMessage(motivationMessage));
    }, [motivationMessage]);

    // Iniciar desafio
    const startChallenge = async (level) => {
        try {
            const response = await fetch(route('student.challenge.start', course.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ level })
            });

            const data = await response.json();

            if (data.success) {
                setCurrentLevel(level);
                setQuestions(data.questions);
                setAttemptId(data.attempt_id);
                setTimeLeft(data.time_limit_minutes * 60);
                setStartTime(Date.now());
                setCurrentQuestion(0);
                setIsPlaying(true);
                setCurrentView('playing');
                setData('answers', {});
            }
        } catch (error) {
            console.error('Erro ao iniciar desafio:', error);
            alert('Erro ao iniciar o desafio. Tente novamente.');
        }
    };

    // Submeter respostas
    const handleSubmit = async () => {
        if (processing) return;

        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        try {
            const response = await fetch(route('student.challenge.submit', course.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    attempt_id: attemptId,
                    answers: Object.entries(data.answers).map(([questionIndex, answerIndex]) => ({
                        question_index: parseInt(questionIndex),
                        selected: String.fromCharCode(65 + answerIndex) // 0->A, 1->B, 2->C, 3->D
                    })),
                    time_spent: timeSpent
                })
            });

            const resultData = await response.json();

            if (resultData.success) {
                setResult(resultData);
                setIsPlaying(false);
                setCurrentView('result');
                clearInterval(timerRef.current);
            }
        } catch (error) {
            console.error('Erro ao submeter:', error);
            alert('Erro ao enviar respostas. Tente novamente.');
        }
    };

    // Selecionar resposta
    const selectAnswer = (questionIndex, answerIndex) => {
        setData('answers', {
            ...data.answers,
            [questionIndex]: answerIndex
        });
    };

    // Usar template Skinneriano
    const useTemplate = (index) => {
        setSelectedTemplate(index);
        setMotivationMessage(skinnerianTemplates[index].message);
    };

    // Enviar motivação
    const sendMotivation = async () => {
        if (!messageValidation.valid || selectedStudents.length === 0) {
            alert('Selecione pelo menos um aluno e escreva uma mensagem válida seguindo os princípios Skinnerianos.');
            return;
        }

        try {
            const response = await fetch(route('student.challenge.motivation.send', course.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    receiver_ids: selectedStudents,
                    message: motivationMessage
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(`✅ ${data.message}`);
                // Limpar formulário
                setMotivationMessage('');
                setSelectedStudents([]);
                setSelectedTemplate(null);
                // Recarregar página para atualizar lista
                router.reload();
            }
        } catch (error) {
            console.error('Erro ao enviar motivação:', error);
            alert('Erro ao enviar motivação. Tente novamente.');
        }
    };

    // Confirmar motivação recebida
    const confirmMotivation = async (motivationId) => {
        try {
            const response = await fetch(route('student.challenge.motivation.confirm', motivationId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                }
            });

            const data = await response.json();

            if (data.success) {
                alert(`🎉 ${data.message}`);
                router.reload();
            }
        } catch (error) {
            console.error('Erro ao confirmar motivação:', error);
            alert('Erro ao confirmar. Tente novamente.');
        }
    };

    // Toggle seleção de aluno
    const toggleStudent = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            if (selectedStudents.length < 5) {
                setSelectedStudents([...selectedStudents, studentId]);
            } else {
                alert('Você pode selecionar no máximo 5 alunos.');
            }
        }
    };

    // Formatar tempo
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Renderizar tela de níveis
    const renderLevelsScreen = () => (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <h1 className="text-3xl font-bold text-center mb-4">🏆 Desafio Final: {course.title}</h1>
                <p className="text-gray-600 text-center mb-6">
                    Complete os 3 níveis para desbloquear o sistema de cooperação e dobrar seus pontos!
                </p>
            </div>

            {/* Cards de Níveis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* FÁCIL */}
                <div className={`bg-white rounded-xl shadow-lg p-6 border-4 ${progress.easy_passed ? 'border-green-500' : 'border-green-300'}`}>
                    <div className="text-center mb-4">
                        <div className="text-6xl mb-2">🟢</div>
                        <h2 className="text-2xl font-bold text-green-700">FÁCIL</h2>
                        {progress.easy_passed && <span className="text-sm text-green-600">✅ Completado</span>}
                    </div>
                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                        <p>⏱️ Tempo: 20 minutos</p>
                        <p>📊 Score mínimo: 60%</p>
                        <p>❓ 10 questões</p>
                    </div>
                    {attempts.easy && attempts.easy.length > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg mb-4">
                            <p className="text-sm font-medium">Melhor tentativa:</p>
                            <p className="text-2xl font-bold text-green-700">
                                {Math.max(...attempts.easy.map(a => a.score))}%
                            </p>
                        </div>
                    )}
                    <button
                        onClick={() => startChallenge('easy')}
                        disabled={processing}
                        className="w-full py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:bg-gray-400 transition"
                    >
                        {progress.easy_passed ? '🔄 Tentar Novamente' : '🚀 Iniciar Fácil'}
                    </button>
                </div>

                {/* MÉDIO */}
                <div className={`bg-white rounded-xl shadow-lg p-6 border-4 ${progress.medium_passed ? 'border-yellow-500' : progress.easy_passed ? 'border-yellow-300' : 'border-gray-300'}`}>
                    <div className="text-center mb-4">
                        <div className="text-6xl mb-2">🟡</div>
                        <h2 className="text-2xl font-bold text-yellow-700">MÉDIO</h2>
                        {progress.medium_passed && <span className="text-sm text-yellow-600">✅ Completado</span>}
                        {!progress.easy_passed && <span className="text-sm text-gray-500">🔒 Bloqueado</span>}
                    </div>
                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                        <p>⏱️ Tempo: 20 minutos</p>
                        <p>📊 Score mínimo: 70%</p>
                        <p>❓ 10 questões</p>
                    </div>
                    {attempts.medium && attempts.medium.length > 0 && (
                        <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                            <p className="text-sm font-medium">Melhor tentativa:</p>
                            <p className="text-2xl font-bold text-yellow-700">
                                {Math.max(...attempts.medium.map(a => a.score))}%
                            </p>
                        </div>
                    )}
                    <button
                        onClick={() => startChallenge('medium')}
                        disabled={!progress.easy_passed || processing}
                        className="w-full py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 disabled:bg-gray-400 transition"
                    >
                        {progress.medium_passed ? '🔄 Tentar Novamente' : '🚀 Iniciar Médio'}
                    </button>
                </div>

                {/* DIFÍCIL */}
                <div className={`bg-white rounded-xl shadow-lg p-6 border-4 ${progress.hard_passed ? 'border-red-500' : progress.medium_passed ? 'border-red-300' : 'border-gray-300'}`}>
                    <div className="text-center mb-4">
                        <div className="text-6xl mb-2">🔴</div>
                        <h2 className="text-2xl font-bold text-red-700">DIFÍCIL</h2>
                        {progress.hard_passed && <span className="text-sm text-red-600">✅ Completado</span>}
                        {!progress.medium_passed && <span className="text-sm text-gray-500">🔒 Bloqueado</span>}
                    </div>
                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                        <p>⏱️ Tempo: 20 minutos</p>
                        <p>📊 Score mínimo: 80%</p>
                        <p>❓ 10 questões</p>
                    </div>
                    {attempts.hard && attempts.hard.length > 0 && (
                        <div className="bg-red-50 p-3 rounded-lg mb-4">
                            <p className="text-sm font-medium">Melhor tentativa:</p>
                            <p className="text-2xl font-bold text-red-700">
                                {Math.max(...attempts.hard.map(a => a.score))}%
                            </p>
                        </div>
                    )}
                    <button
                        onClick={() => startChallenge('hard')}
                        disabled={!progress.medium_passed || processing}
                        className="w-full py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:bg-gray-400 transition"
                    >
                        {progress.hard_passed ? '🔄 Tentar Novamente' : '🚀 Iniciar Difícil'}
                    </button>
                </div>
            </div>

            {/* Botão Sistema de Cooperação */}
            {progress.all_levels_passed && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg p-8 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-4">Parabéns! Você completou todos os níveis!</h2>
                    <p className="text-lg mb-6">Agora você pode participar do Sistema de Reforço Comportamental Mútuo</p>
                    <button
                        onClick={() => setCurrentView('cooperation')}
                        className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105"
                    >
                        🤝 Acessar Sistema de Cooperação
                    </button>
                </div>
            )}
        </div>
    );

    // Renderizar tela de jogo
    const renderPlayingScreen = () => {
        if (!questions || questions.length === 0) return null;
        const question = questions[currentQuestion];

        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Timer e Progresso */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <span className="text-lg font-bold">Questão {currentQuestion + 1}/{questions.length}</span>
                        </div>
                        <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                            ⏱️ {formatTime(timeLeft)}
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Questão */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-6">{question.question}</h2>

                    <div className="space-y-4">
                        {question.options.map((option, index) => {
                            const isSelected = data.answers[currentQuestion] === index;
                            return (
                                <button
                                    key={index}
                                    onClick={() => selectAnswer(currentQuestion, index)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                        }`}>
                                            {isSelected && <span className="text-white text-sm">✓</span>}
                                        </div>
                                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                                        <span className="ml-2">{option}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Navegação */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                            disabled={currentQuestion === 0}
                            className="px-6 py-3 bg-gray-200 rounded-lg font-medium disabled:opacity-50"
                        >
                            ← Anterior
                        </button>

                        {currentQuestion === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={Object.keys(data.answers).length < questions.length}
                                className="px-8 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:bg-gray-400"
                            >
                                ✅ Finalizar Desafio
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
                            >
                                Próxima →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Renderizar tela de resultado
    const renderResultScreen = () => {
        if (!result) return null;

        const passed = result.passed;
        const completedAll = result.completed_all_levels;

        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className={`bg-white rounded-xl shadow-lg p-8 text-center ${passed ? 'border-4 border-green-500' : 'border-4 border-orange-500'}`}>
                    <div className="text-6xl mb-4">{passed ? '🎉' : '📝'}</div>
                    <h1 className="text-3xl font-bold mb-4">
                        {passed ? 'Parabéns! Você passou!' : 'Quase lá!'}
                    </h1>

                    <div className="text-6xl font-bold mb-4" style={{color: passed ? '#10b981' : '#f59e0b'}}>
                        {result.score}%
                    </div>

                    <p className="text-lg text-gray-600 mb-6">
                        Score mínimo: {result.min_score}% | Nota: {result.grade}
                    </p>

                    {passed && (
                        <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
                            <p className="text-green-800 font-medium">
                                {result.next_level_unlocked ? '🔓 Próximo nível desbloqueado!' : '✅ Nível concluído!'}
                            </p>
                        </div>
                    )}

                    {completedAll && (
                        <div className="bg-purple-100 border border-purple-300 rounded-lg p-6 mb-6">
                            <div className="text-4xl mb-2">👑</div>
                            <p className="text-xl font-bold text-purple-800 mb-2">
                                Você completou TODOS os níveis!
                            </p>
                            <p className="text-purple-700">
                                Sistema de Cooperação desbloqueado!
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                setCurrentView('levels');
                                setResult(null);
                            }}
                            className="px-8 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
                        >
                            📊 Ver Níveis
                        </button>
                        {completedAll && (
                            <button
                                onClick={() => setCurrentView('cooperation')}
                                className="px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600"
                            >
                                🤝 Sistema de Cooperação
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Renderizar tela de cooperação Skinneriana
    const renderCooperationScreen = () => (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg p-8 mb-8">
                <h1 className="text-4xl font-bold text-center mb-4">🤝 Sistema de Reforço Comportamental Mútuo</h1>
                <p className="text-center text-lg">
                    Baseado em <strong>B.F. Skinner - Análise do Comportamento</strong>:
                    Estímulo → Resposta → Reforço Positivo
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Enviar Motivação */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">💌 Enviar Reforço Comportamental</h2>

                    {/* Templates Skinnerianos */}
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-700 mb-3">📋 Templates Baseados em Skinner:</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {skinnerianTemplates.map((template, index) => (
                                <button
                                    key={index}
                                    onClick={() => useTemplate(index)}
                                    className={`p-3 rounded-lg border-2 text-left transition ${
                                        selectedTemplate === index
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-purple-300'
                                    }`}
                                >
                                    <p className="font-medium text-sm">{template.title}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Textarea */}
                    <div className="mb-4">
                        <label className="block font-medium text-gray-700 mb-2">
                            Mensagem de Reforço:
                        </label>
                        <textarea
                            value={motivationMessage}
                            onChange={(e) => setMotivationMessage(e.target.value)}
                            placeholder="Escreva uma mensagem de reforço comportamental... Use **negrito** para ênfase."
                            className={`w-full h-32 p-3 border-2 rounded-lg ${
                                messageValidation.valid
                                    ? 'border-green-500 bg-green-50'
                                    : motivationMessage.length > 0
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300'
                            }`}
                        />

                        {/* Validação em tempo real */}
                        <div className="mt-2 text-sm space-y-1">
                            <p className={messageValidation.hasLength ? 'text-green-600' : 'text-gray-500'}>
                                {messageValidation.hasLength ? '✅' : '○'} Mínimo 50 caracteres ({motivationMessage.length}/50)
                            </p>
                            <p className={messageValidation.hasKeyword ? 'text-green-600' : 'text-gray-500'}>
                                {messageValidation.hasKeyword ? '✅' : '○'} Contém termos Skinnerianos
                            </p>
                            <p className={messageValidation.hasBold ? 'text-green-600' : 'text-gray-500'}>
                                {messageValidation.hasBold ? '✅' : '○'} Tem ênfase (**texto**)
                            </p>
                        </div>
                    </div>

                    {/* Seleção de Alunos */}
                    <div className="mb-4">
                        <label className="block font-medium text-gray-700 mb-2">
                            Selecione até 5 alunos ({selectedStudents.length}/5):
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {eligibleStudents.length === 0 ? (
                                <p className="text-gray-500 text-sm">Nenhum aluno elegível no momento.</p>
                            ) : (
                                eligibleStudents.map(student => (
                                    <label key={student.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={() => toggleStudent(student.id)}
                                            className="mr-3"
                                        />
                                        <span>{student.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        onClick={sendMotivation}
                        disabled={!messageValidation.valid || selectedStudents.length === 0}
                        className="w-full py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 disabled:bg-gray-400 transition"
                    >
                        🚀 Enviar Reforço Comportamental
                    </button>
                </div>

                {/* Motivações Recebidas */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">📬 Reforços Recebidos</h2>

                    {receivedMotivations.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                            Nenhum reforço recebido ainda.
                        </div>
                    ) : (
                        receivedMotivations.map(motivation => (
                            <div key={motivation.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-blue-700">De: {motivation.sender.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(motivation.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    {motivation.confirmed_at && (
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                            ✅ Confirmado
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-700 mb-3" dangerouslySetInnerHTML={{
                                    __html: motivation.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                }} />

                                {!motivation.confirmed_at && (
                                    <button
                                        onClick={() => confirmMotivation(motivation.id)}
                                        className="w-full py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600"
                                    >
                                        ✅ Confirmar Reforço (Dobrar Pontos)
                                    </button>
                                )}
                            </div>
                        ))
                    )}

                    {/* Motivações Enviadas */}
                    <h2 className="text-2xl font-bold mt-8">📤 Reforços Enviados</h2>
                    {sentMotivations.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                            Você ainda não enviou nenhum reforço.
                        </div>
                    ) : (
                        sentMotivations.map(motivation => (
                            <div key={motivation.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-purple-700">Para: {motivation.receiver.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(motivation.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    {motivation.confirmed_at && (
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                            ✅ Confirmado
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-700 text-sm" dangerouslySetInnerHTML={{
                                    __html: motivation.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                }} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Botão Voltar */}
            <div className="mt-8 text-center">
                <button
                    onClick={() => setCurrentView('levels')}
                    className="px-8 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700"
                >
                    ← Voltar aos Níveis
                </button>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    🏆 Desafio Final - {course.title}
                </h2>
            }
        >
            <Head title={`Desafio Final - ${course.title}`} />

            {currentView === 'levels' && renderLevelsScreen()}
            {currentView === 'playing' && renderPlayingScreen()}
            {currentView === 'result' && renderResultScreen()}
            {currentView === 'cooperation' && renderCooperationScreen()}
        </AuthenticatedLayout>
    );
}
