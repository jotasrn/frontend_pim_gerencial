import React from 'react';
import Layout from '../../components/Layout';
import { Plus, CreditCard as Edit2, Trash2 } from 'lucide-react';
import UserForm from '../../components/forms/UserForm';
import { showToast } from '../../components/Toast';

const UserManagement: React.FC = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);

  const users = [
    { id: 1, name: 'João Silva', email: 'joao@example.com', role: 'stockist', status: 'Ativo' },
    { id: 2, name: 'Maria Santos', email: 'maria@example.com', role: 'deliverer', status: 'Ativo' },
    { id: 3, name: 'Pedro Souza', email: 'pedro@example.com', role: 'stockist', status: 'Inativo' },
  ];

  const handleCreateUser = async (userData: any) => {
    // Aqui você faria a chamada para a API
    console.log('Criando usuário:', userData);
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleUpdateUser = async (userData: any) => {
    // Aqui você faria a chamada para a API
    console.log('Atualizando usuário:', userData);
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        // Aqui você faria a chamada para a API
        console.log('Excluindo usuário:', userId);
        showToast.success('Usuário excluído com sucesso!');
      } catch (error) {
        showToast.error('Erro ao excluir usuário');
      }
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager': return 'Gerente';
      case 'stockist': return 'Estoquista';
      case 'deliverer': return 'Entregador';
      default: return role;
    }
  };

  return (
    <Layout title="Gerenciamento de Usuários">
      <div className="mb-6">
        <button 
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Usuário
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRoleLabel(user.role)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar usuário"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Excluir usuário"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Formulário */}
      <UserForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        initialData={editingUser}
        isEditing={!!editingUser}
      />
    </Layout>
  );
};

export default UserManagement;