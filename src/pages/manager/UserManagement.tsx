import React, { useState, useEffect, useRef, useMemo } from 'react'; // Import useMemo
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, User as UserIcon } from 'lucide-react';
import UserForm from '../../components/forms/UserForm';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useUsuarios } from '../../hooks/useUsuarios';
import { Usuario, UsuarioData } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserManagement: React.FC = () => {
  const {
      usuarios,
      loading: loadingList,
      criarUsuario,
      atualizarUsuario,
      removerUsuario,
      carregarUsuarios
    } = useUsuarios();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const shouldReloadList = useRef(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const usuariosDoSistema = useMemo(() => {
    return usuarios.filter(user => user.permissao.toLowerCase() !== 'CLIENTE'.toLowerCase());
  }, [usuarios]); 


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
      shouldReloadList.current = true;
      setIsFormOpen(false);
      setEditingUser(null);
    }
    return success;
  };

  const handleOpenDeleteModal = (user: Usuario) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeletingLoading(true);
    const success = await removerUsuario(userToDelete.id);
    setIsDeletingLoading(false);

    if (success) {
      setIsConfirmModalOpen(false);
      setUserToDelete(null);
      carregarUsuarios();
    }
  };

   const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  }

  const handleCloseConfirmModal = () => {
     setIsConfirmModalOpen(false);
     setUserToDelete(null);
     setIsDeletingLoading(false);
  }

  useEffect(() => {
    const checkReload = () => {
        if (!isFormOpen && shouldReloadList.current) {
            carregarUsuarios();
            shouldReloadList.current = false;
        }
    };
    const timerId = setTimeout(checkReload, 0);
    return () => clearTimeout(timerId);
  }, [isFormOpen, carregarUsuarios]);


  const getRoleLabel = (role?: string) => {
    if (!role) return 'N/A';
    const lowerRole = role.toLowerCase(); 
    if (lowerRole === 'gerente') return 'Gerente';
    if (lowerRole === 'entregador') return 'Entregador';
    return role;
  };

  return (
    <Layout title="Gerenciamento de Usuários">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
         <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
            <UserIcon className="w-6 h-6 mr-2 text-indigo-600"/>Usuários do Sistema
        </h1>
        <button
          onClick={handleOpenCreateForm}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Usuário
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loadingList && usuariosDoSistema.length === 0 ? (
          <LoadingSpinner text="Carregando usuários..." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
             {usuariosDoSistema.length === 0 && !loadingList ? (
                 <tr><td colSpan={5} className="text-center py-6 text-gray-500">Nenhum usuário do sistema (Gerente/Entregador) cadastrado.</td></tr>
              ) : (
                usuariosDoSistema.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${!user.ativo ? 'opacity-60 bg-gray-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nomeCompleto}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{getRoleLabel(user.permissao)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => handleOpenEditForm(user)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Editar usuário">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleOpenDeleteModal(user)} className="text-red-600 hover:text-red-900 transition-colors" title="Excluir usuário">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
               )}
            </tbody>
          </table>
        )}
      </div>

      <UserForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
        isEditing={!!editingUser}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja EXCLUIR o usuário "${userToDelete?.nomeCompleto}" (${userToDelete?.email})? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        isLoading={isDeletingLoading}
      />

    </Layout>
  );
};

export default UserManagement;