import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import FaqForm from '../../components/forms/FaqForm';
import ConfirmationModal from '../../components/modals/ConfirmacaoModal';
import { useFaq } from '../../hooks/useFaq';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Faq } from '../../types';

type FaqData = Omit<Faq, 'id' | 'createdAt' | 'updatedAt'>;

const FaqManagement: React.FC = () => {
  const {
    faqs,
    loading: loadingList,
    criarFaq,
    atualizarFaq,
    removerFaq,
    carregarFaqs,
  } = useFaq();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const shouldReloadList = useRef(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<Faq | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const handleOpenCreateForm = () => {
    setEditingFaq(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (faq: Faq) => {
    setEditingFaq(faq);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: FaqData): Promise<boolean> => {
    let success = false;
    if (editingFaq) {
      success = await atualizarFaq(editingFaq.id, data);
    } else {
      success = await criarFaq(data);
    }

    if (success) {
      shouldReloadList.current = true;
      setIsFormOpen(false);
      setEditingFaq(null);
    }
    return success;
  };

  const handleOpenDeleteModal = (faq: Faq) => {
    setFaqToDelete(faq);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!faqToDelete) return;

    setIsDeletingLoading(true);
    const success = await removerFaq(faqToDelete.id);
    setIsDeletingLoading(false);

    if (success) {
      setIsConfirmModalOpen(false);
      setFaqToDelete(null);
      carregarFaqs();
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFaq(null);
  }

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setFaqToDelete(null);
    setIsDeletingLoading(false);
  }

  useEffect(() => {
    const checkReload = () => {
      if (!isFormOpen && shouldReloadList.current) {
        carregarFaqs();
        shouldReloadList.current = false;
      }
    };
    const timerId = setTimeout(checkReload, 0);
    return () => clearTimeout(timerId);

  }, [isFormOpen, carregarFaqs]);

  return (
    <Layout title="Gerenciamento de FAQs">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-teal-600" /> Perguntas Frequentes (FAQ)
        </h1>
        <button
          onClick={handleOpenCreateForm}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-teal-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar FAQ
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {loadingList && faqs.length === 0 ? (
          <LoadingSpinner text="Carregando FAQs..." />
        ) : faqs.length === 0 && !loadingList ? (
          <p className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhum FAQ cadastrado.</p>
        ) : (
          <>
            {/* Card View para Mobile */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:hidden">
              {faqs.map((faq) => (
                <div key={faq.id} className={`p-4 ${!faq.ativo ? 'opacity-60 bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{faq.pergunta}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{faq.categoria}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleOpenEditForm(faq)} className="text-indigo-600 dark:text-indigo-400" title="Editar">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleOpenDeleteModal(faq)} className="text-red-600 dark:text-red-400" title="Excluir">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${faq.ativo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}>
                      {faq.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Table View para Desktop */}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden lg:table">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pergunta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {faqs.map((faq) => (
                  <tr key={faq.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!faq.ativo ? 'opacity-60 bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 max-w-md truncate" title={faq.pergunta}>{faq.pergunta}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{faq.categoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${faq.ativo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        }`}>
                        {faq.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => handleOpenEditForm(faq)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors" title="Editar FAQ">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleOpenDeleteModal(faq)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Excluir FAQ">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <FaqForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingFaq}
        isEditing={!!editingFaq}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja EXCLUIR o FAQ: "${faqToDelete?.pergunta}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        isLoading={isDeletingLoading}
      />

    </Layout>
  );
};

export default FaqManagement;