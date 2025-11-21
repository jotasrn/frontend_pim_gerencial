import React, { useState, useEffect, useMemo } from 'react';
import { X, User, Briefcase, Mail, Phone, RefreshCw } from 'lucide-react';
import { showToast } from '../Toast';
import { Fornecedor } from '../../types';

type FornecedorData = Omit<Fornecedor, 'id'>;

interface FornecedorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FornecedorData) => Promise<boolean>;
  initialData?: Fornecedor | null;
  isEditing?: boolean;
}

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '') 
    .replace(/^(\d{2})(\d)/, '$1.$2') 
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3') 
    .replace(/\.(\d{3})(\d)/, '.$1/$2') 
    .replace(/(\d{4})(\d)/, '$1-$2') 
    .substring(0, 18); 
};

const formatTelefone = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    return cleaned
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 14);
  } else {
    return cleaned
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  }
};

const FornecedorForm: React.FC<FornecedorFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const initialFormState = useMemo(() => ({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    ativo: true,
  }), []);

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Partial<Pick<FornecedorData, 'nome'>>>({});
  const [loading, setLoading] = useState(false);
  const [isInactive, setIsInactive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setFormData({
          nome: initialData.nome || '',
          cnpj: formatCNPJ(initialData.cnpj || ''),
          email: initialData.email || '',
          telefone: formatTelefone(initialData.telefone || ''),
          ativo: initialData.ativo ?? true,
        });
        setIsInactive(!initialData.ativo);
      } else {
        setFormData(initialFormState);
        setIsInactive(false);
      }
      setErrors({});
    }
  }, [initialData, isEditing, isOpen, initialFormState]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    let formattedValue = value;

    if (field === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (field === 'telefone') {
      formattedValue = formatTelefone(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof errors];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Pick<FornecedorData, 'nome'>> = {};
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
      const dataParaEnviar: FornecedorData = {
        nome: formData.nome,
        cnpj: formData.cnpj.replace(/\D/g, ''), 
        email: formData.email,
        telefone: formData.telefone.replace(/\D/g, ''), 
        ativo: true,
      };
      await onSubmit(dataParaEnviar);
    } catch (error) {
      console.error("Erro no handleSubmit do FornecedorForm:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {isEditing ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="fornecedor-nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <User className="w-4 h-4 inline mr-1 text-gray-500" /> Nome *
            </label>
            <input
              id="fornecedor-nome" type="text" value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className={`input ${errors.nome ? 'input-error' : ''}`}
              placeholder="Nome do Fornecedor"
              disabled={loading}
            />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
          </div>
          <div>
            <label htmlFor="fornecedor-cnpj" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Briefcase className="w-4 h-4 inline mr-1 text-gray-500" /> CNPJ
            </label>
            <input
              id="fornecedor-cnpj" type="text" value={formData.cnpj}
              onChange={(e) => handleInputChange('cnpj', e.target.value)}
              className="input"
              placeholder="00.000.000/0001-00"
              maxLength={18} 
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="fornecedor-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Mail className="w-4 h-4 inline mr-1 text-gray-500" /> Email
            </label>
            <input
              id="fornecedor-email" type="email" value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input"
              placeholder="contato@fornecedor.com"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="fornecedor-telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Phone className="w-4 h-4 inline mr-1 text-gray-500" /> Telefone
            </label>
            <input
              id="fornecedor-telefone" type="tel" value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              className="input"
              placeholder="(61) 99999-8888"
              maxLength={15} 
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isInactive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none disabled:opacity-50`}
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Salvando...' : (
                isInactive ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reativar e Salvar
                  </>
                ) : (
                  isEditing ? 'Atualizar' : 'Criar'
                )
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`
  .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
  .input-error { @apply border-red-500 focus:ring-red-500; }
 `}</style>
    </div>
  );
};

export default FornecedorForm;