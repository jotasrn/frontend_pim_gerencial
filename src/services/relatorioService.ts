import api from './api';
import {
  VendasCategoriaData,
  TopProdutosData,
  PerdasMotivoData,
  NiveisEstoqueData,
  EstoqueCriticoData,
  Venda,
  FiltrosRelatorios,
  NotificationDTO, // Adicionado
} from '../types';
import axios, { AxiosError } from 'axios'; // Adicionado

// Adicionado: Interface para Erros da API
interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// Adicionado: Função para tratar erros
const handleError = (error: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.message || axiosError.message || defaultMessage;
  } else if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  return defaultMessage;
};

export const relatorioService = {
  // Adicionado: Função para buscar notificações
  getNotificacoes: async (): Promise<NotificationDTO[]> => {
    try {
      const response = await api.get<NotificationDTO[]>('/relatorios/notificacoes');
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível carregar as notificações.'));
    }
  },

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

  gerarRelatorioVendas: async (filtros: FiltrosRelatorios & { limite?: number } = {}): Promise<Venda[]> => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const finalFilters = {
        dataInicio: filtros.dataInicio || startDate.toISOString().split('T')[0],
        dataFim: filtros.dataFim || endDate.toISOString().split('T')[0],
        ...(filtros.limite && { limite: filtros.limite.toString() }),
      };

      const params = new URLSearchParams(finalFilters as Record<string, string>).toString();

      const response = await api.get<Venda[]>(`/relatorios/vendas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de vendas:', error);
      throw new Error('Não foi possível gerar o relatório de vendas.');
    }
  },
};