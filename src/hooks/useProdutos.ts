import { useState, useEffect, useCallback } from 'react';
import { produtoService } from '../services/produtoService';
import { showToast } from '../components/Toast';
import { Produto, FiltrosProdutos } from '../types';
import { useNotifications } from '../contexts/NotificacaoContext';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosProdutos>(filtrosIniciais);

  const { refetchNotifications } = useNotifications();
  const filtrosString = JSON.stringify(filtros);

  const carregarProdutos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await produtoService.listar(filtros);

      const deactivationPromises: Promise<void>[] = [];
      let lowStockAlertShown = false;

      dados.forEach(p => {
        const isLowStock = p.estoque && p.estoque.quantidadeAtual <= 5;
        if (p.ativo && isLowStock) {
          deactivationPromises.push(produtoService.desativar(p.id));
          p.ativo = false;
          if (!lowStockAlertShown) {
            showToast.warning(`Produto "${p.nome}" foi desativado (estoque baixo).`);
            lowStockAlertShown = true;
          }
        }
      });

      if (deactivationPromises.length > 0) {
        await Promise.all(deactivationPromises);
        refetchNotifications();
      }

      setProdutos(dados);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar produtos.';
      setError(errorMessage);
      showToast.error(`Erro ao carregar produtos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [filtrosString, refetchNotifications, filtros]);

  const criarProduto = async (formData: FormData): Promise<boolean> => {
    try {
      await produtoService.criar(formData);
      showToast.success('Produto criado com sucesso!');
      refetchNotifications();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao criar produto: ${errorMessage}`);
      return false;
    }
  };

  const atualizarProduto = async (id: number, formData: FormData): Promise<boolean> => {
    try {
      await produtoService.atualizar(id, formData);
      showToast.success('Produto atualizado com sucesso!');
      refetchNotifications();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao atualizar produto: ${errorMessage}`);
      return false;
    }
  };

  const desativarProduto = async (id: number): Promise<boolean> => {
    try {
      await produtoService.desativar(id);
      showToast.success('Status do produto alterado com sucesso!');
      refetchNotifications();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao alterar status do produto: ${errorMessage}`);
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