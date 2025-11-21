import { useState, useEffect, useCallback } from 'react';
import { duvidaService } from '../services/duvidaService';
import { showToast } from '../components/Toast';
import { Duvida, DuvidaRespostaRequest } from '../types';

export interface FiltrosDuvidas {
  status?: 'ABERTO' | 'RESPONDIDO' | 'TODOS';
}

interface UseDuvidasReturn {
  duvidas: Duvida[];
  loading: boolean;
  error: string | null;
  carregarDuvidas: (filtros?: FiltrosDuvidas) => void;
  responderDuvida: (id: number, data: DuvidaRespostaRequest) => Promise<boolean>;
  editarResposta: (id: number, data: DuvidaRespostaRequest) => Promise<boolean>;
  removerDuvida: (id: number) => Promise<boolean>;
}

export const useDuvidas = (): UseDuvidasReturn => {
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const carregarDuvidas = useCallback(async (filtros: FiltrosDuvidas = { status: 'ABERTO' }) => {
    setLoading(true);
    setError(null);
    try {
      const dados = await duvidaService.listar(filtros.status);
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

  const editarResposta = async (id: number, data: DuvidaRespostaRequest): Promise<boolean> => {
    setError(null);
    try {
      await duvidaService.editar(id, data);
      showToast.success('Resposta atualizada com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao editar resposta: ${errorMessage}`);
      return false;
    }
  };

  const removerDuvida = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await duvidaService.remover(id);
      showToast.success('Dúvida removida com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao remover dúvida: ${errorMessage}`);
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
    editarResposta, 
    removerDuvida,
  };
};