import React, { useState, useEffect } from 'react';
import { X, Send, BrainCircuit } from 'lucide-react';
import { Duvida, DuvidaRespostaRequest } from '../../types';
import { showToast } from '../Toast';
import LoadingSpinner from '../LoadingSpinner';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: DuvidaRespostaRequest) => Promise<boolean>;
  duvida: Duvida | null;
  sugestao: string; // Nova prop
  loadingSugestao: boolean; // Nova prop
}

const DuvidaRespostaForm: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  duvida,
  sugestao,
  loadingSugestao,
}) => {
  const [resposta, setResposta] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Preenche o textarea quando a sugestão da IA terminar de carregar
    if (sugestao && !loadingSugestao) {
      setResposta(sugestao);
    }

    if (isOpen && !loadingSugestao) {
      setResposta(sugestao || '');
    }
  }, [sugestao, loadingSugestao, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duvida || !resposta.trim()) {
      showToast.error("A resposta não pode estar vazia.");
      return;
    }

    setIsSubmitting(true);
    const data: DuvidaRespostaRequest = { resposta };
    await onSubmit(duvida.id, data);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Responder</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none" disabled={isSubmitting}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md border dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pergunta do Cliente:</h4>
              <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mt-1">{duvida?.titulo}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">{duvida?.pergunta}</p>
            </div>

            <div>
              <label htmlFor="resposta" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sua Resposta
              </label>
              <div className="relative">
                {loadingSugestao && (
                  <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-700/50 flex items-center justify-center z-10">
                    <LoadingSpinner text="IA está gerando uma sugestão..." />
                  </div>
                )}
                <textarea
                  id="resposta"
                  rows={8}
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  className="textarea w-full"
                  placeholder="Digite a resposta aqui..."
                  disabled={isSubmitting || loadingSugestao}
                />
              </div>
              {!loadingSugestao && sugestao && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                  <BrainCircuit className="w-4 h-4 mr-1.5 text-blue-500" />
                  Sugestão da IA. Edite antes de enviar.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900 p-4 border-t dark:border-gray-700 rounded-b-lg mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingSugestao}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Enviar Resposta</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DuvidaRespostaForm;