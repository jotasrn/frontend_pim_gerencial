import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { HelpCircle, Send, CheckCircle, Eye, MessageSquare, Trash2, Edit } from 'lucide-react';
import DuvidaRespostaForm from '../../components/forms/DuvidaRespostaForm';
import ConfirmationModal from '../../components/modals/ConfirmacaoModal';
import { useDuvidas } from '../../hooks/useDuvidas';
import { Duvida, DuvidaRespostaRequest } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime } from '../../utils/apiHelpers';
import { iaService } from '../../services/iaService';

const DuvidasManagement: React.FC = () => {
  const {
    duvidas,
    loading: loadingList,
    responderDuvida,
    editarResposta,
    removerDuvida,
    carregarDuvidas,
  } = useDuvidas();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDuvida, setSelectedDuvida] = useState<Duvida | null>(null);
  
  // Estados para IA e Edição
  const [loadingSugestao, setLoadingSugestao] = useState(false);
  const [sugestaoResposta, setSugestaoResposta] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Estado para Filtro
  const [visualizandoRespondidas, setVisualizandoRespondidas] = useState(false);

  // Estados para Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [duvidaToDelete, setDuvidaToDelete] = useState<Duvida | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (visualizandoRespondidas) {
        carregarDuvidas({ status: 'RESPONDIDO' });
    } else {
        carregarDuvidas({ status: 'ABERTO' });
    }
  }, [visualizandoRespondidas, carregarDuvidas]);

  const handleOpenResponseModal = async (duvida: Duvida) => {
    setSelectedDuvida(duvida);
    setIsFormOpen(true);
    setIsEditing(false);
    setLoadingSugestao(true);
    setSugestaoResposta("");

    try {
      const response = await iaService.sugerirResposta(duvida.pergunta);
      setSugestaoResposta(response.sugestao);
    } catch (err: unknown) {
      console.error("Falha silenciosa da IA:", err);
      setSugestaoResposta(""); 
    } finally {
      setLoadingSugestao(false);
    }
  };

  const handleOpenEditModal = (duvida: Duvida) => {
    setSelectedDuvida(duvida);
    setIsFormOpen(true);
    setIsEditing(true);
    const textoResposta = getTextoResposta(duvida.resposta as unknown);
    setSugestaoResposta(textoResposta); 
    setLoadingSugestao(false);
  };

  const handleFormSubmit = async (id: number, data: DuvidaRespostaRequest): Promise<boolean> => {
    let success = false;
    if (isEditing) {
        success = await editarResposta(id, data);
    } else {
        success = await responderDuvida(id, data);
    }

    if (success) {
      if (visualizandoRespondidas) {
          carregarDuvidas({ status: 'RESPONDIDO' });
      } else {
          carregarDuvidas({ status: 'ABERTO' });
      }
      handleCloseForm();
    }
    return success;
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedDuvida(null);
    setSugestaoResposta("");
    setLoadingSugestao(false);
    setIsEditing(false);
  };
  const getTextoResposta = (resposta: unknown): string => {
    if (!resposta) return "";
    if (typeof resposta === 'string') return resposta;
    
    if (typeof resposta === 'object' && resposta !== null && 'resposta' in resposta) {
        return (resposta as { resposta: string }).resposta;
    }
    
    return "Conteúdo da resposta não disponível";
  };

  const handleOpenDeleteModal = (duvida: Duvida) => {
    setDuvidaToDelete(duvida);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!duvidaToDelete) return;
    setIsDeleting(true);
    const success = await removerDuvida(duvidaToDelete.id);
    setIsDeleting(false);
    if (success) {
        setIsDeleteModalOpen(false);
        setDuvidaToDelete(null);
        if (visualizandoRespondidas) {
            carregarDuvidas({ status: 'RESPONDIDO' });
        } else {
            carregarDuvidas({ status: 'ABERTO' });
        }
    }
  };

  return (
    <Layout title="Gerenciamento de Dúvidas">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <HelpCircle className="w-6 h-6 mr-2 text-blue-600" /> 
          {visualizandoRespondidas ? 'Histórico de Dúvidas' : 'Dúvidas Pendentes'}
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
                onClick={() => setVisualizandoRespondidas(!visualizandoRespondidas)}
                className="flex items-center justify-center text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
                {visualizandoRespondidas ? (
                    <><Eye className="w-4 h-4 mr-2" /> Ver Pendentes</>
                ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Ver Respondidas</>
                )}
            </button>

            <div className="flex items-center justify-center text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-4 py-2 rounded-lg shadow-sm">
                Total: <span className="ml-1.5 font-bold">{duvidas.length}</span>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {loadingList ? (
          <LoadingSpinner text="Carregando dúvidas..." />
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {duvidas.length === 0 ? (
              <p className="text-center py-10 text-gray-500 dark:text-gray-400">
                  {visualizandoRespondidas ? 'Nenhuma dúvida respondida encontrada.' : 'Nenhuma dúvida pendente no momento.'}
              </p>
            ) : (
              duvidas.map((duvida) => (
                <div key={duvida.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-center mb-1 gap-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {duvida.usuario?.nomeCompleto || duvida.usuario?.email || 'Cliente'} • {formatDateTime(duvida.createdAt)}
                          </p>
                          {duvida.status === 'RESPONDIDO' && (
                              <span className="text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                                Respondida
                              </span>
                          )}
                      </div>
                      
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{duvida.titulo}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border dark:border-gray-700">
                        "{duvida.pergunta}"
                      </p>

                      {visualizandoRespondidas && duvida.resposta && (
                          <div className="mt-4 ml-4 pl-4 border-l-4 border-green-500">
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Nossa Resposta:</p>
                                <button 
                                    onClick={() => handleOpenEditModal(duvida)}
                                    className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                                    title="Editar Resposta"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {/* CORREÇÃO 3: Usando 'as unknown' aqui também */}
                                {getTextoResposta(duvida.resposta as unknown)}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {duvida.dataResposta ? `Respondido em: ${formatDateTime(duvida.dataResposta)}` : ''}
                                {duvida.respondente && ` por ${duvida.respondente.nomeCompleto}`}
                              </p>
                          </div>
                      )}
                    </div>
                    
                    <div className="flex flex-row sm:flex-col gap-2 mt-3 sm:mt-0 sm:ml-4">
                        {!visualizandoRespondidas && (
                            <button
                            onClick={() => handleOpenResponseModal(duvida)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 focus:outline-none transition-colors"
                            >
                            <Send className="w-4 h-4 mr-2" />
                            Responder
                            </button>
                        )}
                        
                        <button
                            onClick={() => handleOpenDeleteModal(duvida)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 focus:outline-none transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                        </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <DuvidaRespostaForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        duvida={selectedDuvida}
        sugestao={sugestaoResposta}
        loadingSugestao={loadingSugestao}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Dúvida"
        message={`Tem certeza que deseja excluir a dúvida "${duvidaToDelete?.titulo}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        isLoading={isDeleting}
      />
    </Layout>
  );
};

export default DuvidasManagement;