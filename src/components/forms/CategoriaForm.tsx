import React, { useState, useEffect, useMemo } from 'react';
import { X, Tag } from 'lucide-react';
import { showToast } from '../Toast';
import { Categoria } from '../../types';

type CategoriaData = Omit<Categoria, 'id'>;

interface CategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CategoriaData) => Promise<boolean>;
    initialData?: Categoria | null;
    isEditing?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isEditing = false,
}) => {
    const initialFormState = useMemo(() => ({
        nome: '',
        descricao: '',
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<Partial<typeof initialFormState>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setFormData({
                    nome: initialData.nome || '',
                    descricao: initialData.descricao || '',
                });
            } else {
                setFormData(initialFormState);
            }
            setErrors({});
        }
    }, [initialData, isEditing, isOpen, initialFormState]);

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Partial<typeof formData> = {};
        if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            showToast.error('Por favor, corrija os erros no formulário');
            return;
        }
        setLoading(true);
        try {
            const dataParaEnviar: CategoriaData = {
                nome: formData.nome,
                descricao: formData.descricao,
            };
            await onSubmit(dataParaEnviar);
        } catch (error) {
            console.error("Erro inesperado no handleSubmit do CategoryForm:", error);
            showToast.error("Ocorreu um erro inesperado no formulário.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {isEditing ? 'Editar Categoria' : 'Adicionar Categoria'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none" disabled={loading}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="cat-nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Tag className="w-4 h-4 inline mr-1 text-gray-500" /> Nome *
                        </label>
                        <input
                            id="cat-nome"
                            type="text"
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            className={`input ${errors.nome ? 'input-error' : ''}`}
                            placeholder="Ex: Frutas"
                            disabled={loading}
                        />
                        {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                    </div>

                    <div>
                        <label htmlFor="cat-descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descrição
                        </label>
                        <textarea
                            id="cat-descricao"
                            rows={3}
                            value={formData.descricao}
                            onChange={(e) => handleInputChange('descricao', e.target.value)}
                            className="textarea"
                            placeholder="Opcional: Detalhes sobre a categoria..."
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Salvando...
                                </>) : (isEditing ? 'Atualizar' : 'Criar')}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
       .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
   .input-error { @apply border-red-500 focus:ring-red-500; }
       .textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
      `}</style>
        </div>
    );
};

export default CategoryForm;