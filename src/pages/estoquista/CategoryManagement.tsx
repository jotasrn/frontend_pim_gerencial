import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import CategoryForm from '../../components/forms/CategoryForm';
import ConfirmationModal from '../../components/modals/ConfirmacaoModal';
import { useCategorias } from '../../hooks/useCategorias';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Categoria } from '../../types';

type CategoriaData = Omit<Categoria, 'id'>;

const CategoryManagement: React.FC = () => {
  const {
    categorias,
    loading: loadingList,
    criarCategoria,
    atualizarCategoria,
    removerCategoria,
    carregarCategorias,
  } = useCategorias();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const shouldReloadList = useRef(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Categoria | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const handleOpenCreateForm = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (category: Categoria) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CategoriaData): Promise<boolean> => {
    let success = false;
    if (editingCategory) {
      success = await atualizarCategoria(editingCategory.id, data);
    } else {
      success = await criarCategoria(data);
    }

    if (success) {
      shouldReloadList.current = true;
      setIsFormOpen(false);
      setEditingCategory(null);
    }
    return success;
  };

  const handleOpenDeleteModal = (category: Categoria) => {
    setCategoryToDelete(category);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeletingLoading(true);
    const success = await removerCategoria(categoryToDelete.id);
    setIsDeletingLoading(false);

    if (success) {
      setIsConfirmModalOpen(false);
      setCategoryToDelete(null);
      carregarCategorias();
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  }

  const handleCloseConfirmModal = () => {
     setIsConfirmModalOpen(false);
     setCategoryToDelete(null);
     setIsDeletingLoading(false);
  }

  useEffect(() => {
    const checkReload = () => {
        if (!isFormOpen && shouldReloadList.current) {
            carregarCategorias();
            shouldReloadList.current = false;
        }
    };
    const timerId = setTimeout(checkReload, 0);
    return () => clearTimeout(timerId);

  }, [isFormOpen, carregarCategorias]);

  return (
    <Layout title="Gerenciamento de Categorias">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
            <Tag className="w-6 h-6 mr-2 text-blue-600"/>Categorias
        </h1>
        <button
          onClick={handleOpenCreateForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Categoria
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loadingList && categorias.length === 0 ? (
          <LoadingSpinner text="Carregando categorias..." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Descrição</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorias.length === 0 && !loadingList ? (
                 <tr><td colSpan={3} className="text-center py-6 text-gray-500">Nenhuma categoria cadastrada.</td></tr>
              ) : (
                categorias.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell truncate max-w-xs">{category.descricao || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => handleOpenEditForm(category)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Editar categoria">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleOpenDeleteModal(category)} className="text-red-600 hover:text-red-900 transition-colors" title="Excluir categoria">
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

      <CategoryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
        isEditing={!!editingCategory}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja EXCLUIR a categoria "${categoryToDelete?.nome}"? Produtos associados a ela ficarão sem categoria. Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        isLoading={isDeletingLoading}
      />

    </Layout>
  );
};

export default CategoryManagement;