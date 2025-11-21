import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/TemaContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  UserCircle, Mail, ShieldCheck, Car, ClipboardIcon, 
  Save, X, Edit, AlertCircle, Moon, Sun 
} from 'lucide-react';
import { entregadorService, EntregadorPerfilUpdateDTO } from '../services/entregadorService';
import { usuarioService } from '../services/usuarioService';
import { showToast } from '../components/Toast';
import { Usuario } from '../types';
import ChangePasswordModal from '../components/modals/AlterarSenhaModal';

const UserProfile: React.FC = () => {
  const { usuario, carregando: carregandoAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    nomeCompleto: '',
    tipoVeiculo: '',
    placaVeiculo: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const carregarDadosPerfil = useCallback(async () => {
    if (!usuario) {
      setIsPageLoading(false);
      return;
    }

    setIsPageLoading(true);
    setError(null);
    try {
      const nome = usuario.nomeCompleto;
      let tipoVeiculo = '';
      let placaVeiculo = '';

      if (usuario.permissao === 'entregador') {
        const dadosEntregador = await entregadorService.buscarMeuPerfil();
        tipoVeiculo = dadosEntregador.tipoVeiculo || '';
        placaVeiculo = dadosEntregador.placaVeiculo || '';
      }

      setFormData({
        nomeCompleto: nome,
        tipoVeiculo,
        placaVeiculo,
      });

    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os dados detalhados do perfil.');
    } finally {
      setIsPageLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (!isEditing) {
      carregarDadosPerfil();
    }
  }, [usuario, isEditing, carregarDadosPerfil]);

  const getRoleLabel = (role?: string) => {
    if (!role) return 'N/A';
    if (role.toLowerCase() === 'gerente') return 'Gerente';
    if (role.toLowerCase() === 'entregador') return 'Entregador';
    if (role.toLowerCase() === 'estoquista') return 'Estoquista';
    if (role.toLowerCase() === 'cliente') return 'Cliente';
    return role;
  };

  const formatLicensePlate = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return cleaned.slice(0, 7);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'placaVeiculo') {
        setFormData(prev => ({ ...prev, [name]: formatLicensePlate(value) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    carregarDadosPerfil();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setIsLoading(true);

    try {
      if (usuario.permissao === 'entregador') {
        const dados: EntregadorPerfilUpdateDTO = {
          tipoVeiculo: formData.tipoVeiculo,
          placaVeiculo: formData.placaVeiculo,
        };
        await entregadorService.atualizarMeuPerfil(dados);
      } else {
        const dadosUsuario: Partial<Usuario> = {
          nomeCompleto: formData.nomeCompleto,
          email: usuario.email
        };
        await usuarioService.atualizar(usuario.id, dadosUsuario);
      }

      showToast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      carregarDadosPerfil();

    } catch (error) {
      showToast.error('Falha ao atualizar o perfil.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isLoadingTotal = carregandoAuth || isPageLoading;

  if (isLoadingTotal) {
    return (
      <Layout title="Meu Perfil">
        <LoadingSpinner text="Carregando perfil..." />
      </Layout>
    );
  }

  if (!usuario || error) {
    return (
      <Layout title="Erro">
        <div className='text-red-600 text-center bg-red-50 dark:bg-red-900/20 dark:text-red-300 p-6 rounded-lg'>
          <AlertCircle className="mx-auto h-12 w-12 mb-4" />
          <p className="font-semibold">{error || 'Erro ao carregar dados do usuário.'}</p>
          <p>Tente fazer login novamente.</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Layout title="Meu Perfil">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8 max-w-2xl mx-auto border dark:border-gray-700">
          <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Informações da Conta</h2>
            {usuario.permissao === 'entregador' && !isEditing && (
              <button 
                type="button" 
                onClick={() => setIsEditing(true)} 
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-3 py-1.5 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-70"
              >
                <Edit className="w-4 h-4" />
                Editar Perfil
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center min-h-[30px]">
              <UserCircle className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mb-1 sm:mb-0" />
              <label htmlFor="nomeCompleto" className="text-sm font-medium text-gray-600 dark:text-gray-300 sm:w-28">Nome:</label>
              <input
                type="text"
                id="nomeCompleto"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                readOnly
                disabled
                className="input-profile"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center min-h-[30px]">
              <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mb-1 sm:mb-0" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 sm:w-28">Email:</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{usuario.email}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center min-h-[30px]">
              <ShieldCheck className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mb-1 sm:mb-0" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 sm:w-28">Função:</span>
              <span className="text-sm text-gray-800 dark:text-gray-100 capitalize">{getRoleLabel(usuario.permissao)}</span>
            </div>

            {usuario.permissao === 'entregador' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center min-h-[30px]">
                  <Car className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mb-1 sm:mb-0" />
                  <label htmlFor="tipoVeiculo" className="text-sm font-medium text-gray-600 dark:text-gray-300 sm:w-28">Veículo:</label>
                  <select
                    id="tipoVeiculo"
                    name="tipoVeiculo"
                    value={formData.tipoVeiculo}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    className="input-profile"
                  >
                    <option value="">Selecione...</option>
                    <option value="MOTOCICLETA">Motocicleta</option>
                    <option value="CARRO">Carro</option>
                    <option value="UTILITARIO">Utilitário (ex: Fiorino)</option>
                    <option value="BICICLETA">Bicicleta</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center min-h-[30px]">
                  <ClipboardIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mb-1 sm:mb-0" />
                  <label htmlFor="placaVeiculo" className="text-sm font-medium text-gray-600 dark:text-gray-300 sm:w-28">Placa:</label>
                  <input
                    type="text"
                    id="placaVeiculo"
                    name="placaVeiculo"
                    value={formData.placaVeiculo}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading || formData.tipoVeiculo === 'BICICLETA'}
                    className="input-profile uppercase"
                    maxLength={7} 
                    placeholder={formData.tipoVeiculo === 'BICICLETA' ? 'N/A' : 'ABC1234'}
                  />
                </div>
              </>
            )}
          </div>

          {isEditing && (
            <div className="mt-8 pt-6 border-t dark:border-gray-700 flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={handleCancel} 
                disabled={isLoading} 
                className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium px-4 py-2 rounded-md shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-70"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="inline-flex items-center gap-2 bg-green-600 text-white font-medium px-4 py-2 rounded-md shadow hover:bg-green-700 transition disabled:opacity-70"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          )}

          {!isEditing && (
            <>
              <div className="mt-8 pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Aparência</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Tema atual: {theme === 'dark' ? 'Escuro' : 'Claro'}
                  </span>
                  <button 
                    type="button" 
                    onClick={toggleTheme} 
                    className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium px-4 py-2 rounded-md shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-70"
                  >
                    {theme === 'dark' ? <><Sun className="w-4 h-4 text-yellow-400" /> Modo Claro</> : <><Moon className="w-4 h-4" /> Modo Escuro</>}
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Ações da Conta</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsPasswordModalOpen(true)} 
                    className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium px-4 py-2 rounded-md shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-70"
                  >
                    Alterar Senha
                  </button>
                </div>
              </div>
            </>
          )}
        </form>

        <style>{`
          .input-profile {
            @apply text-sm text-gray-800 dark:text-gray-100 flex-1 bg-transparent rounded-md transition-colors;
          }
          .input-profile:not(:disabled) {
            @apply px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500;
          }
          .input-profile:disabled {
            @apply text-gray-500 dark:text-gray-400 bg-transparent cursor-not-allowed border-transparent px-0;
          }
        `}</style>
      </Layout>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </>
  );
};

export default UserProfile;