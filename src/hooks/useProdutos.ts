import { useState, useEffect, useCallback } from 'react';
import { produtoService } from '../services/produtoService';
import { perdaService } from '../services/perdaService'; 
import { showToast } from '../components/Toast';
import { Produto, FiltrosProdutos } from '../types';
import { useNotifications } from '../contexts/NotificacaoContext';

export const isExpired = (dateString?: string): boolean => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(dateString);
  return expiryDate < today;
};

interface UseProdutosReturn {
  produtos: Produto[];
  loading: boolean;
  error: string | null;
  filtros: FiltrosProdutos;
  carregarProdutos: () => void;
  criarProduto: (formData: FormData) => Promise<boolean>;
  atualizarProduto: (id: number, formData: FormData) => Promise<boolean>;
  desativarProduto: (id: number) => Promise<boolean>;
  ativarProduto: (produto: Produto) => Promise<boolean>;
  atualizarFiltros: (novosFiltros: Partial<FiltrosProdutos>) => void;
}

export const useProdutos = (filtrosIniciais: FiltrosProdutos = {}): UseProdutosReturn => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosProdutos>(filtrosIniciais);

  const { refetchNotifications } = useNotifications();

  const carregarProdutos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await produtoService.listar(filtros);

      const updatesPromises: Promise<void>[] = [];
      
      for (const p of dados) {
        const estoqueAtual = p.estoque?.quantidadeAtual || 0;
        const vencido = isExpired(p.dataValidade);
        const estoqueBaixo = estoqueAtual <= 5;

        if (vencido && estoqueAtual > 0) {
          console.log(`Produto ${p.nome} vencido. Registrando perda automática...`);
          
          updatesPromises.push(
            perdaService.registrar({
              produtoId: p.id,
              quantidade: estoqueAtual,
              motivo: 'VENCIMENTO (Automático)'
            }).then(() => {
               showToast.error(`Produto "${p.nome}" venceu! Perda de ${estoqueAtual} itens registrada automaticamente.`);
            })
          );
          
          if (p.ativo) {
             updatesPromises.push(produtoService.desativar(p.id));
             p.ativo = false; 
          }
          if(p.estoque) p.estoque.quantidadeAtual = 0;
          
        } 
        else if (estoqueBaixo && p.ativo && !vencido) { 
           console.log(`Produto ${p.nome} com estoque baixo. Desativando...`);
           updatesPromises.push(produtoService.desativar(p.id));
           p.ativo = false;
           showToast.warning(`Estoque baixo: Produto "${p.nome}" foi desativado.`);
        }
      }

      if (updatesPromises.length > 0) {
        await Promise.all(updatesPromises);
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
  }, [refetchNotifications, filtros]); 

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
      showToast.success('Produto desativado com sucesso!');
      refetchNotifications();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao alterar status do produto: ${errorMessage}`);
      return false;
    }
  };

  const ativarProduto = async (produto: Produto): Promise<boolean> => {
    try {
      const formData = new FormData();
      const produtoAtualizado = { ...produto, ativo: true };
      
      formData.append('produto', JSON.stringify(produtoAtualizado));

      await produtoService.atualizar(produto.id, formData);
      
      showToast.success('Produto ativado com sucesso!');
      refetchNotifications();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao ativar produto: ${errorMessage}`);
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
    ativarProduto, 
    atualizarFiltros,
  };
};