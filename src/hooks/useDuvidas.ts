import { useState, useEffect, useCallback } from 'react';
import { duvidaService } from '../services/duvidaService';
import { showToast } from '../components/Toast';
import { Duvida, DuvidaRespostaRequest } from '../types';

interface UseDuvidasReturn {
  duvidas: Duvida[];
  loading: boolean;
  error: string | null;
  carregarDuvidas: () => void;
  responderDuvida: (id: number, data: DuvidaRespostaRequest) => Promise<boolean>;
}

export const useDuvidas = (): UseDuvidasReturn => {
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const carregarDuvidas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await duvidaService.listarPendentes();
      setDuvidas(dados);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao carregar dúvidas: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const responderDuvida = async (id: number, data: DuvidaRespostaRequest): Promise<boolean> => {
    setError(null);
    try {
      await duvidaService.responderDuvida(id, data);
      showToast.success('Dúvida respondida com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao responder dúvida: ${errorMessage}`);
      return false;
    }
  };

  useEffect(() => {
    carregarDuvidas();
  }, [carregarDuvidas]);

  return {
    duvidas,
    loading,
    error,
    carregarDuvidas,
    responderDuvida,
  };
};