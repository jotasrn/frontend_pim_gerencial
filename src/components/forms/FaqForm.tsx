import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { showToast } from '../Toast';
import { Faq } from '../../types';

type FaqData = Omit<Faq, 'id' | 'createdAt' | 'updatedAt'>;

interface FaqFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FaqData) => Promise<boolean>;
  initialData?: Faq | null;
  isEditing?: boolean;
}

const FaqForm: React.FC<FaqFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const initialFormState = useMemo(() => ({
    pergunta: '',
    resposta: '',
    categoria: 'Geral', // Categoria padrão
    ativo: true,
  }), []);

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Partial<typeof initialFormState>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setFormData({
          pergunta: initialData.pergunta || '',
          resposta: initialData.resposta || '',
          categoria: initialData.categoria || 'Geral',
          ativo: initialData.ativo ?? true,
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
    }
  }, [initialData, isEditing, isOpen, initialFormState]);

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.pergunta.trim()) newErrors.pergunta = 'A pergunta é obrigatória';
    if (!formData.resposta.trim()) newErrors.resposta = 'A resposta é obrigatória';
    if (!formData.categoria.trim()) newErrors.categoria = 'A categoria é obrigatória';
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
      await onSubmit(formData);
    } catch (error) {
      console.error("Erro no handleSubmit do FaqForm:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Editar FAQ' : 'Adicionar FAQ'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label htmlFor="faq-categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria *
            </label>
            <input
              id="faq-categoria"
              type="text"
              value={formData.categoria}
              onChange={(e) => handleInputChange('categoria', e.target.value)}
              className={`input ${errors.categoria ? 'input-error' : ''}`}
              placeholder="Ex: Pagamentos, Entrega, Conta"
              disabled={loading}
            />
            {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>}
          </div>
          
          <div>
            <label htmlFor="faq-pergunta" className="block text-sm font-medium text-gray-700 mb-1">
              Pergunta *
            </label>
            <textarea
              id="faq-pergunta"
              rows={2}
              value={formData.pergunta}
              onChange={(e) => handleInputChange('pergunta', e.target.value)}
              className={`textarea ${errors.pergunta ? 'input-error' : ''}`}
              placeholder="Digite a pergunta..."
              disabled={loading}
            />
            {errors.pergunta && <p className="text-red-500 text-xs mt-1">{errors.pergunta}</p>}
          </div>

          <div>
            <label htmlFor="faq-resposta" className="block text-sm font-medium text-gray-700 mb-1">
              Resposta *
            </label>
            <textarea
              id="faq-resposta"
              rows={5}
              value={formData.resposta}
              onChange={(e) => handleInputChange('resposta', e.target.value)}
              className={`textarea ${errors.resposta ? 'input-error' : ''}`}
              placeholder="Digite a resposta completa..."
              disabled={loading}
            />
            {errors.resposta && <p className="text-red-500 text-xs mt-1">{errors.resposta}</p>}
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox" id="faq-ativo" checked={formData.ativo}
              onChange={(e) => handleInputChange('ativo', e.target.checked)}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-offset-0 focus:ring-2 focus:ring-green-500"
              disabled={loading}
            />
            <label htmlFor="faq-ativo" className="ml-2 block text-sm text-gray-900 select-none">Ativo (visível para clientes)</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar FAQ' : 'Criar FAQ')}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed; }
        .input-error { @apply border-red-500 focus:ring-red-500; }
        .textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed; }
      `}</style>
    </div>
  );
};

export default FaqForm;