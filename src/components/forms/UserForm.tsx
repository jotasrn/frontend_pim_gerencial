import React, { useState, useEffect, useMemo } from 'react';
// Ícones não utilizados ('Phone', 'MapPin') foram removidos
import { X, User, Mail, Lock } from 'lucide-react';
import { showToast } from '../Toast';
import { Usuario, UsuarioData, TipoUsuario } from '../../types';

// --- Interfaces para Tipagem ---

// Define a estrutura dos dados do formulário
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
  onSubmit: (userData: UsuarioData | Partial<UsuarioData>) => Promise<void>;
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
          nomeCompleto: initialData.nomeCompleto || initialData.nome || '',
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
    if (!formData.nomeCompleto.trim()) newErrors.nomeCompleto = 'Nome é obrigatório';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    
    if (!isEditing) {
      if (!formData.senha || formData.senha.length < 6) newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
      if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = 'As senhas não coincidem';
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
      const submitData: Partial<UsuarioData> = { ...formData };
      delete (submitData as Partial<UserFormData>).confirmarSenha;
      
      if (isEditing && !submitData.senha) {
        delete submitData.senha;
      }
      
      await onSubmit(submitData as UsuarioData);
      onClose();
    } catch {
      showToast.error('Erro ao salvar usuário.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Editar Usuário' : 'Adicionar Usuário'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-2" /> Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.nomeCompleto ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nomeCompleto && <p className="text-red-500 text-sm mt-1">{errors.nomeCompleto}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-2" /> Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Função *</label>
                <select
                  value={formData.permissao}
                  onChange={(e) => handleInputChange('permissao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!isEditing && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Credenciais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Lock className="w-4 h-4 inline mr-2" /> Senha *
                  </label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.senha ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Lock className="w-4 h-4 inline mr-2" /> Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmarSenha}
                    onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.confirmarSenha ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.confirmarSenha && <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center">
            <input type="checkbox" id="ativo" checked={formData.ativo} onChange={(e) => handleInputChange('ativo', e.target.checked)} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"/>
            <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">Usuário ativo</label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Usuário')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;