import api from './api';

export const perdaService = {
  // Registrar perda
  registrar: async (perda) => {
    try {
      const response = await api.post('/api/perdas', perda);
      return {
        success: true,
        data: response.data,
        message: 'Perda registrada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao registrar perda'
      };
    }
  },

  // Listar perdas
  listar: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await api.get(`/api/perdas${params ? `?${params}` : ''}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao listar perdas'
      };
    }
  },

  // Buscar perda por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/api/perdas/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao buscar perda'
      };
    }
  }
};