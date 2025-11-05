import { useState, useEffect, useCallback } from 'react';
import { entregaService } from '../services/entregaService';
import { showToast } from '../components/Toast';
import { Entrega, EntregaStatusUpdate } from '../types';

interface UseEntregaDetalhesReturn {
  entrega: Entrega | null;
  loading: boolean;
  error: string | null;
  carregarDetalhes: () => void;
  atualizarStatusEntrega: (data: EntregaStatusUpdate) => Promise<boolean>;
}

export const useEntregaDetalhes = (id: number): UseEntregaDetalhesReturn => {
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarDetalhes = useCallback(async () => {
    if (isNaN(id)) {
      setError("ID da entrega inválido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dados = await entregaService.buscarPorId(id);
      setEntrega(dados);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao carregar detalhes: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const atualizarStatusEntrega = async (data: EntregaStatusUpdate): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const entregaAtualizada = await entregaService.atualizarStatus(id, data);
      setEntrega(entregaAtualizada);
      showToast.success('Status da entrega atualizado!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao atualizar status: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDetalhes();
  }, [carregarDetalhes]);

  return {
    entrega,
    loading,
    error,
    carregarDetalhes,
    atualizarStatusEntrega,
  };
};