import { useState, useEffect, useCallback } from 'react';
import { relatorioService } from '../services/relatorioService';
import { showToast } from '../components/Toast';
import {
  Venda,
  VendasCategoriaData,
  TopProdutosData,
  PerdasMotivoData,
  NiveisEstoqueData,
  EstoqueCriticoData
} from '../types';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarRelatorios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
        relatorioService.gerarRelatorioVendas({ limite: 5 }),
      ]);

      setVendasPorCategoria(vendasCatData);
      setTopProdutos(topProdData);
      setPerdasPorMotivo(perdasMotData);
      setNiveisEstoque(niveisEstData);
      setEstoqueCritico(estCritData);
      setVendasRecentes(recentSalesData);

    } catch (err: unknown) {
      let errorMessage = 'Erro desconhecido ao carregar relatórios.';
      if (err instanceof Error) {
        errorMessage = err.message || 'Erro ao carregar relatórios.';
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error("Erro detalhado ao carregar relatórios:", err);

      setVendasPorCategoria([]);
      setTopProdutos([]);
      setPerdasPorMotivo([]);
      setNiveisEstoque([]);
      setEstoqueCritico(null);
      setVendasRecentes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarRelatorios();
  }, [carregarRelatorios]);

  return {
    vendasPorCategoria,
    topProdutos,
    perdasPorMotivo,
    niveisEstoque,
    estoqueCritico,
    vendasRecentes,
    loading,
    error,
    carregarRelatorios,
  };
};