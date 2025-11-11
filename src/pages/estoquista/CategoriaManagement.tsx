import React, { useState, useEffect, useRef, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, Tag, RefreshCw, Eye, EyeOff } from 'lucide-react';
import CategoryForm from '../../components/forms/CategoriaForm';
import ConfirmationModal from '../../components/modals/ConfirmacaoModal';
import CategoriaDetailsModal from '../../components/modals/CategoriaDetailsModal';
import { useCategorias } from '../../hooks/useCategorias';
import { useProdutos } from '../../hooks/useProdutos';
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

  const { produtos, loading: loadingProdutos } = useProdutos();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const shouldReloadList = useRef(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToConfirm, setCategoryToConfirm] = useState<Categoria | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [modalAction, setModalAction] = useState<'deactivate' | 'reactivate' | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const isLoading = loadingList || loadingProdutos;

  const categoriesToDisplay = useMemo(() => {
    return categorias.filter(c => c.ativo === !showInactive);
  }, [categorias, showInactive]);

  const handleOpenCreateForm = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (category: Categoria) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleOpenDetailsModal = (category: Categoria) => {
    setSelectedCategory(category);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCategory(null);
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

  const handleOpenConfirmModal = (action: 'deactivate' | 'reactivate', category: Categoria) => {
    setModalAction(action);
    setCategoryToConfirm(category);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!categoryToConfirm || !modalAction) return;

    setIsConfirmLoading(true);
    let success = false;

    if (modalAction === 'deactivate') {
      success = await removerCategoria(categoryToConfirm.id);
    } else {
      const data: CategoriaData = {
        nome: categoryToConfirm.nome,
        descricao: categoryToConfirm.descricao,
        ativo: true,
      };
      success = await atualizarCategoria(categoryToConfirm.id, data);
    }
    setIsConfirmLoading(false);

    if (success) {
      setIsConfirmModalOpen(false);
      setCategoryToConfirm(null);
      setModalAction(null);
      carregarCategorias();
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  }

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setCategoryToConfirm(null);
    setModalAction(null);
    setIsConfirmLoading(false);
  }

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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

  const modalTitle = modalAction === 'deactivate' ? 'Confirmar Desativação' : 'Confirmar Reativação';
  const modalMessage = modalAction === 'deactivate' ?
    `Tem certeza que deseja DESATIVAR a categoria "${categoryToConfirm?.nome}"?` :
    `Tem certeza que deseja REATIVAR a categoria "${categoryToConfirm?.nome}"?`;
  const confirmText = modalAction === 'deactivate' ? 'Desativar' : 'Reativar';

  return (
    <Layout title="Gerenciamento de Categorias">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <Tag className="w-6 h-6 mr-2 text-blue-600" />Categorias
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm w-full sm:w-auto"
          >
            {showInactive ? <EyeOff className="h-5 w-5 mr-2" /> : <Eye className="h-5 w-5 mr-2" />}
            {showInactive ? 'Ver Ativas' : 'Ver Inativas'}
          </button>
          <button
            onClick={handleOpenCreateForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Categoria
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        {isLoading && categoriesToDisplay.length === 0 ? (
          <LoadingSpinner text="Carregando categorias..." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Descrição</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {categoriesToDisplay.length === 0 && !isLoading ? (
                <tr><td colSpan={3} className="text-center py-6 text-gray-500 dark:text-gray-400">
                  {showInactive ? 'Nenhuma categoria inativa.' : 'Nenhuma categoria cadastrada.'}
                </td></tr>
              ) : (
                categoriesToDisplay.map((category) => (
                  <tr
                    key={category.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${!category.ativo ? 'opacity-50' : ''}`}
                    onClick={() => handleOpenDetailsModal(category)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{category.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell truncate max-w-xs">{category.descricao || '-'}</td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      onClick={stopPropagation}
                    >
                      <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => handleOpenEditForm(category)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors" title="Editar categoria">
                          <Edit className="h-5 w-5" />
                        </button>
                        {category.ativo ? (
                          <button onClick={() => handleOpenConfirmModal('deactivate', category)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Desativar categoria">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        ) : (
                          <button onClick={() => handleOpenConfirmModal('reactivate', category)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors" title="Reativar categoria">
                            <RefreshCw className="h-5 w-5" />
                          </button>
                        )}
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
        onConfirm={handleConfirmAction}
        title={modalTitle}
        message={modalMessage}
        confirmText={confirmText}
        isLoading={isConfirmLoading}
      />

      <CategoriaDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        categoria={selectedCategory}
        produtos={produtos}
      />
    </Layout>
  );
};

export default CategoryManagement;