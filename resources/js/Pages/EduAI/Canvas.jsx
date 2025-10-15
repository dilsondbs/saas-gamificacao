import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import {
    AcademicCapIcon,
    SparklesIcon,
    CheckCircleIcon,
    StarIcon,
    UserGroupIcon,
    ClockIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function Canvas({ auth, canvasId, courseData }) {
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [viewMode, setViewMode] = useState('overview'); // 'overview', 'module', 'lesson'
    const [courseStructure, setCourseStructure] = useState(courseData || null);

    // Sample data se não tiver courseData
    useEffect(() => {
        if (!courseStructure) {
            setCourseStructure({
                title: "Curso de Exemplo",
                description: "Este é um exemplo de curso gerado pela IA",
                modules: [
                    {
                        title: "Introdução",
                        description: "Módulo introdutório",
                        lessons: [
                            { title: "Conceitos Básicos", activities: [], estimated_duration: "15min" },
                            { title: "Fundamentos", activities: [], estimated_duration: "20min" }
                        ]
                    }
                ]
            });
        }
    }, []);

    const handleModuleClick = (module, moduleIndex) => {
        setSelectedModule({ ...module, index: moduleIndex });
        setViewMode('module');
        setSelectedLesson(null);
    };

    const handleLessonClick = (lesson, lessonIndex) => {
        setSelectedLesson({ ...lesson, index: lessonIndex });
        setViewMode('lesson');
    };

    const getModuleProgress = (module) => {
        const totalLessons = module.lessons?.length || 0;
        const completedLessons = 0; // Seria calculado baseado no progresso real
        return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-800';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Overview Mode - Visão geral do curso
    const OverviewMode = () => (
        <div className="space-y-8">
            {/* Course Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center space-x-4 mb-4">
                    <AcademicCapIcon className="w-12 h-12" />
                    <div>
                        <h1 className="text-3xl font-bold">{courseStructure?.title || 'Curso'}</h1>
                        <p className="text-blue-100 text-lg">{courseStructure?.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <SparklesIcon className="w-5 h-5" />
                            <span className="font-semibold">Módulos</span>
                        </div>
                        <div className="text-2xl font-bold">{courseStructure?.modules?.length || 0}</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span className="font-semibold">Lições</span>
                        </div>
                        <div className="text-2xl font-bold">
                            {courseStructure?.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0}
                        </div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <StarIcon className="w-5 h-5" />
                            <span className="font-semibold">Atividades</span>
                        </div>
                        <div className="text-2xl font-bold">
                            {courseStructure?.modules?.reduce((total, module) =>
                                total + (module.lessons?.reduce((ltotal, lesson) =>
                                    ltotal + (lesson.activities?.length || 0), 0) || 0), 0) || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Estrutura do Curso</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courseStructure?.modules?.map((module, moduleIndex) => (
                        <div
                            key={moduleIndex}
                            onClick={() => handleModuleClick(module, moduleIndex)}
                            className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                            {moduleIndex + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                {module.title}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {module.lessons?.length || 0} lições
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {module.description}
                                </p>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Progresso</span>
                                        <span>{Math.round(getModuleProgress(module))}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                                            style={{ width: `${getModuleProgress(module)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Lessons Preview */}
                                <div className="mt-4 space-y-1">
                                    {module.lessons?.slice(0, 3).map((lesson, lessonIndex) => (
                                        <div key={lessonIndex} className="flex items-center space-x-2 text-xs text-gray-500">
                                            <CheckCircleIcon className="w-3 h-3 text-gray-400" />
                                            <span className="truncate">{lesson.title}</span>
                                        </div>
                                    ))}
                                    {module.lessons?.length > 3 && (
                                        <div className="text-xs text-gray-400">
                                            +{module.lessons.length - 3} mais lições
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Module Mode - Visão detalhada do módulo
    const ModuleMode = () => (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => setViewMode('overview')}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Voltar ao curso</span>
            </button>

            {/* Module Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                        {selectedModule?.index + 1}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{selectedModule?.title}</h1>
                        <p className="text-gray-600 text-lg">{selectedModule?.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedModule?.lessons?.length || 0}</div>
                        <div className="text-sm text-gray-600">Lições</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {selectedModule?.lessons?.reduce((total, lesson) => total + (lesson.activities?.length || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-gray-600">Atividades</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                            {selectedModule?.lessons?.reduce((total, lesson) => {
                                const duration = lesson.estimated_duration || '15min';
                                return total + parseInt(duration.replace('min', ''));
                            }, 0) || 0}min
                        </div>
                        <div className="text-sm text-gray-600">Duração</div>
                    </div>
                </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Lições do Módulo</h2>
                {selectedModule?.lessons?.map((lesson, lessonIndex) => (
                    <div
                        key={lessonIndex}
                        onClick={() => handleLessonClick(lesson, lessonIndex)}
                        className="bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-semibold">
                                    {lessonIndex + 1}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                        <div className="flex items-center space-x-1">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>{lesson.estimated_duration || '15min'}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            <span>{lesson.activities?.length || 0} atividades</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <CheckCircleIcon className="w-6 h-6 text-gray-300" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Lesson Mode - Visão detalhada da lição
    const LessonMode = () => (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => setViewMode('module')}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Voltar ao módulo</span>
            </button>

            {/* Lesson Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                        {selectedLesson?.index + 1}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{selectedLesson?.title}</h1>
                        <div className="flex items-center space-x-4 text-gray-600 mt-2">
                            <div className="flex items-center space-x-1">
                                <ClockIcon className="w-5 h-5" />
                                <span>{selectedLesson?.estimated_duration || '15min'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <CheckCircleIcon className="w-5 h-5" />
                                <span>{selectedLesson?.activities?.length || 0} atividades</span>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedLesson?.content && (
                    <div className="prose max-w-none">
                        <p className="text-gray-700">{selectedLesson.content}</p>
                    </div>
                )}
            </div>

            {/* Activities */}
            {selectedLesson?.activities && selectedLesson.activities.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Atividades da Lição</h2>
                    {selectedLesson.activities.map((activity, activityIndex) => (
                        <div key={activityIndex} className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-semibold text-sm">
                                    {activityIndex + 1}
                                </div>
                                <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(activity.difficulty)}`}>
                                    {activity.difficulty || 'Intermediário'}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-4">{activity.description}</p>
                            {activity.points && (
                                <div className="flex items-center space-x-2">
                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm text-gray-600">{activity.points} pontos</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <SparklesIcon className="w-8 h-8 text-indigo-600" />
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Canvas do Curso
                            </h2>
                            <p className="text-gray-600">Visualização interativa do curso gerado pela IA</p>
                        </div>
                    </div>

                    {/* View Mode Selector */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode('overview')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                viewMode === 'overview'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Visão Geral
                        </button>
                        {selectedModule && (
                            <button
                                onClick={() => setViewMode('module')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    viewMode === 'module'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Módulo
                            </button>
                        )}
                        {selectedLesson && (
                            <button
                                onClick={() => setViewMode('lesson')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    viewMode === 'lesson'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Lição
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="EduAI Canvas" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {viewMode === 'overview' && <OverviewMode />}
                    {viewMode === 'module' && <ModuleMode />}
                    {viewMode === 'lesson' && <LessonMode />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}