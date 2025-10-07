import api from './api';

export const categoriaService = {
  // Criar categoria
  criar: async (categoria) => {
    try {
      const response = await api.post('/api/categorias', categoria);
      return {
        success: true,
        data: response.data,
        message: 'Categoria criada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao criar categoria'
      };
    }
  },

  // Listar categorias
  listar: async () => {
    try {
      const response = await api.get('/api/categorias');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao listar categorias'
      };
    }
  },

  // Buscar categoria por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/api/categorias/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao buscar categoria'
      };
    }
  },

  // Atualizar categoria
  atualizar: async (id, categoria) => {
    try {
      const response = await api.put(`/api/categorias/${id}`, categoria);
      return {
        success: true,
        data: response.data,
        message: 'Categoria atualizada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao atualizar categoria'
      };
    }
  },

  // Remover categoria
  remover: async (id) => {
    try {
      await api.delete(`/api/categorias/${id}`);
      return {
        success: true,
        message: 'Categoria removida com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao remover categoria'
      };
    }
  }
};