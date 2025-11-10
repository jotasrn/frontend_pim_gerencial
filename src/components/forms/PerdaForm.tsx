import React, { useState, useEffect, useMemo } from 'react';
import { X, Package, Archive, Edit3 } from 'lucide-react';
import { showToast } from '../Toast';
import { PerdaData} from '../../types';
import { useProdutos } from '../../hooks/useProdutos';

interface PerdaFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PerdaData) => Promise<boolean>;
}

const PerdaForm: React.FC<PerdaFormProps> = ({ isOpen, onClose, onSubmit }) => {
    const { produtos, loading: loadingProdutos } = useProdutos({ ativo: true });

    const initialFormState = useMemo(() => ({
        produtoId: '',
        quantidade: '1',
        motivo: 'VENCIMENTO',
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<Partial<typeof formData>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
            setErrors({});
        }
    }, [isOpen, initialFormState]);

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: Partial<typeof formData> = {};
        if (!formData.produtoId) {
            newErrors.produtoId = 'Produto é obrigatório';
        }
        const qtd = parseInt(formData.quantidade, 10);
        if (isNaN(qtd) || qtd <= 0) {
            newErrors.quantidade = 'Quantidade deve ser maior que zero';
        }
        if (!formData.motivo) {
            newErrors.motivo = 'Motivo é obrigatório';
        }
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
            const dataParaEnviar: PerdaData = {
                produtoId: parseInt(formData.produtoId, 10),
                quantidade: parseInt(formData.quantidade, 10),
                motivo: formData.motivo,
            };
            await onSubmit(dataParaEnviar);
        } catch (error) {
            console.error("Erro no handleSubmit do PerdaForm:", error);
        } finally {
            setLoading(false);
        }
    };

    const motivosPerda = [
        { value: 'VENCIMENTO', label: 'Vencimento' },
        { value: 'AVARIA', label: 'Avaria (Quebrado/Amassado)' },
        { value: 'ARMAZENAMENTO_INCORRETO', label: 'Armazenamento Incorreto' },
        { value: 'OUTRO', label: 'Outro' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Registrar Nova Perda
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none" disabled={loading}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="produtoId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Package className="w-4 h-4 inline mr-1 text-gray-500" /> Produto *
                        </label>
                        <select
                            id="produtoId"
                            value={formData.produtoId}
                            onChange={(e) => handleInputChange('produtoId', e.target.value)}
                            className={`select ${errors.produtoId ? 'select-error' : ''}`}
                            disabled={loading || loadingProdutos}
                        >
                            <option value="">{loadingProdutos ? 'Carregando produtos...' : 'Selecione um produto'}</option>
                            {produtos.map(p => (
                                <option key={p.id} value={p.id}>{p.nome} (Estoque: {p.estoque?.quantidadeAtual ?? 0})</option>
                            ))}
                        </select>
                        {errors.produtoId && <p className="text-red-500 text-xs mt-1">{errors.produtoId}</p>}
                    </div>

                    <div>
                        <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Archive className="w-4 h-4 inline mr-1 text-gray-500" /> Quantidade Perdida *
                        </label>
                        <input
                            id="quantidade"
                            type="number"
                            min="1"
                            value={formData.quantidade}
                            onChange={(e) => handleInputChange('quantidade', e.target.value)}
                            className={`input ${errors.quantidade ? 'input-error' : ''}`}
                            disabled={loading}
                        />
                        {errors.quantidade && <p className="text-red-500 text-xs mt-1">{errors.quantidade}</p>}
                    </div>

                    <div>
                        <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Edit3 className="w-4 h-4 inline mr-1 text-gray-500" /> Motivo *
                        </label>
                        <select
                            id="motivo"
                            value={formData.motivo}
                            onChange={(e) => handleInputChange('motivo', e.target.value)}
                            className={`select ${errors.motivo ? 'select-error' : ''}`}
                            disabled={loading}
                        >
                            {motivosPerda.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                        {errors.motivo && <p className="text-red-500 text-xs mt-1">{errors.motivo}</p>}
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
                            className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registrando...
                                </>
                            ) : 'Registrar Perda'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
    .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
    .input-error { @apply border-red-500 focus:ring-red-500; }
    .select { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
    .select-error { @apply border-red-500 focus:ring-red-500; }
    .textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
   `}</style>
        </div>
    );
};

export default PerdaForm;