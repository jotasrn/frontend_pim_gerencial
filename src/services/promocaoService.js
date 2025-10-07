import api from './api';

export const promocaoService = {
  // Criar promoção
  criar: async (promocao) => {
    try {
      const response = await api.post('/api/promocoes', promocao);
      return {
        success: true,
        data: response.data,
        message: 'Promoção criada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao criar promoção'
      };
    }
  },

  // Listar promoções
  listar: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await api.get(`/api/promocoes${params ? `?${params}` : ''}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao listar promoções'
      };
    }
  },

  // Buscar promoção por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/api/promocoes/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao buscar promoção'
      };
    }
  },

  // Associar produto à promoção
  associarProduto: async (promocaoId, produtoId) => {
    try {
      const response = await api.post(`/api/promocoes/${promocaoId}/associar-produto`, {
        produtoId
      });
      return {
        success: true,
        data: response.data,
        message: 'Produto associado à promoção com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao associar produto à promoção'
      };
    }
  },

  // Atualizar promoção
  atualizar: async (id, promocao) => {
    try {
      const response = await api.put(`/api/promocoes/${id}`, promocao);
      return {
        success: true,
        data: response.data,
        message: 'Promoção atualizada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao atualizar promoção'
      };
    }
  },

  // Remover promoção
  remover: async (id) => {
    try {
      await api.delete(`/api/promocoes/${id}`);
      return {
        success: true,
        message: 'Promoção removida com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao remover promoção'
      };
    }
  }
};