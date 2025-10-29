import { useState, useEffect, useCallback } from 'react';
import { produtoService } from '../services/produtoService';
import { showToast } from '../components/Toast';
import { Produto, FiltrosProdutos } from '../types';

interface UseProdutosReturn {
  produtos: Produto[];
  loading: boolean;
  error: string | null;
  filtros: FiltrosProdutos;
  carregarProdutos: () => void;
  criarProduto: (formData: FormData) => Promise<boolean>;
  atualizarProduto: (id: number, formData: FormData) => Promise<boolean>;
  desativarProduto: (id: number) => Promise<boolean>;
  atualizarFiltros: (novosFiltros: Partial<FiltrosProdutos>) => void;
}

export const useProdutos = (filtrosIniciais: FiltrosProdutos = {}): UseProdutosReturn => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosProdutos>(filtrosIniciais);

  const carregarProdutos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await produtoService.listar(filtros);
      setProdutos(dados);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const criarProduto = async (formData: FormData): Promise<boolean> => {
    setError(null);
    try {
      await produtoService.criar(formData);
      showToast.success('Produto criado com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro: ${errorMessage}`);
      return false;
    }
  };

  const atualizarProduto = async (id: number, formData: FormData): Promise<boolean> => {
    setError(null);
    try {
      await produtoService.atualizar(id, formData);
      showToast.success('Produto atualizado com sucesso!');
      return true;
    } catch (err: unknown) {
       const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro: ${errorMessage}`);
      return false;
    }
  };

  const desativarProduto = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await produtoService.desativar(id);
      showToast.success('Status do produto alterado com sucesso!');
      return true;
    } catch (err: unknown) {
       const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro: ${errorMessage}`);
      return false;
    }
  };

  const atualizarFiltros = (novosFiltros: Partial<FiltrosProdutos>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  return {
    produtos,
    loading,
    error,
    filtros,
    carregarProdutos,
    criarProduto,
    atualizarProduto,
    desativarProduto,
    atualizarFiltros,
  };
};