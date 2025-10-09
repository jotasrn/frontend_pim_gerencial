import { useState, useEffect, useCallback } from 'react';
import { promocaoService } from '../services/promocaoService';
import { showToast } from '../components/Toast';
import { Promocao, PromocaoData, FiltrosPromocoes } from '../types';

interface UsePromocoesReturn {
  promocoes: Promocao[];
  loading: boolean;
  criarPromocao: (promocao: PromocaoData) => Promise<boolean>;
  atualizarPromocao: (id: number, promocao: PromocaoData) => Promise<boolean>;
  removerPromocao: (id: number) => Promise<boolean>;
}

export const usePromocoes = (filtrosIniciais: FiltrosPromocoes = {}): UsePromocoesReturn => {
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const carregarPromocoes = useCallback(async () => {
    setLoading(true);
    try {
      const dados = await promocaoService.listar(filtrosIniciais);
      setPromocoes(dados);
    } catch (err) {
      showToast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filtrosIniciais]);

  const criarPromocao = async (promocao: PromocaoData): Promise<boolean> => {
    try {
      await promocaoService.criar(promocao);
      await carregarPromocoes();
      return true;
    } catch (err) {
      showToast.error((err as Error).message);
      return false;
    }
  };

  const atualizarPromocao = async (id: number, promocao: PromocaoData): Promise<boolean> => {
    try {
      await promocaoService.atualizar(id, promocao);
      await carregarPromocoes();
      return true;
    } catch (err) {
      showToast.error((err as Error).message);
      return false;
    }
  };

  const removerPromocao = async (id: number): Promise<boolean> => {
    try {
      await promocaoService.remover(id);
      await carregarPromocoes();
      return true;
    } catch (err) {
      showToast.error((err as Error).message);
      return false;
    }
  };

  useEffect(() => {
    carregarPromocoes();
  }, [carregarPromocoes]);

  return {
    promocoes,
    loading,
    criarPromocao,
    atualizarPromocao,
    removerPromocao,
  };
};