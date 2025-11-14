import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { HelpCircle, Send} from 'lucide-react'; // Ícone de IA adicionado
import DuvidaRespostaForm from '../../components/forms/DuvidaRespostaForm';
import { useDuvidas } from '../../hooks/useDuvidas';
import { Duvida, DuvidaRespostaRequest } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime } from '../../utils/apiHelpers';
import { iaService } from '../../services/iaService'; // Importa o serviço de IA
import { showToast } from '../../components/Toast';

const DuvidasManagement: React.FC = () => {
  const {
    duvidas,
    loading: loadingList,
    responderDuvida,
    carregarDuvidas,
  } = useDuvidas();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDuvida, setSelectedDuvida] = useState<Duvida | null>(null);
  const [loadingSugestao, setLoadingSugestao] = useState(false);
  const [sugestaoResposta, setSugestaoResposta] = useState("");

  const handleOpenResponseModal = async (duvida: Duvida) => {
    setSelectedDuvida(duvida);
    setIsFormOpen(true);
    setLoadingSugestao(true);
    setSugestaoResposta(""); // Limpa a sugestão anterior

    try {
      // Chama o serviço de IA
      const response = await iaService.sugerirResposta(duvida.pergunta);
      setSugestaoResposta(response.sugestao);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      showToast.error(`Falha ao gerar sugestão da IA: ${msg}`);
      setSugestaoResposta("Não foi possível gerar uma sugestão.");
    } finally {
      setLoadingSugestao(false);
    }
  };

  const handleFormSubmit = async (id: number, data: DuvidaRespostaRequest): Promise<boolean> => {
    const success = await responderDuvida(id, data);
    if (success) {
      carregarDuvidas();
      handleCloseForm(); // Chama o handleClose para resetar tudo
    }
    return success;
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedDuvida(null);
    setSugestaoResposta("");
    setLoadingSugestao(false);
  };

  return (
    <Layout title="Gerenciamento de Dúvidas">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <HelpCircle className="w-6 h-6 mr-2 text-blue-600" /> Dúvidas Pendentes
        </h1>
        <div className="flex items-center text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full shadow-sm">
          Total Pendente:
          <span className="ml-1.5 font-bold text-base">{duvidas.length}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {loadingList ? (
          <LoadingSpinner text="Carregando dúvidas..." />
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {duvidas.length === 0 ? (
              <p className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma dúvida pendente no momento.</p>
            ) : (
              duvidas.map((duvida) => (
                <div key={duvida.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {duvida.usuario?.nomeCompleto || duvida.usuario?.email || 'Anônimo'} - {formatDateTime(duvida.createdAt)}
                      </p>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-1">{duvida.titulo}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">{duvida.pergunta}</p>
                    </div>
                    <button
                      onClick={() => handleOpenResponseModal(duvida)}
                      className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 inline-flex items-center justify-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Responder
                    </button>
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

      <style>{`
   /* Adicionando estilos de input globais para o dark mode */
   .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
   .textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
   `}</style>
    </Layout>
  );
};

export default DuvidasManagement;