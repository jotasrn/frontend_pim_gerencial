import api from './api';
import { Fornecedor, FiltrosFornecedores } from '../types'; // Importa as interfaces do arquivo central

// Define o tipo para os dados de criação/atualização de um fornecedor (sem o 'id')
type FornecedorData = Omit<Fornecedor, 'id'>;

export const fornecedorService = {
  /**
   * Busca todos os fornecedores da API, aplicando filtros.
   * @param filtros Objeto com os filtros a serem aplicados.
   * @returns Uma Promise com um array de Fornecedores.
   */
  listar: async (filtros: FiltrosFornecedores = {}): Promise<Fornecedor[]> => {
    try {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      const response = await api.get<Fornecedor[]>(`/api/fornecedores${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar fornecedores:', error);
      throw new Error('Não foi possível carregar os fornecedores.');
    }
  },

  /**
   * Busca um único fornecedor pelo seu ID.
   * @param id O ID do fornecedor.
   * @returns Uma Promise com o objeto Fornecedor.
   */
  buscarPorId: async (id: number): Promise<Fornecedor> => {
    try {
      const response = await api.get<Fornecedor>(`/api/fornecedores/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar fornecedor ${id}:`, error);
      throw new Error('Não foi possível encontrar o fornecedor.');
    }
  },

  /**
   * Cria um novo fornecedor.
   * @param fornecedor Os dados do novo fornecedor.
   * @returns Uma Promise com o Fornecedor recém-criado.
   */
  criar: async (fornecedor: FornecedorData): Promise<Fornecedor> => {
    try {
      const response = await api.post<Fornecedor>('/fornecedores', fornecedor);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      throw new Error('Não foi possível criar o fornecedor.');
    }
  },

  /**
   * Atualiza um fornecedor existente.
   * @param id O ID do fornecedor a ser atualizado.
   * @param fornecedor Os novos dados para o fornecedor.
   * @returns Uma Promise com o Fornecedor atualizado.
   */
  atualizar: async (id: number, fornecedor: FornecedorData): Promise<Fornecedor> => {
    try {
      const response = await api.put<Fornecedor>(`/fornecedores/${id}`, fornecedor);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar fornecedor ${id}:`, error);
      throw new Error('Não foi possível atualizar o fornecedor.');
    }
  },

  /**
   * Remove um fornecedor.
   * @param id O ID do fornecedor a ser removido.
   */
  remover: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/fornecedores/${id}`);
    } catch (error) {
      console.error(`Erro ao remover fornecedor ${id}:`, error);
      throw new Error('Não foi possível remover o fornecedor.');
    }
  }
};