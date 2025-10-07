import api from './api';

export const entregaService = {
  // Listar entregas (para gerente)
  listar: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await api.get(`/api/entregas${params ? `?${params}` : ''}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao listar entregas'
      };
    }
  },

  // Associar entregador à entrega (para gerente)
  associarEntregador: async (entregaId, entregadorId) => {
    try {
      const response = await api.put(`/api/entregas/${entregaId}/associar-entregador`, {
        entregadorId
      });
      return {
        success: true,
        data: response.data,
        message: 'Entregador associado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao associar entregador'
      };
    }
  },

  // Listar minhas entregas (para entregador)
  listarMinhasEntregas: async () => {
    try {
      const response = await api.get('/api/entregas/minhas-entregas');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao listar suas entregas'
      };
    }
  },

  // Atualizar status da entrega (para entregador)
  atualizarStatus: async (entregaId, status) => {
    try {
      const response = await api.put(`/api/entregas/${entregaId}/status`, {
        status
      });
      return {
        success: true,
        data: response.data,
        message: 'Status da entrega atualizado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao atualizar status da entrega'
      };
    }
  },

  // Buscar entrega por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/api/entregas/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao buscar entrega'
      };
    }
  }
};