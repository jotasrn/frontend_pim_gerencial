import api from './api';

export const estoqueService = {
  // Adicionar quantidade ao estoque
  adicionarQuantidade: async (produtoId, quantidade) => {
    try {
      const response = await api.put(`/api/estoque/adicionar/${produtoId}`, {
        quantidade
      });
      return {
        success: true,
        data: response.data,
        message: 'Quantidade adicionada ao estoque com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao adicionar quantidade ao estoque'
      };
    }
  },

  // Consultar estoque de um produto
  consultarEstoque: async (produtoId) => {
    try {
      const response = await api.get(`/api/estoque/${produtoId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao consultar estoque'
      };
    }
  },

  // Listar produtos com estoque baixo
  listarEstoqueBaixo: async (limite = 10) => {
    try {
      const response = await api.get(`/api/estoque/baixo?limite=${limite}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao listar produtos com estoque baixo'
      };
    }
  }
};