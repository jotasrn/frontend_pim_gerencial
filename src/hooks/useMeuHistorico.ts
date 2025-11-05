import { useState, useEffect, useCallback } from 'react';
import { entregaService } from '../services/entregaService';
import { showToast } from '../components/Toast';
import { Entrega } from '../types';

interface UseMeuHistoricoReturn {
  historico: Entrega[];
  loading: boolean;
  error: string | null;
  carregarHistorico: () => void;
}

export const useMeuHistorico = (): UseMeuHistoricoReturn => {
  const [historico, setHistorico] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarHistorico = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await entregaService.listarMeuHistorico();
      setHistorico(dados);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao carregar histórico: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  return {
    historico,
    loading,
    error,
    carregarHistorico,
  };
};