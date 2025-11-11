import React, { useState, useEffect, useRef, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, Truck, Mail, Phone, FileText, RefreshCw, Eye, EyeOff } from 'lucide-react';
import FornecedorForm from '../../components/forms/FornecedorForm';
import ConfirmationModal from '../../components/modals/ConfirmacaoModal';
import FornecedorDetailsModal from '../../components/modals/FornecedorDetailsModal';
import { useFornecedores } from '../../hooks/useFornecedores';
import { useProdutos } from '../../hooks/useProdutos';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Fornecedor } from '../../types';

type FornecedorData = Omit<Fornecedor, 'id'>;

const FornecedorManagement: React.FC = () => {
  const {
    fornecedores,
    loading: loadingFornecedores,
    criarFornecedor,
    atualizarFornecedor,
    removerFornecedor,
    carregarFornecedores,
  } = useFornecedores();

  const { produtos, loading: loadingProdutos } = useProdutos();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [fornecedorToConfirm, setFornecedorToConfirm] = useState<Fornecedor | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [modalAction, setModalAction] = useState<'deactivate' | 'reactivate' | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const shouldReloadList = useRef(false);
  const isLoading = loadingFornecedores || loadingProdutos;

  const fornecedoresToDisplay = useMemo(() => {
    return fornecedores.filter(f => f.ativo === !showInactive);
  }, [fornecedores, showInactive]);

  const handleOpenCreateForm = () => {
    setEditingFornecedor(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setIsFormOpen(true);
  };

  const handleOpenDetailsModal = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedFornecedor(null);
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

  const handleOpenConfirmModal = (action: 'deactivate' | 'reactivate', fornecedor: Fornecedor) => {
    setModalAction(action);
    setFornecedorToConfirm(fornecedor);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!fornecedorToConfirm || !modalAction) return;

    setIsConfirmLoading(true);
    let success = false;

    if (modalAction === 'deactivate') {
      success = await removerFornecedor(fornecedorToConfirm.id);
    } else {
      const data: FornecedorData = {
        nome: fornecedorToConfirm.nome,
        cnpj: fornecedorToConfirm.cnpj,
        email: fornecedorToConfirm.email,
        telefone: fornecedorToConfirm.telefone,
        ativo: true,
      };
      success = await atualizarFornecedor(fornecedorToConfirm.id, data);
    }
    setIsConfirmLoading(false);

    if (success) {
      setIsConfirmModalOpen(false);
      setFornecedorToConfirm(null);
      setModalAction(null);
      carregarFornecedores();
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFornecedor(null);
  }

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setFornecedorToConfirm(null);
    setModalAction(null);
    setIsConfirmLoading(false);
  }

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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

  const modalTitle = modalAction === 'deactivate' ? 'Confirmar Desativação' : 'Confirmar Reativação';
  const modalMessage = modalAction === 'deactivate' ?
    `Tem certeza que deseja DESATIVAR o fornecedor "${fornecedorToConfirm?.nome}"?` :
    `Tem certeza que deseja REATIVAR o fornecedor "${fornecedorToConfirm?.nome}"?`;
  const confirmText = modalAction === 'deactivate' ? 'Desativar' : 'Reativar';

  return (
    <Layout title="Gerenciamento de Fornecedores">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <Truck className="w-6 h-6 mr-2 text-cyan-600" />Fornecedores
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm w-full sm:w-auto"
          >
            {showInactive ? <EyeOff className="h-5 w-5 mr-2" /> : <Eye className="h-5 w-5 mr-2" />}
            {showInactive ? 'Ver Ativos' : 'Ver Inativos'}
          </button>
          <button
            onClick={handleOpenCreateForm}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-cyan-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Fornecedor
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {(isLoading && fornecedoresToDisplay.length === 0) ? (
          <LoadingSpinner text="Carregando fornecedores..." />
        ) : fornecedoresToDisplay.length === 0 && !isLoading ? (
          <p className="text-center py-10 text-gray-500 dark:text-gray-400">
            {showInactive ? 'Nenhum fornecedor inativo.' : 'Nenhum fornecedor cadastrado.'}
          </p>
        ) : (
          <>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:hidden">
              {fornecedoresToDisplay.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 space-y-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${!item.ativo ? 'opacity-50' : ''}`}
                  onClick={() => handleOpenDetailsModal(item)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.nome}</span>
                    <div className="flex items-center space-x-3" onClick={stopPropagation}>
                      <button onClick={() => handleOpenEditForm(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="Editar">
                        <Edit className="h-5 w-5" />
                      </button>
                      {item.ativo ? (
                        <button onClick={() => handleOpenConfirmModal('deactivate', item)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Desativar">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      ) : (
                        <button onClick={() => handleOpenConfirmModal('reactivate', item)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" title="Reativar">
                          <RefreshCw className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p className="flex items-center"><FileText className="w-4 h-4 mr-2" />{item.cnpj || '-'}</p>
                    <p className="flex items-center"><Mail className="w-4 h-4 mr-2" />{item.email || '-'}</p>
                    <p className="flex items-center"><Phone className="w-4 h-4 mr-2" />{item.telefone || '-'}</p>
                  </div>
                </div>
              ))}
            </div>

            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden lg:table">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CNPJ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {fornecedoresToDisplay.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${!item.ativo ? 'opacity-50' : ''}`}
                    onClick={() => handleOpenDetailsModal(item)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className="text-gray-900 dark:text-gray-100">
                        {item.nome}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.cnpj || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.telefone || '-'}</td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      onClick={stopPropagation}
                    >
                      <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => handleOpenEditForm(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="Editar fornecedor">
                          <Edit className="h-5 w-5" />
                        </button>
                        {item.ativo ? (
                          <button onClick={() => handleOpenConfirmModal('deactivate', item)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Desativar fornecedor">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        ) : (
                          <button onClick={() => handleOpenConfirmModal('reactivate', item)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" title="Reativar fornecedor">
                            <RefreshCw className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
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
        onConfirm={handleConfirmAction}
        title={modalTitle}
        message={modalMessage}
        confirmText={confirmText}
        isLoading={isConfirmLoading}
      />

      <FornecedorDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        fornecedor={selectedFornecedor}
        produtos={produtos}
      />
    </Layout>
  );
};

export default FornecedorManagement;