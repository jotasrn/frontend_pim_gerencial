import { useState, useEffect, useCallback } from 'react';
import { relatorioService } from '../services/relatorioService';
import { showToast } from '../components/Toast';
import {
  Venda,
  VendasCategoriaData,
  TopProdutosData,
  PerdasMotivoData,
  NiveisEstoqueData,
  EstoqueCriticoData,
} from '../types'; // Importar todos os tipos de ../types

// Interface para o estado retornado pelo hook (não precisa redefinir os tipos aqui)
interface UseRelatoriosReturn {
  vendasPorCategoria: VendasCategoriaData[];
  topProdutos: TopProdutosData[];
  perdasPorMotivo: PerdasMotivoData[];
  niveisEstoque: NiveisEstoqueData[];
  estoqueCritico: EstoqueCriticoData | null;
  vendasRecentes: Venda[];
  loading: boolean;
  error: string | null;
  carregarRelatorios: () => void;
}

export const useRelatorios = (): UseRelatoriosReturn => {
  const [vendasPorCategoria, setVendasPorCategoria] = useState<VendasCategoriaData[]>([]);
  const [topProdutos, setTopProdutos] = useState<TopProdutosData[]>([]);
  const [perdasPorMotivo, setPerdasPorMotivo] = useState<PerdasMotivoData[]>([]);
  const [niveisEstoque, setNiveisEstoque] = useState<NiveisEstoqueData[]>([]);
  const [estoqueCritico, setEstoqueCritico] = useState<EstoqueCriticoData | null>(null);
  const [vendasRecentes, setVendasRecentes] = useState<Venda[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Começa true para indicar carregamento inicial
  const [error, setError] = useState<string | null>(null);

  const carregarRelatorios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Faz todas as chamadas em paralelo para otimizar
      const [
        vendasCatData,
        topProdData,
        perdasMotData,
        niveisEstData,
        estCritData,
        recentSalesData,
      ] = await Promise.all([
        relatorioService.gerarRelatorioVendasPorCategoria(),
        relatorioService.gerarRelatorioTopProdutos(),
        relatorioService.gerarRelatorioPerdasPorMotivo(),
        relatorioService.gerarRelatorioNiveisEstoque(),
        relatorioService.gerarRelatorioEstoqueCritico(),
        relatorioService.gerarRelatorioVendas({ limite: 5 }), // Pede as 5 vendas mais recentes
      ]);

      setVendasPorCategoria(vendasCatData);
      setTopProdutos(topProdData);
      setPerdasPorMotivo(perdasMotData);
      setNiveisEstoque(niveisEstData);
      setEstoqueCritico(estCritData);
      setVendasRecentes(recentSalesData);

    } catch (err) {
      // Usa 'unknown' e depois verifica o tipo para segurança
      let errorMessage = 'Erro desconhecido ao carregar relatórios.';
      if (err instanceof Error) {
        errorMessage = err.message || 'Erro ao carregar relatórios.';
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error("Erro detalhado ao carregar relatórios:", err); // Log mais detalhado
    } finally {
      setLoading(false);
    }
  }, []); // Dependência vazia, pois relatorioService não deve mudar

  // Carrega os relatórios quando o hook é montado pela primeira vez
  useEffect(() => {
    carregarRelatorios();
  }, [carregarRelatorios]); // A dependência carregarRelatorios está correta devido ao useCallback

  return {
    vendasPorCategoria,
    topProdutos,
    perdasPorMotivo,
    niveisEstoque,
    estoqueCritico,
    vendasRecentes,
    loading,
    error,
    carregarRelatorios, // Função para recarregar manualmente se necessário
  };
};