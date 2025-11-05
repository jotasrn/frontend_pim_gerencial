import { useState, useEffect, useCallback } from 'react';
import { entregaService } from '../services/entregaService';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/Toast';
import { Entrega, FiltrosEntregas, EntregaStatusUpdate } from '../types';

interface UseEntregasReturn {
  entregas: Entrega[];
  loading: boolean;
  error: string | null;
  filtros: FiltrosEntregas;
  carregarEntregas: () => void;
  associarEntregador: (entregaId: number, entregadorId: number) => Promise<boolean>;
  atualizarStatus: (entregaId: number, data: EntregaStatusUpdate) => Promise<boolean>;
  atualizarFiltros: (novosFiltros: Partial<FiltrosEntregas>) => void;
}

export const useEntregas = (filtrosIniciais: FiltrosEntregas = {}): UseEntregasReturn => {

  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosEntregas>(filtrosIniciais);
  const { usuario } = useAuth();

  const carregarEntregas = useCallback(async () => {
    if (!usuario) return;

    setLoading(true);
    setError(null);
    try {
      let dados: Entrega[];
      if (usuario.permissao === 'entregador') {
        dados = await entregaService.listarMinhasEntregas();
      } else {
        dados = await entregaService.listar(filtros);
      }
      setEntregas(dados);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filtros, usuario]);

  const associarEntregador = async (entregaId: number, entregadorId: number): Promise<boolean> => {
    if (usuario?.permissao !== 'gerente') {
      showToast.error('Apenas gerentes podem associar entregadores.');
      return false;
    }

    setLoading(true);
    try {
      await entregaService.associarEntregador(entregaId, entregadorId);
      await carregarEntregas();
      showToast.success('Entregador associado com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      showToast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (entregaId: number, data: EntregaStatusUpdate): Promise<boolean> => {
    if (usuario?.permissao !== 'entregador') {
      showToast.error('Apenas entregadores podem atualizar o status.');
      return false;
    }

    setLoading(true);
    try {
      await entregaService.atualizarStatus(entregaId, data);
      await carregarEntregas();
      showToast.success('Status da entrega atualizado!');
      return true;
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      showToast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const atualizarFiltros = (novosFiltros: Partial<FiltrosEntregas>) => {
    if (usuario?.permissao === 'gerente') {
      setFiltros(prev => ({ ...prev, ...novosFiltros }));
    }
  };

  useEffect(() => {
    if (usuario) {
      carregarEntregas();
    }
  }, [carregarEntregas, usuario]);

  return {
    entregas,
    loading,
    error,
    filtros,
    carregarEntregas,
    associarEntregador,
    atualizarStatus,
    atualizarFiltros,
  };
};