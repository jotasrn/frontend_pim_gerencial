import { useState, useEffect, useCallback, useMemo } from 'react';
import { relatorioService } from '../services/relatorioService';
import { usuarioService } from '../services/usuarioService';
import { promocaoService } from '../services/promocaoService';
import { entregaService } from '../services/entregaService';
import { perdaService } from '../services/perdaService';
import { produtoService } from '../services/produtoService';
import { showToast } from '../components/Toast'; // Agora está sendo usado
import {
  Venda,
  VendasCategoriaData,
  TopProdutosData,
  PerdasMotivoData,
  NiveisEstoqueData,
  EstoqueCriticoData,
  Perda,
  Produto,
  FiltrosRelatorios
} from '../types';

interface KpiData {
  usuariosAtivos: number;
  promocoesAtivas: number;
  pedidosHoje: number;
  entregasPendentes: number;
}

interface UseRelatoriosReturn {
  vendas: Venda[];
  perdas: Perda[];
  produtos: Produto[];
  vendasPorCategoria: VendasCategoriaData[];
  topProdutos: TopProdutosData[];
  perdasPorMotivo: PerdasMotivoData[];
  niveisEstoque: NiveisEstoqueData[];
  estoqueCritico: EstoqueCriticoData | null;
  vendasRecentes: Venda[]; // Adicionado de volta
  kpis: KpiData;
  loading: boolean;
  error: string | null;
  carregarRelatorios: (filtros: FiltrosRelatorios) => void;
}

const getTodayRange = () => {
  const today = new Date().toISOString().split('T')[0];
  return { dataInicio: today, dataFim: today };
};

// Helper para datas padrão (últimos 7 dias)
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);
  return {
    dataInicio: startDate.toISOString().split('T')[0],
    dataFim: endDate.toISOString().split('T')[0],
  };
};

export const useRelatorios = (): UseRelatoriosReturn => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [perdas, setPerdas] = useState<Perda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendasPorCategoria, setVendasPorCategoria] = useState<VendasCategoriaData[]>([]);
  const [topProdutos, setTopProdutos] = useState<TopProdutosData[]>([]);
  const [perdasPorMotivo, setPerdasPorMotivo] = useState<PerdasMotivoData[]>([]);
  const [niveisEstoque, setNiveisEstoque] = useState<NiveisEstoqueData[]>([]);
  const [estoqueCritico, setEstoqueCritico] = useState<EstoqueCriticoData | null>(null);
  const [vendasRecentes, setVendasRecentes] = useState<Venda[]>([]); // Adicionado de volta
  const [kpis, setKpis] = useState<KpiData>({
    usuariosAtivos: 0,
    promocoesAtivas: 0,
    pedidosHoje: 0,
    entregasPendentes: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoiza o valor padrão para estabilizar o useEffect
  const defaultDates = useMemo(() => getDefaultDateRange(), []);

  const carregarRelatorios = useCallback(async (filtros: FiltrosRelatorios) => {
    setLoading(true);
    setError(null);
    try {
      const todayRange = getTodayRange();

      const [
        vendasData,
        perdasData,
        produtosData,
        estCritData,
        usuariosData,
        promocoesData,
        entregasData,
        pedidosHojeData,
        recentSalesData, // Busca separada para vendas recentes (últimos 5)
      ] = await Promise.all([
        relatorioService.gerarRelatorioVendas(filtros),
        perdaService.listar(filtros),
        produtoService.listar({ status: 'all' }),
        relatorioService.gerarRelatorioEstoqueCritico(),
        usuarioService.listar(),
        promocaoService.listar({ ativa: true }),
        entregaService.listar({ status: 'PENDENTE' }),
        relatorioService.gerarRelatorioVendas(todayRange),
        relatorioService.gerarRelatorioVendas({ limite: 5 }), // Para o dashboard
      ]);

      setVendas(vendasData);
      setPerdas(perdasData);
      setProdutos(produtosData);
      setEstoqueCritico(estCritData);
      setVendasRecentes(recentSalesData); // Define o estado de vendas recentes

      setKpis({
        usuariosAtivos: usuariosData.filter(u => u.ativo).length,
        promocoesAtivas: promocoesData.length,
        pedidosHoje: pedidosHojeData.length,
        entregasPendentes: entregasData.length,
      });

      // --- Cálculos derivados (agora baseados nos dados filtrados) ---
      const catMap = new Map<string, number>();
      vendasData.forEach(v => {
        v.itens.forEach(item => {
          const catNome = item.produto?.categoria?.nome || 'Sem Categoria';
          const total = catMap.get(catNome) || 0;
          catMap.set(catNome, total + (item.precoUnitario * item.quantidade));
        });
      });
      setVendasPorCategoria(Array.from(catMap, ([c, t]) => ({ categoria: c, totalVendido: t })));

      const prodMap = new Map<string, number>();
      vendasData.forEach(v => {
        v.itens.forEach(item => {
          const prodNome = item.produto?.nome || 'Produto Desconhecido';
          const total = prodMap.get(prodNome) || 0;
          prodMap.set(prodNome, total + item.quantidade);
        });
      });
      setTopProdutos(Array.from(prodMap, ([n, t]) => ({ nomeProduto: n, totalVendido: t }))
        .sort((a, b) => b.totalVendido - a.totalVendido)
        .slice(0, 5)
      );

      const perdaMap = new Map<string, number>();
      perdasData.forEach(p => {
        const motivo = p.motivo || 'Não especificado';
        const total = perdaMap.get(motivo) || 0;
        perdaMap.set(motivo, total + p.quantidade);
      });
      setPerdasPorMotivo(Array.from(perdaMap, ([m, t]) => ({ motivo: m, totalPerdido: t })));

      setNiveisEstoque(produtosData.map(p => ({
        nomeProduto: p.nome,
        quantidadeAtual: p.estoque?.quantidadeAtual ?? 0,
        quantidadeMinima: p.estoque?.quantidadeMinima ?? 0
      })));

    } catch (err: unknown) {
      let errorMessage = 'Erro desconhecido ao carregar relatórios.';
      if (err instanceof Error) {
        errorMessage = err.message || 'Erro ao carregar relatórios.';
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      showToast.error(errorMessage); // Erro 'showToast' não usado corrigido
      console.error("Erro detalhado ao carregar relatórios:", err); // Erro 'err' não usado corrigido

      // Define estados de erro
      setVendas([]);
      setPerdas([]);
      setProdutos([]);
      setVendasPorCategoria([]);
      setTopProdutos([]);
      setPerdasPorMotivo([]);
      setNiveisEstoque([]);
      setEstoqueCritico(null);
      setVendasRecentes([]);
      setKpis({ usuariosAtivos: 0, promocoesAtivas: 0, pedidosHoje: 0, entregasPendentes: 0 });
    } finally {
      setLoading(false);
    }
  }, []); // useCallback vazio, chamado pelo useEffect ou manualmente

  useEffect(() => {
    carregarRelatorios(defaultDates); // Corrigido de 'filtrosIniciais' para 'defaultDates'
  }, [carregarRelatorios, defaultDates]); // Corrigido de 'filtrosIniciais' para 'defaultDates'

  return {
    vendas,
    perdas,
    produtos,
    vendasPorCategoria,
    topProdutos,
    perdasPorMotivo,
    niveisEstoque,
    estoqueCritico,
    vendasRecentes,
    kpis,
    loading,
    error,
    carregarRelatorios,
  };
};