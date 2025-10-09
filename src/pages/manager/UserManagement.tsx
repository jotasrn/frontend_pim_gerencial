import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2 } from 'lucide-react';
import UserForm from '../../components/forms/UserForm';
import { useUsuarios } from '../../hooks/useUsuarios';
import { Usuario, UsuarioData } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserManagement: React.FC = () => {
  // Conectando com o hook para obter dados e funções reais
  const { usuarios, loading, criarUsuario, atualizarUsuario, removerUsuario } = useUsuarios();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  const handleOpenCreateForm = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (user: Usuario) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (userData: UsuarioData | Partial<UsuarioData>) => {
    let success = false;
    if (editingUser) {
      success = await atualizarUsuario(editingUser.id, userData as UsuarioData);
    } else {
      success = await criarUsuario(userData as UsuarioData);
    }
    if (success) {
      setIsFormOpen(false);
    }
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      removerUsuario(userId);
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'gerente') return 'Gerente';
    if (role === 'entregador') return 'Entregador';
    return role;
  };

  return (
    <Layout title="Gerenciamento de Usuários">
      <div className="mb-6">
        <button 
          onClick={handleOpenCreateForm}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Usuário
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        {loading && usuarios.length === 0 ? (
          <LoadingSpinner text="Carregando usuários..." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRoleLabel(user.permissao)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-4">
                      <button onClick={() => handleOpenEditForm(user)} className="text-blue-600 hover:text-blue-900" title="Editar usuário">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900" title="Excluir usuário">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
        isEditing={!!editingUser}
      />
    </Layout>
  );
};

export default UserManagement;