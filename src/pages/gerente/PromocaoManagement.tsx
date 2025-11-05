import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import PromotionForm from '../../components/forms/PromotionForm';
import ConfirmationModal from '../../components/ConfirmacaoModal';
import { usePromocoes } from '../../hooks/usePromocoes';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Promocao } from '../../types';
import { formatDate } from '../../utils/apiHelpers';

const PromotionManagement: React.FC = () => {
  const {
    promocoes,
    loading: loadingList,
    criarPromocao,
    atualizarPromocao,
    removerPromocao,
    carregarPromocoes,
  } = usePromocoes();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promocao | null>(null);
  const shouldReloadList = useRef(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promocao | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const handleOpenCreateForm = () => {
    setEditingPromotion(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (promocao: Promocao) => {
    setEditingPromotion(promocao);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: FormData): Promise<boolean> => {
    let success = false;
    if (editingPromotion) {
      success = await atualizarPromocao(editingPromotion.id, formData);
    } else {
      success = await criarPromocao(formData);
    }
    
    if (success) {
      shouldReloadList.current = true;
      setIsFormOpen(false);
      setEditingPromotion(null);
    }
    return success;
  };

  const handleOpenDeleteModal = (promotion: Promocao) => {
    setPromotionToDelete(promotion);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!promotionToDelete) return;
    
    setIsDeletingLoading(true);
    const success = await removerPromocao(promotionToDelete.id);
    setIsDeletingLoading(false);

    if (success) {
      setIsConfirmModalOpen(false);
      setPromotionToDelete(null);
      carregarPromocoes();
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPromotion(null);
  };

  const handleCloseConfirmModal = () => {
     setIsConfirmModalOpen(false);
     setPromotionToDelete(null);
     setIsDeletingLoading(false);
  };

  useEffect(() => {
    const checkReload = () => {
      if (!isFormOpen && shouldReloadList.current) {
          carregarPromocoes();
          shouldReloadList.current = false;
      }
    };
    const timerId = setTimeout(checkReload, 0);
    return () => clearTimeout(timerId);
  }, [isFormOpen, carregarPromocoes]);

  return (
    <Layout title="Gerenciamento de Promoções">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
            <Tag className="w-6 h-6 mr-2 text-purple-600"/>Promoções
        </h1>
        <button 
          onClick={handleOpenCreateForm}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Promoção
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loadingList && promocoes.length === 0 ? (
          <LoadingSpinner text="Carregando promoções..." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Início</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Fim</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promocoes.length === 0 && !loadingList ? (
                 <tr><td colSpan={6} className="text-center py-6 text-gray-500">Nenhuma promoção encontrada.</td></tr>
              ) : (
                 promocoes.map((promotion) => (
                  <tr key={promotion.id} className={`hover:bg-gray-50 transition-colors ${!promotion.ativa ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                       {promotion.imagemUrl && (
                         <img src={promotion.imagemUrl} alt={promotion.descricao} className="w-8 h-8 rounded-full object-cover mr-3"/>
                       )}
                       {!promotion.imagemUrl && (
                           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mr-3">
                               <Tag size={16} />
                           </div>
                       )}
                      {promotion.descricao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{promotion.percentualDesconto}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{formatDate(promotion.dataInicio)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{formatDate(promotion.dataFim)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        promotion.ativa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {promotion.ativa ? 'Ativa' : 'Encerrada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => handleOpenEditForm(promotion)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Editar promoção">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleOpenDeleteModal(promotion)} className="text-red-600 hover:text-red-900 transition-colors" title="Excluir promoção">
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

      <PromotionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingPromotion}
        isEditing={!!editingPromotion}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja EXCLUIR a promoção "${promotionToDelete?.descricao}"? Esta ação não pode ser desfeita e irá desassociar ${promotionToDelete?.produtos?.length || 0} produto(s).`}
        confirmText="Excluir"
        isLoading={isDeletingLoading}
      />
    </Layout>
  );
};

export default PromotionManagement;