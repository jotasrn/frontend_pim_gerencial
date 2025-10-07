import api from './api';

export const produtoService = {
  // Criar produto
  criar: async (produto) => {
    try {
      const response = await api.post('/api/produtos', produto);
      return {
        success: true,
        data: response.data,
        message: 'Produto criado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao criar produto'
      };
    }
  },

  // Listar produtos
  listar: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await api.get(`/api/produtos${params ? `?${params}` : ''}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao listar produtos'
      };
    }
  },

  // Buscar produto por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/api/produtos/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao buscar produto'
      };
    }
  },

  // Atualizar produto
  atualizar: async (id, produto) => {
    try {
      const response = await api.put(`/api/produtos/${id}`, produto);
      return {
        success: true,
        data: response.data,
        message: 'Produto atualizado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao atualizar produto'
      };
    }
  },

  // Remover produto
  remover: async (id) => {
    try {
      await api.delete(`/api/produtos/${id}`);
      return {
        success: true,
        message: 'Produto removido com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao remover produto'
      };
    }
  }
};