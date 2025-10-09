import { useState, useEffect, useCallback } from 'react';
import { produtoService } from '../services/produtoService';
import { showToast } from '../components/Toast';
import { Categoria, ProdutoData } from '../types';

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  precoCusto: number;
  precoVenda: number;
  dataValidade?: string;
  tipoMedida?: string;
  codigoBarras?: string;
  ativo: boolean;
  categoria?: Categoria;
}

interface FiltrosProdutos {
  nome?: string;
  categoriaId?: number;
}

interface UseProdutosReturn {
  produtos: Produto[];
  loading: boolean;
  error: string | null;
  filtros: FiltrosProdutos;
  carregarProdutos: () => void;
  criarProduto: (produto: ProdutoData) => Promise<boolean>;
  atualizarProduto: (id: number, produto: ProdutoData) => Promise<boolean>;
  removerProduto: (id: number) => Promise<boolean>;
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
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const criarProduto = async (produto: ProdutoData): Promise<boolean> => {
    setLoading(true);
    try {
      await produtoService.criar(produto);
      await carregarProdutos();
      showToast.success('Produto criado com sucesso!');
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

  const atualizarProduto = async (id: number, produto: ProdutoData): Promise<boolean> => {
    setLoading(true);
    try {
      await produtoService.atualizar(id, produto);
      await carregarProdutos();
      showToast.success('Produto atualizado com sucesso!');
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

  const removerProduto = async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      await produtoService.remover(id);
      await carregarProdutos();
      showToast.success('Produto removido com sucesso!');
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
    removerProduto,
    atualizarFiltros,
  };
};