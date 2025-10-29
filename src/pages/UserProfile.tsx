import React from 'react';
import Layout from '../components/Layout'; 
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserCircle, Mail, ShieldCheck } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { usuario, carregando } = useAuth();

  const getRoleLabel = (role?: string) => {
    if (!role) return 'N/A';
    if (role.toLowerCase() === 'gerente') return 'Gerente';
    if (role.toLowerCase() === 'entregador') return 'Entregador';
    if (role.toLowerCase() === 'cliente') return 'Cliente';
    return role;
  };

  if (carregando) {
    return (
      <Layout title="Meu Perfil">
        <LoadingSpinner text="Carregando perfil..." />
      </Layout>
    );
  }

  if (!usuario) {
    return (
        <Layout title="Erro">
            <p className='text-red-600 text-center'>Erro ao carregar dados do usuário. Tente fazer login novamente.</p>
        </Layout>
    );
  }

  return (
    <Layout title="Meu Perfil">
      <div className="bg-white shadow-md rounded-lg p-6 md:p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">Informações da Conta</h2>

        <div className="space-y-4">
          <div className="flex items-center">
            <UserCircle className="w-5 h-5 text-gray-500 mr-3" />
            <span className="text-sm font-medium text-gray-600 w-28">Nome:</span>
            <span className="text-sm text-gray-800">{usuario.nomeCompleto}</span>
          </div>
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-500 mr-3" />
            <span className="text-sm font-medium text-gray-600 w-28">Email:</span>
            <span className="text-sm text-gray-800">{usuario.email}</span>
          </div>
           <div className="flex items-center">
            <ShieldCheck className="w-5 h-5 text-gray-500 mr-3" />
            <span className="text-sm font-medium text-gray-600 w-28">Função:</span>
            <span className="text-sm text-gray-800 capitalize">{getRoleLabel(usuario.permissao)}</span>
          </div>
          
          </div>

        <div className="mt-8 pt-6 border-t">
           <h3 className="text-lg font-semibold text-gray-700 mb-4">Ações da Conta</h3>
            <div className='flex flex-col sm:flex-row gap-3'>
                <button className='btn btn-outline btn-sm border-indigo-500 text-indigo-600 hover:bg-indigo-50'>
                    Alterar Senha 
                </button>
                 <button className='btn btn-outline btn-sm border-gray-500 text-gray-600 hover:bg-gray-50'>
                    Gerenciar 2FA 
                </button>
            </div>
        </div>

      </div><style>{`
            .btn { @apply px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2; }
            .btn-sm { @apply px-3 py-1 text-xs; }
            .btn-outline { @apply bg-white border hover:bg-opacity-75; }
        `}</style>
    </Layout>
  );
};

export default UserProfile;