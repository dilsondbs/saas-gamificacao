import { motion, AnimatePresence } from 'framer-motion';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    ExclamationTriangleIcon,
    ArrowPathIcon,
    XMarkIcon,
    LightBulbIcon,
    TrophyIcon,
    HeartIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';
import ProgressBar from '../Progress/ProgressBar';

export default function RetryActivityModal({
    isOpen = false,
    onClose,
    onRetry,
    activity,
    lastScore = 0,
    attempts = 1,
    requiredScore = 70,
    encouragementMessage = '',
    tips = []
}) {
    const getScoreColor = (score) => {
        if (score >= 80) return 'green';
        if (score >= 60) return 'yellow';
        return 'red';
    };

    const getMotivationalIcon = (attempts) => {
        if (attempts <= 2) return TrophyIcon;
        if (attempts <= 4) return HeartIcon;
        return LightBulbIcon;
    };

    const getMotivationalQuote = (attempts) => {
        const quotes = [
            "\"O sucesso é a soma de pequenos esforços repetidos dia após dia.\" - Robert Collier",
            "\"A persistência é o caminho do êxito.\" - Charles Chaplin",
            "\"Não importa o quão devagar você vá, desde que não pare.\" - Confúcio",
            "\"Cada tentativa te aproxima do sucesso.\" - Thomas Edison",
            "\"O fracasso é apenas uma oportunidade para recomeçar de forma mais inteligente.\" - Henry Ford"
        ];

        return quotes[Math.min(attempts - 1, quotes.length - 1)];
    };

    const getEncouragementLevel = (attempts) => {
        if (attempts === 1) return { level: 'Primeira Tentativa', color: 'blue', intensity: 'Vamos tentar novamente!' };
        if (attempts === 2) return { level: 'Segunda Tentativa', color: 'yellow', intensity: 'Você está progredindo!' };
        if (attempts === 3) return { level: 'Terceira Tentativa', color: 'orange', intensity: 'Persistência é a chave!' };
        return { level: 'Tentativas Múltiplas', color: 'purple', intensity: 'Você não desiste facilmente!' };
    };

    const encouragement = getEncouragementLevel(attempts);
    const MotivationalIcon = getMotivationalIcon(attempts);

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.2
            }
        }
    };

    const iconVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                delay: 0.2,
                duration: 0.5,
                ease: "easeOut"
            }
        },
        pulse: {
            scale: [1, 1.1, 1],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Transition appear show={isOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={onClose}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel as={motion.div} variants={modalVariants} className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">

                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                                Tentar Novamente
                                            </Dialog.Title>
                                            <button
                                                onClick={onClose}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* Motivational Icon */}
                                        <div className="text-center mb-6">
                                            <motion.div
                                                variants={iconVariants}
                                                initial="hidden"
                                                animate={["visible", "pulse"]}
                                                className={`
                                                    inline-flex items-center justify-center w-20 h-20 rounded-full
                                                    bg-${encouragement.color}-100 border-4 border-${encouragement.color}-200
                                                `}
                                            >
                                                <MotivationalIcon className={`h-8 w-8 text-${encouragement.color}-600`} />
                                            </motion.div>
                                        </div>

                                        {/* Score Feedback */}
                                        <div className="mb-6">
                                            <div className="text-center mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                                    Sua Pontuação: {lastScore}%
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {encouragement.level} • {encouragement.intensity}
                                                </p>
                                            </div>

                                            {/* Progress Visualization */}
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-medium text-gray-700">Sua Pontuação</span>
                                                        <span className="text-xs text-gray-500">{lastScore}%</span>
                                                    </div>
                                                    <ProgressBar
                                                        percentage={lastScore}
                                                        color={getScoreColor(lastScore)}
                                                        size="sm"
                                                        showLabel={false}
                                                        animated={true}
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-medium text-gray-700">Meta para Avançar</span>
                                                        <span className="text-xs text-gray-500">{requiredScore}%</span>
                                                    </div>
                                                    <ProgressBar
                                                        percentage={requiredScore}
                                                        color="green"
                                                        size="sm"
                                                        showLabel={false}
                                                        animated={false}
                                                    />
                                                </div>

                                                {/* Gap Analysis */}
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">
                                                            Faltam apenas {requiredScore - lastScore}%
                                                        </span>
                                                        {' '}para atingir a meta! 🎯
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Encouragement Message */}
                                        <div className={`p-4 rounded-lg mb-6 bg-${encouragement.color}-50 border border-${encouragement.color}-200`}>
                                            <p className={`text-sm text-${encouragement.color}-800 text-center font-medium mb-2`}>
                                                {encouragementMessage}
                                            </p>
                                            <p className={`text-xs text-${encouragement.color}-700 text-center italic`}>
                                                {getMotivationalQuote(attempts)}
                                            </p>
                                        </div>

                                        {/* Study Tips */}
                                        {tips.length > 0 && (
                                            <div className="mb-6">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <LightBulbIcon className="h-5 w-5 text-yellow-600" />
                                                    <h5 className="text-sm font-medium text-gray-800">
                                                        Dicas para Melhorar
                                                    </h5>
                                                </div>
                                                <ul className="space-y-2">
                                                    {tips.slice(0, 3).map((tip, index) => (
                                                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                                            <span className="text-yellow-600 font-bold mt-0.5">•</span>
                                                            <span>{tip}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center justify-between space-x-3">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                            >
                                                Revisar Material
                                                <BookOpenIcon className="ml-2 h-4 w-4" />
                                            </button>

                                            <motion.button
                                                type="button"
                                                onClick={onRetry}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`
                                                    flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md
                                                    text-sm font-medium text-white shadow-sm
                                                    bg-${encouragement.color}-600 hover:bg-${encouragement.color}-700
                                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${encouragement.color}-500
                                                    transition-colors
                                                `}
                                            >
                                                <ArrowPathIcon className="mr-2 h-4 w-4" />
                                                Tentar Novamente
                                            </motion.button>
                                        </div>

                                        {/* Attempt Counter */}
                                        <div className="mt-4 text-center">
                                            <p className="text-xs text-gray-500">
                                                Tentativa {attempts} • Sem limites para aprender! 🚀
                                            </p>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            )}
        </AnimatePresence>
    );
}