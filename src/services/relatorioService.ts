import api from './api';
import {
  VendasCategoriaData,
  TopProdutosData,
  PerdasMotivoData,
  NiveisEstoqueData,
  EstoqueCriticoData,
  Venda,
  FiltrosRelatorios,
} from '../types';

export const relatorioService = {
  gerarRelatorioVendasPorCategoria: async (): Promise<VendasCategoriaData[]> => {
    try {
      const response = await api.get<VendasCategoriaData[]>('/relatorios/vendas-por-categoria');
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de vendas por categoria:', error);
      throw new Error('Falha ao buscar vendas por categoria.');
    }
  },

  gerarRelatorioTopProdutos: async (): Promise<TopProdutosData[]> => {
    try {
      const response = await api.get<TopProdutosData[]>('/relatorios/top-produtos');
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de top produtos:', error);
      throw new Error('Falha ao buscar top produtos.');
    }
  },

  gerarRelatorioPerdasPorMotivo: async (): Promise<PerdasMotivoData[]> => {
    try {
      const response = await api.get<PerdasMotivoData[]>('/relatorios/perdas-por-motivo');
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de perdas por motivo:', error);
      throw new Error('Falha ao buscar perdas por motivo.');
    }
  },

  gerarRelatorioNiveisEstoque: async (): Promise<NiveisEstoqueData[]> => {
    try {
      const response = await api.get<NiveisEstoqueData[]>('/relatorios/estoque/niveis');
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de níveis de estoque:', error);
      throw new Error('Falha ao buscar níveis de estoque.');
    }
  },

  gerarRelatorioEstoqueCritico: async (): Promise<EstoqueCriticoData> => {
    try {
      const response = await api.get<Record<string, number>>('/relatorios/estoque/critico');
      return {
        totalItens: response.data?.totalItens ?? 0,
        itensCriticos: response.data?.itensCriticos ?? 0,
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de estoque crítico:', error);
      throw new Error('Falha ao buscar status do estoque crítico.');
    }
  },

  /**
   * Busca vendas realizadas dentro de um período, com limite opcional.
   * Usado para a tabela de vendas recentes no dashboard.
   * @param filtros Objeto contendo dataInicio?, dataFim?, limite?
   * @returns Promise<Venda[]>
   */
  gerarRelatorioVendas: async (filtros: FiltrosRelatorios & { limite?: number } = {}): Promise<Venda[]> => {
    try {
      // Define datas padrão (últimos 7 dias) se não forem fornecidas
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      // Prepara os filtros finais, garantindo formato YYYY-MM-DD para datas
      const finalFilters = {
        dataInicio: filtros.dataInicio || startDate.toISOString().split('T')[0],
        dataFim: filtros.dataFim || endDate.toISOString().split('T')[0],
        ...(filtros.limite && { limite: filtros.limite.toString() }), // Adiciona limite apenas se existir
      };

      // Constrói a query string apenas com parâmetros definidos
      const params = new URLSearchParams(finalFilters as Record<string, string>).toString();

      // Chama o endpoint /relatorios/vendas que aceita dataInicio, dataFim e limite
      const response = await api.get<Venda[]>(`/relatorios/vendas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de vendas:', error);
      throw new Error('Não foi possível gerar o relatório de vendas.');
    }
  },
};