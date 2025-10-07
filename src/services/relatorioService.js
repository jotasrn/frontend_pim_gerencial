import api from './api';

export const relatorioService = {
  // Gerar relatório de vendas
  gerarRelatorioVendas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await api.get(`/api/relatorios/vendas${params ? `?${params}` : ''}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao gerar relatório de vendas'
      };
    }
  },

  // Gerar relatório de estoque
  gerarRelatorioEstoque: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await api.get(`/api/relatorios/estoque${params ? `?${params}` : ''}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao gerar relatório de estoque'
      };
    }
  },

  // Gerar relatório de perdas
  gerarRelatorioPerdas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await api.get(`/api/relatorios/perdas${params ? `?${params}` : ''}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao gerar relatório de perdas'
      };
    }
  }
};