import api from './api';
import { Perda, PerdaData, FiltrosPerdas } from '../types'; // Importa as interfaces do arquivo central

export const perdaService = {
  /**
   * Registra uma nova perda de produto no sistema.
   * @param perda Os dados da perda a ser registrada.
   * @returns Uma Promise com o objeto Perda recém-criado.
   */
  registrar: async (perda: PerdaData): Promise<Perda> => {
    try {
      const response = await api.post<Perda>('/perdas', perda);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar perda:', error);
      throw new Error('Não foi possível registrar a perda.');
    }
  },

  /**
   * Lista os registros de perdas, com possibilidade de filtros.
   * @param filtros Objeto com os filtros a serem aplicados (ex: datas).
   * @returns Uma Promise com um array de Perdas.
   */
  listar: async (filtros: FiltrosPerdas = {}): Promise<Perda[]> => {
    try {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      const response = await api.get<Perda[]>(`/api/perdas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar perdas:', error);
      throw new Error('Não foi possível carregar os registros de perdas.');
    }
  },

  /**
   * Busca um registro de perda específico pelo seu ID.
   * @param id O ID do registro de perda.
   * @returns Uma Promise com o objeto Perda.
   */
  buscarPorId: async (id: number): Promise<Perda> => {
    try {
      const response = await api.get<Perda>(`/api/perdas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar perda ${id}:`, error);
      throw new Error('Não foi possível encontrar o registro de perda.');
    }
  }
};