import React, { useState, useEffect, useRef, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, Tag, RefreshCw, Eye, EyeOff } from 'lucide-react';
import PromotionForm from '../../components/forms/PromocaoForm';
import ConfirmationModal from '../../components/modals/ConfirmacaoModal';
import PromotionDetailsModal from '../../components/modals/PromocaoDetailsModal';
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
    desativarPromocao,
    carregarPromocoes,
  } = usePromocoes({ status: 'all' });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promocao | null>(null);
  const shouldReloadList = useRef(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [promotionToConfirm, setPromotionToConfirm] = useState<Promocao | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [modalAction, setModalAction] = useState<'deactivate' | 'reactivate' | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPromocaoId, setSelectedPromocaoId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const promocoesParaExibir = useMemo(() => {
    return promocoes.filter(p => p.ativa === !showInactive);
  }, [promocoes, showInactive]);

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

  const handleOpenCreateForm = () => {
    setEditingPromotion(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (promocao: Promocao) => {
    setEditingPromotion(promocao);
    setIsFormOpen(true);
  };

  const handleOpenDetailsModal = (id: number) => {
    setSelectedPromocaoId(id);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPromocaoId(null);
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

  const handleOpenConfirmModal = (action: 'deactivate' | 'reactivate', promotion: Promocao) => {
    setModalAction(action);
    setPromotionToConfirm(promotion);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!promotionToConfirm || !modalAction) return;

    setIsConfirmLoading(true);
    let success = false;

    if (modalAction === 'deactivate') {
      success = await desativarPromocao(promotionToConfirm.id);
    } else {
      handleOpenEditForm(promotionToConfirm);
      success = true;
    }
    setIsConfirmLoading(false);

    if (success) {
      setIsConfirmModalOpen(false);
      setPromotionToConfirm(null);
      setModalAction(null);
      if (modalAction === 'deactivate') {
        carregarPromocoes();
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPromotion(null);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setPromotionToConfirm(null);
    setModalAction(null);
    setIsConfirmLoading(false);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const modalTitle = modalAction === 'deactivate' ? 'Confirmar Desativação' : 'Confirmar Reativação';
  const modalMessage = modalAction === 'deactivate' ?
    `Tem certeza que deseja DESATIVAR a promoção "${promotionToConfirm?.descricao}"?` :
    `Para reativar a promoção "${promotionToConfirm?.descricao}", clique em "Reativar" para editar e salvar.`;
  const confirmText = modalAction === 'deactivate' ? 'Desativar' : 'Reativar';

  return (
    <Layout title="Gerenciamento de Promoções">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <Tag className="w-6 h-6 mr-2 text-purple-600" />Promoções
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
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Promoção
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {loadingList && promocoesParaExibir.length === 0 ? (
          <LoadingSpinner text="Carregando promoções..." />
        ) : promocoesParaExibir.length === 0 && !loadingList ? (
          <p className="text-center py-10 text-gray-500 dark:text-gray-400">
            {showInactive ? 'Nenhuma promoção inativa.' : 'Nenhuma promoção ativa.'}
          </p>
        ) : (
          <>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:hidden">
              {promocoesParaExibir.map((promotion) => (
                <div
                  key={promotion.id}
                  className={`p-4 ${!promotion.ativa ? 'opacity-60 bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer`}
                  onClick={() => handleOpenDetailsModal(promotion.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      {promotion.imagemUrl ? (
                        <img src={promotion.imagemUrl} alt={promotion.descricao} className="w-10 h-10 rounded-full object-cover mr-3" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 mr-3">
                          <Tag size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{promotion.descricao}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{promotion.percentualDesconto}% OFF</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3" onClick={stopPropagation}>
                      <button onClick={() => handleOpenEditForm(promotion)} className="text-indigo-600 dark:text-indigo-400" title="Editar">
                        <Edit className="h-5 w-5" />
                      </button>
                      {promotion.ativa ? (
                        <button onClick={() => handleOpenConfirmModal('deactivate', promotion)} className="text-red-600 dark:text-red-400" title="Desativar">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      ) : (
                        <button onClick={() => handleOpenEditForm(promotion)} className="text-green-600 dark:text-green-400" title="Reativar">
                          <RefreshCw className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${promotion.ativa ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                      {promotion.ativa ? 'Ativa' : 'Encerrada'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{formatDate(promotion.dataInicio)} - {formatDate(promotion.dataFim)}</span>
                  </div>
                </div>
              ))}
            </div>

            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden lg:table">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Desconto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Início</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fim</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {promocoesParaExibir.length === 0 && !loadingList ? (
                  <tr><td colSpan={6} className="text-center py-6 text-gray-500 dark:text-gray-400">
                    {showInactive ? 'Nenhuma promoção inativa.' : 'Nenhuma promoção ativa.'}
                  </td></tr>
                ) : (
                  promocoesParaExibir.map((promotion) => (
                    <tr
                      key={promotion.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${!promotion.ativa ? 'opacity-60 bg-gray-50 dark:bg-gray-700/50' : ''}`}
                      onClick={() => handleOpenDetailsModal(promotion.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                        {promotion.imagemUrl && (
                          <img src={promotion.imagemUrl} alt={promotion.descricao} className="w-8 h-8 rounded-full object-cover mr-3" />
                        )}
                        {!promotion.imagemUrl && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 mr-3">
                            <Tag size={16} />
                          </div>
                        )}
                        {promotion.descricao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">{promotion.percentualDesconto}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(promotion.dataInicio)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(promotion.dataFim)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${promotion.ativa ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                          {promotion.ativa ? 'Ativa' : 'Encerrada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={stopPropagation}>
                        <div className="flex items-center justify-end space-x-3">
                          <button onClick={() => handleOpenEditForm(promotion)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors" title="Editar promoção">
                            <Edit className="h-5 w-5" />
                          </button>
                          {promotion.ativa ? (
                            <button onClick={() => handleOpenConfirmModal('deactivate', promotion)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Desativar promoção">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          ) : (
                            <button onClick={() => handleOpenEditForm(promotion)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors" title="Reativar promoção">
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
          </>
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
        onConfirm={handleConfirmAction}
        title={modalTitle}
        message={modalMessage}
        confirmText={confirmText}
        isLoading={isConfirmLoading}
      />

      <PromotionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        promocaoId={selectedPromocaoId}
      />
    </Layout>
  );
};

export default PromotionManagement;