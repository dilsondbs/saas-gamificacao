import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        type: 'completion',
        points_value: 50,
        color: '#6B7280',
        criteria: {
            type: 'completion',
            target_value: 1
        },
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted with data:', data);
        
        post(route('admin.badges.store'), {
            onSuccess: () => {
                console.log('Badge created successfully');
                reset();
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
            },
            transform: (data) => {
                // Ensure criteria is a proper object and points_value is integer
                const transformedData = {
                    ...data,
                    criteria: typeof data.criteria === 'object' ? data.criteria : { type: data.type, target_value: 1 },
                    points_value: parseInt(data.points_value) || 0
                };
                console.log('Badge form submitting:', transformedData);
                return transformedData;
            }
        });
    };

    const handleCriteriaChange = (field, value) => {
        const newCriteria = {
            ...data.criteria,
            [field]: value
        };
        setData('criteria', newCriteria);
    };

    const getTypeIcon = (type) => {
        const icons = {
            completion: '✅',
            points: '⭐',
            streak: '🔥',
            special: '👑'
        };
        return icons[type] || '🏅';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        🏅 Criar Novo Badge
                    </h2>
                    <Link
                        href={route('admin.badges.index')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        ← Voltar
                    </Link>
                </div>
            }
        >
            <Head title="Criar Badge" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                
                                {/* Preview */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Preview do Badge</h3>
                                    <div className="flex items-center space-x-4">
                                        <div 
                                            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                                            style={{ backgroundColor: data.color }}
                                        >
                                            {getTypeIcon(data.type)}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-900">{data.name || 'Nome do Badge'}</h4>
                                            <p className="text-gray-600">{data.description || 'Descrição do badge'}</p>
                                            <p className="text-sm text-indigo-600 font-medium">⭐ {data.points_value} pontos</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nome do Badge <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Ex: Primeiro Curso Concluído"
                                            required
                                        />
                                        {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Badge <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => {
                                                const newType = e.target.value;
                                                const defaultCriteria = {
                                                    completion: { type: 'completion', target_value: 1 },
                                                    points: { type: 'points', target_value: 100 },
                                                    streak: { type: 'streak', target_value: 7 },
                                                    special: { type: 'special', description: '' }
                                                };
                                                
                                                setData(data => ({
                                                    ...data,
                                                    type: newType,
                                                    criteria: defaultCriteria[newType] || { type: newType, target_value: 1 }
                                                }));
                                            }}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="completion">✅ Conclusão</option>
                                            <option value="points">⭐ Pontos</option>
                                            <option value="streak">🔥 Sequência</option>
                                            <option value="special">👑 Especial</option>
                                        </select>
                                        {errors.type && <div className="text-red-600 text-sm mt-1">{errors.type}</div>}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descrição <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Descreva o que o usuário precisa fazer para conquistar este badge..."
                                        required
                                    />
                                    {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Points Value */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Valor em Pontos
                                        </label>
                                        <input
                                            type="number"
                                            value={data.points_value}
                                            onChange={(e) => setData('points_value', parseInt(e.target.value) || 0)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            min="0"
                                            placeholder="50"
                                        />
                                        {errors.points_value && <div className="text-red-600 text-sm mt-1">{errors.points_value}</div>}
                                    </div>

                                    {/* Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cor do Badge
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="color"
                                                value={data.color}
                                                onChange={(e) => setData('color', e.target.value)}
                                                className="h-10 w-20 rounded-md border border-gray-300 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={data.color}
                                                onChange={(e) => setData('color', e.target.value)}
                                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                placeholder="#6B7280"
                                            />
                                        </div>
                                        {errors.color && <div className="text-red-600 text-sm mt-1">{errors.color}</div>}
                                    </div>
                                </div>

                                {/* Criteria Section */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Critérios para Conquista</h3>
                                    
                                    {data.type === 'completion' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Número de Conclusões Necessárias
                                            </label>
                                            <input
                                                type="number"
                                                value={data.criteria.target_value || 1}
                                                onChange={(e) => handleCriteriaChange('target_value', parseInt(e.target.value) || 1)}
                                                className="w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                min="1"
                                                placeholder="1"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                O usuário precisa completar {data.criteria.target_value || 1} curso(s) para ganhar este badge.
                                            </p>
                                        </div>
                                    )}

                                    {data.type === 'points' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Pontos Necessários
                                            </label>
                                            <input
                                                type="number"
                                                value={data.criteria.target_value || 100}
                                                onChange={(e) => handleCriteriaChange('target_value', parseInt(e.target.value) || 100)}
                                                className="w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                min="1"
                                                placeholder="100"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                O usuário precisa acumular {data.criteria.target_value || 100} pontos para ganhar este badge.
                                            </p>
                                        </div>
                                    )}

                                    {data.type === 'streak' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Dias Consecutivos
                                            </label>
                                            <input
                                                type="number"
                                                value={data.criteria.target_value || 7}
                                                onChange={(e) => handleCriteriaChange('target_value', parseInt(e.target.value) || 7)}
                                                className="w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                min="1"
                                                placeholder="7"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                O usuário precisa acessar a plataforma por {data.criteria.target_value || 7} dias consecutivos.
                                            </p>
                                        </div>
                                    )}

                                    {data.type === 'special' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Critério Especial
                                            </label>
                                            <textarea
                                                value={data.criteria.description || ''}
                                                onChange={(e) => handleCriteriaChange('description', e.target.value)}
                                                rows={3}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                placeholder="Descreva o critério especial para este badge..."
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Badges especiais são concedidos manualmente por administradores.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                        Badge ativo (usuários podem conquistar este badge)
                                    </label>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                                    <Link
                                        href={route('admin.badges.index')}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded transition"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
                                    >
                                        {processing ? '⏳ Criando...' : '✅ Criar Badge'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}