import React, { useState, useEffect, useMemo } from 'react';
import { X, User, Mail, Lock, Car, ClipboardIcon } from 'lucide-react';
import { showToast } from '../Toast';
import { Usuario, UsuarioData, TipoUsuario } from '../../types';

interface UserFormData {
  nomeCompleto: string;
  email: string;
  senha?: string;
  confirmarSenha?: string;
  permissao: TipoUsuario;
  ativo: boolean;
  tipoVeiculo?: string;
  placaVeiculo?: string;
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
    tipoVeiculo: '',
    placaVeiculo: '',
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
          tipoVeiculo: initialData.tipoVeiculo || '',
          placaVeiculo: initialData.placaVeiculo || '',
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

  const vehicleTypes = [
    { value: 'MOTOCICLETA', label: 'Motocicleta' },
    { value: 'CARRO', label: 'Carro' },
    { value: 'UTILITARIO', label: 'Utilitário (ex: Fiorino)' },
    { value: 'BICICLETA', label: 'Bicicleta' },
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

    if (formData.permissao === 'entregador') {
      if (!formData.tipoVeiculo) {
        newErrors.tipoVeiculo = 'Tipo de veículo é obrigatório';
      }
      if (formData.tipoVeiculo !== 'BICICLETA' && !formData.placaVeiculo?.trim()) {
        newErrors.placaVeiculo = 'Placa é obrigatória para este veículo';
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
      const submitData: Partial<UsuarioData> & { tipoVeiculo?: string; placaVeiculo?: string } = {
        nomeCompleto: formData.nomeCompleto,
        email: formData.email,
        permissao: formData.permissao,
        ativo: formData.ativo,
      };

      if (!isEditing || (isEditing && formData.senha)) {
        submitData.senha = formData.senha;
      }

      if (formData.permissao === 'entregador') {
        submitData.tipoVeiculo = formData.tipoVeiculo;
        submitData.placaVeiculo = formData.tipoVeiculo === 'BICICLETA' ? '' : formData.placaVeiculo;
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{isEditing ? 'Editar Usuário' : 'Adicionar Usuário'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none" disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="user-nomeCompleto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <User className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Nome Completo *
                </label>
                <input
                  id="user-nomeCompleto" type="text" value={formData.nomeCompleto}
                  onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                  className={`input ${errors.nomeCompleto ? 'input-error' : ''}`}
                  disabled={loading} />
                {errors.nomeCompleto && <p className="text-red-500 text-xs mt-1">{errors.nomeCompleto}</p>}
              </div>
              <div>
                <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Mail className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Email *
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
            <label htmlFor="user-permissao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Função *</label>
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

          {formData.permissao === 'entregador' && (
            <div className="pt-5 mt-5 border-t dark:border-gray-600">
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
                Informações do Veículo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="user-tipoVeiculo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Car className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Tipo de Veículo *
                  </label>
                  <select
                    id="user-tipoVeiculo"
                    value={formData.tipoVeiculo}
                    onChange={(e) => handleInputChange('tipoVeiculo', e.target.value)}
                    className={`select w-full ${errors.tipoVeiculo ? 'input-error' : ''}`}
                    disabled={loading}
                  >
                    <option value="">Selecione...</option>
                    {vehicleTypes.map((v) => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                  {errors.tipoVeiculo && <p className="text-red-500 text-xs mt-1">{errors.tipoVeiculo}</p>}
                </div>
                <div>
                  <label htmlFor="user-placaVeiculo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <ClipboardIcon className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Placa {formData.tipoVeiculo !== 'BICICLETA' ? '*' : ''}
                  </label>
                  <input
                    id="user-placaVeiculo"
                    type="text"
                    value={formData.placaVeiculo}
                    onChange={(e) => handleInputChange('placaVeiculo', e.target.value)}
                    className={`input ${errors.placaVeiculo ? 'input-error' : ''}`}
                    placeholder={formData.tipoVeiculo === 'BICICLETA' ? 'N/A' : 'AAA-1234'}
                    disabled={loading || formData.tipoVeiculo === 'BICICLETA' || !formData.tipoVeiculo}
                  />
                  {errors.placaVeiculo && <p className="text-red-500 text-xs mt-1">{errors.placaVeiculo}</p>}
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3 border-b dark:border-gray-600 pb-2">
              {isEditing ? 'Alterar Senha (Opcional)' : 'Definir Senha *'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="user-senha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Lock className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Senha {isEditing ? '' : '*'}
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
                <label htmlFor="user-confirmarSenha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Lock className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Confirmar Senha {isEditing ? '' : '*'}
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
              className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-offset-0 focus:ring-2 focus:ring-indigo-500"
              disabled={loading} />
            <label htmlFor="user-ativo" className="ml-2 block text-sm text-gray-900 dark:text-gray-200 select-none">Usuário ativo no sistema</label>
          </div>

          <div className="flex justify-end space-x-3 pt-5 border-t dark:border-gray-700 mt-6 sticky bottom-0 bg-white dark:bg-gray-800 py-4 px-6 z-10">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
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
    .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100 dark:disabled:bg-gray-700/50; }
    .input-error { @apply border-red-500 focus:ring-red-500; }
    .select { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100 dark:disabled:bg-gray-700/50; }
    .textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100 dark:disabled:bg-gray-700/50; }
   `}</style>
    </div>
  );
};

export default UserForm;