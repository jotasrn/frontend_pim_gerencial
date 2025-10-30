import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, Truck } from 'lucide-react';
import FornecedorForm from '../../components/forms/FornecedorForm';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useFornecedores } from '../../hooks/useFornecedores';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Fornecedor } from '../../types';

type FornecedorData = Omit<Fornecedor, 'id'>;

const FornecedorManagement: React.FC = () => {
  const {
    fornecedores,
    loading: loadingList,
    criarFornecedor,
    atualizarFornecedor,
    removerFornecedor,
    carregarFornecedores,
  } = useFornecedores();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const shouldReloadList = useRef(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [fornecedorToDelete, setFornecedorToDelete] = useState<Fornecedor | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const handleOpenCreateForm = () => {
    setEditingFornecedor(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: FornecedorData): Promise<boolean> => {
    let success = false;
    if (editingFornecedor) {
      success = await atualizarFornecedor(editingFornecedor.id, data);
    } else {
      success = await criarFornecedor(data);
    }

    if (success) {
      shouldReloadList.current = true;
      setIsFormOpen(false);
      setEditingFornecedor(null);
    }
    return success;
  };

  const handleOpenDeleteModal = (fornecedor: Fornecedor) => {
    setFornecedorToDelete(fornecedor);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!fornecedorToDelete) return;

    setIsDeletingLoading(true);
    const success = await removerFornecedor(fornecedorToDelete.id);
    setIsDeletingLoading(false);

    if (success) {
      setIsConfirmModalOpen(false);
      setFornecedorToDelete(null);
      carregarFornecedores();
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFornecedor(null);
  }

  const handleCloseConfirmModal = () => {
     setIsConfirmModalOpen(false);
     setFornecedorToDelete(null);
     setIsDeletingLoading(false);
  }

  useEffect(() => {
    const checkReload = () => {
        if (!isFormOpen && shouldReloadList.current) {
            carregarFornecedores();
            shouldReloadList.current = false;
        }
    };
    const timerId = setTimeout(checkReload, 0);
    return () => clearTimeout(timerId);

  }, [isFormOpen, carregarFornecedores]);

  return (
    <Layout title="Gerenciamento de Fornecedores">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
            <Truck className="w-6 h-6 mr-2 text-cyan-600"/>Fornecedores
        </h1>
        <button
          onClick={handleOpenCreateForm}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-cyan-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Fornecedor
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loadingList && fornecedores.length === 0 ? (
          <LoadingSpinner text="Carregando fornecedores..." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">CNPJ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Telefone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fornecedores.length === 0 && !loadingList ? (
                 <tr><td colSpan={5} className="text-center py-6 text-gray-500">Nenhum fornecedor cadastrado.</td></tr>
              ) : (
                fornecedores.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{item.cnpj || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{item.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{item.telefone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => handleOpenEditForm(item)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Editar fornecedor" disabled={true}> {/* Desabilitado pois API não suporta */}
                          <Edit className="h-5 w-5 opacity-50 cursor-not-allowed" />
                        </button>
                        <button onClick={() => handleOpenDeleteModal(item)} className="text-red-600 hover:text-red-900 transition-colors" title="Excluir fornecedor" disabled={true}> {/* Desabilitado pois API não suporta */}
                          <Trash2 className="h-5 w-5 opacity-50 cursor-not-allowed" />
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

      <FornecedorForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingFornecedor}
        isEditing={!!editingFornecedor}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja EXCLUIR o fornecedor "${fornecedorToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        isLoading={isDeletingLoading}
      />

    </Layout>
  );
};

export default FornecedorManagement;