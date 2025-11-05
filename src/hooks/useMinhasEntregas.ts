import { useState, useEffect, useCallback } from 'react';
import { entregaService } from '../services/entregaService';
import { showToast } from '../components/Toast';
import { Entrega } from '../types';

interface UseMinhasEntregasReturn {
  entregas: Entrega[];
  loading: boolean;
  error: string | null;
  carregarEntregas: () => void;
}

export const useMinhasEntregas = (): UseMinhasEntregasReturn => {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarEntregas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await entregaService.listarMinhasEntregas();
      setEntregas(dados);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao carregar entregas: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarEntregas();
  }, [carregarEntregas]);

  return {
    entregas,
    loading,
    error,
    carregarEntregas,
  };
};