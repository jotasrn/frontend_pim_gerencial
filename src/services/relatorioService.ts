import api from './api';
import { Venda, Estoque, Perda, FiltrosRelatorios } from '../types'; // Importa as interfaces necessárias

export const relatorioService = {
  /**
   * Gera um relatório de vendas com base em filtros de data.
   * @param filtros Objeto com data de início and data de fim.
   * @returns Uma Promise com um array de Vendas.
   */
  gerarRelatorioVendas: async (filtros: FiltrosRelatorios = {}): Promise<Venda[]> => {
    try {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      const response = await api.get<Venda[]>(`/api/relatorios/vendas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de vendas:', error);
      throw new Error('Não foi possível gerar o relatório de vendas.');
    }
  },

  /**
   * Gera um relatório de estoque. (Endpoint fictício, precisa ser criado no back-end)
   * @param filtros Filtros aplicáveis ao relatório de estoque.
   * @returns Uma Promise com os dados do relatório.
   */
  gerarRelatorioEstoque: async (filtros: FiltrosRelatorios = {}): Promise<Estoque[]> => {
    try {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      // ATENÇÃO: O endpoint /api/relatorios/estoque não foi criado no nosso back-end.
      // Esta é uma estrutura preparada para quando ele existir.
      const response = await api.get<Estoque[]>(`/api/relatorios/estoque${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de estoque:', error);
      throw new Error('Não foi possível gerar o relatório de estoque.');
    }
  },

  /**
   * Gera um relatório de perdas. (Endpoint fictício, precisa ser criado no back-end)
   * @param filtros Filtros aplicáveis ao relatório de perdas.
   * @returns Uma Promise com os dados do relatório.
   */
  gerarRelatorioPerdas: async (filtros: FiltrosRelatorios = {}): Promise<Perda[]> => {
    try {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      // ATENÇÃO: O endpoint /api/relatorios/perdas não foi criado no nosso back-end.
      // Esta é uma estrutura preparada para quando ele existir.
      const response = await api.get<Perda[]>(`/api/relatorios/perdas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de perdas:', error);
      throw new Error('Não foi possível gerar o relatório de perdas.');
    }
  }
};