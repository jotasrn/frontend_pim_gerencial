import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Duvida, DuvidaRespostaRequest } from '../../types';

interface DuvidaRespostaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: DuvidaRespostaRequest) => Promise<boolean>;
  duvida: Duvida | null;
}

const DuvidaRespostaForm: React.FC<DuvidaRespostaFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  duvida,
}) => {
  const [resposta, setResposta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setResposta('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resposta.trim()) {
      setError('A resposta não pode estar vazia.');
      return;
    }
    if (!duvida) return;

    setError('');
    setLoading(true);
    
    const success = await onSubmit(duvida.id, { resposta });
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  if (!isOpen || !duvida) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Responder Dúvida</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <label className="block text-sm font-medium text-gray-500 mb-1">Dúvida do Usuário:</label>
            <h3 className="text-base font-semibold text-gray-900 mb-2">{duvida.titulo}</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{duvida.pergunta}</p>
            <p className="text-xs text-gray-500 mt-3">
              Enviado por: {duvida.usuario?.nomeCompleto || duvida.usuario?.email || 'Anônimo'}
            </p>
          </div>

          <div>
            <label htmlFor="resposta-duvida" className="block text-sm font-medium text-gray-700 mb-1">
              Sua Resposta *
            </label>
            <textarea
              id="resposta-duvida"
              rows={5}
              value={resposta}
              onChange={(e) => {
                setResposta(e.target.value);
                if (error) setError('');
              }}
              className={`textarea ${error ? 'input-error' : ''}`}
              placeholder="Digite sua resposta aqui..."
              disabled={loading}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Enviando...' : 'Enviar Resposta'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed; }
        .input-error { @apply border-red-500 focus:ring-red-500; }
        .textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed; }
      `}</style>
    </div>
  );
};

export default DuvidaRespostaForm;