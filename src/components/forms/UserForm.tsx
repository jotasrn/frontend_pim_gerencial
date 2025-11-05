import React, { useState, useEffect, useMemo } from 'react';
import { X, User, Mail, Lock } from 'lucide-react';
import { showToast } from '../Toast';
import { Usuario, UsuarioData, TipoUsuario } from '../../types';

interface UserFormData {
  nomeCompleto: string;
  email: string;
  senha?: string;
  confirmarSenha?: string;
  permissao: TipoUsuario;
  ativo: boolean;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UsuarioData | Partial<UsuarioData>) => Promise<boolean>;
  initialData?: Usuario | null;
  isEditing?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const initialFormState = useMemo((): UserFormData => ({
    nomeCompleto: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    permissao: 'gerente',
    ativo: true,
  }), []);

  const [formData, setFormData] = useState<UserFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setFormData({
          nomeCompleto: initialData.nomeCompleto || '',
          email: initialData.email || '',
          senha: '',
          confirmarSenha: '',
          permissao: initialData.permissao || 'gerente',
          ativo: initialData.ativo ?? true,
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
    }
  }, [initialData, isEditing, isOpen, initialFormState]);

  const roles = [
    { value: 'gerente', label: 'Gerente' },
    { value: 'estoquista', label: 'Estoquista' },
    { value: 'entregador', label: 'Entregador' },
  ];

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
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
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};
    if (!formData.nomeCompleto.trim()) newErrors.nomeCompleto = 'Nome completo é obrigatório';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';

    if (!isEditing || (isEditing && formData.senha)) {
      if (!formData.senha || formData.senha.length < 6) {
        newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
      }
      if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = 'As senhas não coincidem';
      }
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
      const submitData: Partial<UsuarioData> = {
        nomeCompleto: formData.nomeCompleto,
        email: formData.email,
        permissao: formData.permissao,
        ativo: formData.ativo,
      };

      if (!isEditing || (isEditing && formData.senha)) {
        submitData.senha = formData.senha;
      }

      await onSubmit(submitData as UsuarioData);

    } catch (error) {
      console.error("Erro inesperado no handleSubmit do UserForm:", error);
      showToast.error("Ocorreu um erro inesperado no formulário.");
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Editar Usuário' : 'Adicionar Usuário'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none" disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="user-nomeCompleto" className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1 text-gray-500" /> Nome Completo *
                </label>
                <input
                  id="user-nomeCompleto" type="text" value={formData.nomeCompleto}
                  onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                  className={`input ${errors.nomeCompleto ? 'input-error' : ''}`}
                  disabled={loading} />
                {errors.nomeCompleto && <p className="text-red-500 text-xs mt-1">{errors.nomeCompleto}</p>}
              </div>
              <div>
                <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1 text-gray-500" /> Email *
                </label>
                <input
                  id="user-email" type="email" value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  disabled={loading} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="user-permissao" className="block text-sm font-medium text-gray-700 mb-1">Função *</label>
            <select
              id="user-permissao" value={formData.permissao}
              onChange={(e) => handleInputChange('permissao', e.target.value as TipoUsuario)}
              className="select w-full"
              disabled={loading} >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-800 mb-3 border-b pb-2">
              {isEditing ? 'Alterar Senha (Opcional)' : 'Definir Senha *'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="user-senha" className="block text-sm font-medium text-gray-700 mb-1">
                  <Lock className="w-4 h-4 inline mr-1 text-gray-500" /> Senha {isEditing ? '' : '*'}
                </label>
                <input
                  id="user-senha" type="password" value={formData.senha}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  className={`input ${errors.senha ? 'input-error' : ''}`}
                  placeholder={isEditing ? 'Deixe em branco para manter a atual' : 'Mínimo 6 caracteres'}
                  disabled={loading} />
                {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha}</p>}
              </div>
              <div>
                <label htmlFor="user-confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                  <Lock className="w-4 h-4 inline mr-1 text-gray-500" /> Confirmar Senha {isEditing ? '' : '*'}
                </label>
                <input
                  id="user-confirmarSenha" type="password" value={formData.confirmarSenha}
                  onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                  className={`input ${errors.confirmarSenha ? 'input-error' : ''}`}
                  placeholder={isEditing ? 'Deixe em branco para manter a atual' : 'Repita a senha'}
                  disabled={loading} />
                {errors.confirmarSenha && <p className="text-red-500 text-xs mt-1">{errors.confirmarSenha}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox" id="user-ativo" checked={formData.ativo}
              onChange={(e) => handleInputChange('ativo', e.target.checked)}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-offset-0 focus:ring-2 focus:ring-green-500"
              disabled={loading} />
            <label htmlFor="user-ativo" className="ml-2 block text-sm text-gray-900 select-none">Usuário ativo no sistema</label>
          </div>

          <div className="flex justify-end space-x-3 pt-5 border-t mt-6 sticky bottom-0 bg-white py-4 px-6 z-10">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              disabled={loading} >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar Usuário' : 'Criar Usuário')}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed; }
        .input-error { @apply border-red-500 focus:ring-red-500; }
        .select { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed; }
        .textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed; }
      `}</style>
    </div>
  );
};

export default UserForm;