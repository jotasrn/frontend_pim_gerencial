import { useState, useEffect, useCallback } from 'react';
import { promocaoService } from '../services/promocaoService';
import { showToast } from '../components/Toast';
import { Promocao, FiltrosPromocoes } from '../types';
import { useNotifications } from '../contexts/NotificacaoContext';

interface UsePromocoesReturn {
  promocoes: Promocao[];
  loading: boolean;
  error: string | null;
  carregarPromocoes: () => void;
  criarPromocao: (formData: FormData) => Promise<boolean>;
  atualizarPromocao: (id: number, formData: FormData) => Promise<boolean>;
  desativarPromocao: (id: number) => Promise<boolean>;
  atualizarFiltros: (novosFiltros: Partial<FiltrosPromocoes>) => void;
}

const isExpired = (dataFim: string): boolean => {
  const today = new Date();
  const endDate = new Date(dataFim);
  endDate.setHours(23, 59, 59, 999);
  return endDate < today;
};

const filtrosPadrao: FiltrosPromocoes = {};

export const usePromocoes = (filtrosIniciais: FiltrosPromocoes = filtrosPadrao): UsePromocoesReturn => {
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosPromocoes>(filtrosIniciais);

  const { refetchNotifications } = useNotifications();
  const filtrosString = JSON.stringify(filtros);

  const carregarPromocoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await promocaoService.listar(filtros);

      const deactivationPromises: Promise<void>[] = [];
      dados.forEach(promo => {
        if (promo.ativa && isExpired(promo.dataFim)) {
          console.warn(`Promoção "${promo.descricao}" expirou e será desativada.`);
          deactivationPromises.push(promocaoService.desativar(promo.id));
          promo.ativa = false;
        }
      });

      if (deactivationPromises.length > 0) {
        await Promise.all(deactivationPromises);
        showToast.info(`${deactivationPromises.length} promoção(ões) expiradas foram desativadas.`);
        refetchNotifications(); 
      }

      setPromocoes(dados);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao carregar promoções: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [filtrosString, refetchNotifications, filtros]); 

  const criarPromocao = async (formData: FormData): Promise<boolean> => {
    setError(null);
    try {
      await promocaoService.criar(formData);
      showToast.success('Promoção criada com sucesso!');
      refetchNotifications();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao criar promoção: ${errorMessage}`);
      return false;
    }
  };

  const atualizarPromocao = async (id: number, formData: FormData): Promise<boolean> => {
    setError(null);
    try {
      await promocaoService.atualizar(id, formData);
      showToast.success('Promoção atualizada com sucesso!');
      refetchNotifications();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao atualizar promoção: ${errorMessage}`);
      return false;
    }
  };

  const desativarPromocao = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await promocaoService.desativar(id);
      showToast.success('Promoção desativada com sucesso!');
      refetchNotifications();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`${errorMessage}`);
      return false;
    }
  };

  const atualizarFiltros = useCallback((novosFiltros: Partial<FiltrosPromocoes>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  useEffect(() => {
    carregarPromocoes();
  }, [carregarPromocoes]);

  return {
    promocoes,
    loading,
    error,
    carregarPromocoes,
    criarPromocao,
    atualizarPromocao,
    desativarPromocao,
    atualizarFiltros,
  };
};