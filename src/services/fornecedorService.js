import api from './api';

export const fornecedorService = {
  // Criar fornecedor
  criar: async (fornecedor) => {
    try {
      const response = await api.post('/api/fornecedores', fornecedor);
      return {
        success: true,
        data: response.data,
        message: 'Fornecedor criado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao criar fornecedor'
      };
    }
  },

  // Listar fornecedores
  listar: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await api.get(`/api/fornecedores${params ? `?${params}` : ''}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao listar fornecedores'
      };
    }
  },

  // Buscar fornecedor por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/api/fornecedores/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao buscar fornecedor'
      };
    }
  },

  // Atualizar fornecedor
  atualizar: async (id, fornecedor) => {
    try {
      const response = await api.put(`/api/fornecedores/${id}`, fornecedor);
      return {
        success: true,
        data: response.data,
        message: 'Fornecedor atualizado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao atualizar fornecedor'
      };
    }
  },

  // Remover fornecedor
  remover: async (id) => {
    try {
      await api.delete(`/api/fornecedores/${id}`);
      return {
        success: true,
        message: 'Fornecedor removido com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao remover fornecedor'
      };
    }
  }
};