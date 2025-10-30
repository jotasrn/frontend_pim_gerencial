import { useState, useEffect, useCallback } from 'react';
import { promocaoService } from '../services/promocaoService';
import { showToast } from '../components/Toast';
import { Promocao, FiltrosPromocoes } from '../types';

interface UsePromocoesReturn {
  promocoes: Promocao[];
  loading: boolean;
  error: string | null;
  carregarPromocoes: () => void;
  criarPromocao: (formData: FormData) => Promise<boolean>;
  atualizarPromocao: (id: number, formData: FormData) => Promise<boolean>;
  removerPromocao: (id: number) => Promise<boolean>;
  associarProduto: (promocaoId: number, produtoId: number) => Promise<boolean>;
}

// Objeto vazio estático para evitar recriação no useCallback
const filtrosPadrao: FiltrosPromocoes = {};

export const usePromocoes = (filtrosIniciais: FiltrosPromocoes = filtrosPadrao): UsePromocoesReturn => {
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // filtrosIniciais agora é estável
  const carregarPromocoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await promocaoService.listar(filtrosIniciais);
      setPromocoes(dados);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao carregar promoções: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [filtrosIniciais]);

  const criarPromocao = async (formData: FormData): Promise<boolean> => {
    setError(null);
    try {
      await promocaoService.criar(formData);
      showToast.success('Promoção criada com sucesso!');
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
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao atualizar promoção: ${errorMessage}`);
      return false;
    }
  };

  const removerPromocao = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await promocaoService.remover(id);
      showToast.success('Promoção removida com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`${errorMessage}`);
      return false;
    }
  };

  const associarProduto = async (promocaoId: number, produtoId: number): Promise<boolean> => {
    setError(null);
    try {
        await promocaoService.associarProduto(promocaoId, produtoId);
        showToast.success('Produto associado à promoção!');
        return true;
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
        showToast.error(`Erro ao associar produto: ${errorMessage}`);
        return false;
    }
  };

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
    removerPromocao,
    associarProduto,
  };
};