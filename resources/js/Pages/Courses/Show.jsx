import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    DocumentDuplicateIcon,
    EyeIcon,
    ArchiveBoxIcon,
    PlayIcon,
    UserGroupIcon,
    ClockIcon,
    CheckCircleIcon,
    StarIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline';

export default function CourseShow({ auth, course, userEnrollment, userProgress, stats, canEdit, canDelete }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const handleDelete = () => {
        router.delete(route('courses.destroy', course.id));
    };

    const handleDuplicate = () => {
        router.post(route('courses.duplicate', course.id));
    };

    const handlePublish = () => {
        router.post(route('courses.publish', course.id));
    };

    const handleArchive = () => {
        router.post(route('courses.archive', course.id));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'published': return 'Publicado';
            case 'draft': return 'Rascunho';
            case 'archived': return 'Arquivado';
            default: return status;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Link
                            href={route('courses.index')}
                            className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-1" />
                            Voltar
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {course.title}
                        </h2>
                    </div>
                    <div className="flex space-x-3">
                        {canEdit && (
                            <>
                                <Link
                                    href={route('courses.edit', course.id)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <PencilIcon className="h-4 w-4 mr-2" />
                                    Editar
                                </Link>
                                <button
                                    onClick={handleDuplicate}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                                    Duplicar
                                </button>
                                {course.status === 'draft' && course.activities.length > 0 && (
                                    <button
                                        onClick={handlePublish}
                                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <PlayIcon className="h-4 w-4 mr-2" />
                                        Publicar
                                    </button>
                                )}
                                {course.status === 'published' && (
                                    <button
                                        onClick={handleArchive}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                                        Arquivar
                                    </button>
                                )}
                            </>
                        )}
                        {canDelete && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Excluir
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={course.title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Course Overview */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-2">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}
                                                >
                                                    {getStatusText(course.status)}
                                                </span>
                                            </div>
                                            <h1 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h1>
                                            <p className="text-gray-600 leading-relaxed">{course.description}</p>
                                        </div>
                                        {course.image && (
                                            <img
                                                src={`/storage/${course.image}`}
                                                alt={course.title}
                                                className="w-32 h-24 object-cover rounded-lg ml-6"
                                            />
                                        )}
                                    </div>

                                    {/* Course Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                                        <div className="text-center">
                                            <UserGroupIcon className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                                            <div className="text-lg font-semibold text-gray-900">{stats.total_students}</div>
                                            <div className="text-sm text-gray-500">Alunos</div>
                                        </div>
                                        <div className="text-center">
                                            <ClockIcon className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                                            <div className="text-lg font-semibold text-gray-900">{stats.total_activities}</div>
                                            <div className="text-sm text-gray-500">Atividades</div>
                                        </div>
                                        <div className="text-center">
                                            <CheckCircleIcon className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                                            <div className="text-lg font-semibold text-gray-900">{stats.completion_rate}%</div>
                                            <div className="text-sm text-gray-500">Conclusão</div>
                                        </div>
                                        <div className="text-center">
                                            <StarIcon className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                                            <div className="text-lg font-semibold text-gray-900">{stats.average_rating}</div>
                                            <div className="text-sm text-gray-500">Avaliação</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Course Activities */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Atividades do Curso</h3>
                                        {canEdit && (
                                            <Link
                                                href={route('materials.upload.show', course.id)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                                Enviar Material
                                            </Link>
                                        )}
                                    </div>

                                    {course.activities.length > 0 ? (
                                        <div className="space-y-3">
                                            {course.activities.map((activity, index) => (
                                                <div key={activity.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                                                        <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {activity.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {activity.description}
                                                        </p>
                                                        <div className="flex items-center mt-1 text-xs text-gray-400">
                                                            <span className="capitalize">{activity.type}</span>
                                                            <span className="mx-2">•</span>
                                                            <span>{activity.points_value} pontos</span>
                                                            <span className="mx-2">•</span>
                                                            <span>{activity.duration_minutes} min</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        {activity.is_required && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                Obrigatório
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma atividade</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {canEdit
                                                    ? 'Comece enviando material para gerar atividades automaticamente.'
                                                    : 'Este curso ainda não possui atividades.'
                                                }
                                            </p>
                                            {canEdit && (
                                                <div className="mt-6">
                                                    <Link
                                                        href={route('materials.upload.show', course.id)}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                                        Enviar Primeiro Material
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Course Materials */}
                            {course.materials && course.materials.length > 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Materiais do Curso</h3>
                                        <div className="space-y-3">
                                            {course.materials.map((material) => (
                                                <div key={material.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {material.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {material.file_name} • {(material.file_size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <Link
                                                            href={route('materials.download', material.id)}
                                                            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                                                        >
                                                            Download
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Course Info */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Curso</h3>
                                    <dl className="space-y-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Instrutor</dt>
                                            <dd className="text-sm text-gray-900">{course.instructor?.name || 'N/A'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Pontos por Conclusão</dt>
                                            <dd className="text-sm text-gray-900">{course.points_per_completion} pontos</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Criado em</dt>
                                            <dd className="text-sm text-gray-900">
                                                {new Date(course.created_at).toLocaleDateString('pt-BR')}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Última atualização</dt>
                                            <dd className="text-sm text-gray-900">
                                                {new Date(course.updated_at).toLocaleDateString('pt-BR')}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* User Progress (for students) */}
                            {userProgress && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Meu Progresso</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Conclusão</span>
                                                <span className="font-medium text-gray-900">{userProgress.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-600 h-2 rounded-full"
                                                    style={{ width: `${userProgress.percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {userProgress.completed_activities} de {userProgress.total_activities} atividades concluídas
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Enrolled Students (for instructors) */}
                            {canEdit && course.enrollments && course.enrollments.length > 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Alunos Matriculados</h3>
                                        <div className="space-y-3">
                                            {course.enrollments.slice(0, 5).map((enrollment) => (
                                                <div key={enrollment.id} className="flex items-center">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {enrollment.user.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Matriculado em: {new Date(enrollment.enrolled_at).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {course.enrollments.length > 5 && (
                                                <p className="text-sm text-gray-500 text-center">
                                                    e mais {course.enrollments.length - 5} alunos...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <TrashIcon className="mx-auto h-16 w-16 text-red-600" />
                            <h3 className="text-lg font-medium text-gray-900 mt-2">Excluir Curso</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.
                                </p>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                                >
                                    Excluir
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-900 text-base font-medium rounded-md w-24 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Material Modal Placeholder */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <CloudArrowUpIcon className="mx-auto h-16 w-16 text-indigo-600" />
                            <h3 className="text-lg font-medium text-gray-900 mt-2">Enviar Material</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    A funcionalidade de upload será implementada na próxima etapa.
                                </p>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md w-24 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}