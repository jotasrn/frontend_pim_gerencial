import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { HelpCircle, Send } from 'lucide-react';
import DuvidaRespostaForm from '../../components/forms/DuvidaRespostaForm';
import { useDuvidas } from '../../hooks/useDuvidas';
import { Duvida, DuvidaRespostaRequest } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime } from '../../utils/apiHelpers';

const DuvidasManagement: React.FC = () => {
  const {
    duvidas,
    loading: loadingList,
    responderDuvida,
    carregarDuvidas,
  } = useDuvidas();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDuvida, setSelectedDuvida] = useState<Duvida | null>(null);

  const handleOpenResponseModal = (duvida: Duvida) => {
    setSelectedDuvida(duvida);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (id: number, data: DuvidaRespostaRequest): Promise<boolean> => {
    const success = await responderDuvida(id, data);
    if (success) {
      carregarDuvidas();
      setIsFormOpen(false);
      setSelectedDuvida(null);
    }
    return success;
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedDuvida(null);
  }

  return (
    <Layout title="Gerenciamento de Dúvidas">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
         <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
            <HelpCircle className="w-6 h-6 mr-2 text-blue-600"/> Dúvidas Pendentes
        </h1>
        <div className="flex items-center text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full shadow-sm">
            Total Pendente:
            <span className="ml-1.5 font-bold text-base">{duvidas.length}</span>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loadingList ? (
          <LoadingSpinner text="Carregando dúvidas..." />
        ) : (
          <div className="divide-y divide-gray-200">
            {duvidas.length === 0 ? (
               <p className="text-center py-10 text-gray-500">Nenhuma dúvida pendente no momento.</p>
            ) : (
              duvidas.map((duvida) => (
                <div key={duvida.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500">
                        {duvida.usuario?.nomeCompleto || duvida.usuario?.email || 'Anônimo'} - {formatDateTime(duvida.createdAt)}
                      </p>
                      <h3 className="text-base font-semibold text-gray-900 mt-1">{duvida.titulo}</h3>
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{duvida.pergunta}</p>
                    </div>
                    <button
                      onClick={() => handleOpenResponseModal(duvida)}
                      className="ml-4 flex-shrink-0 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
      />

    </Layout>
  );
};

export default DuvidasManagement;