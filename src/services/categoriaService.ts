import api from './api';
import { Categoria } from '../types'; 

type CategoriaData = Omit<Categoria, 'id'>;

export const categoriaService = {
  /**
   * Busca todas as categorias da API.
   * @returns Uma Promise com um array de Categorias.
   */
  listar: async (): Promise<Categoria[]> => {
    try {
      const response = await api.get<Categoria[]>('/categorias');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      throw new Error('Não foi possível carregar as categorias. Tente novamente mais tarde.');
    }
  },

  /**
   * Cria uma nova categoria.
   * @param categoria Os dados da nova categoria (nome, descricao).
   * @returns Uma Promise com a Categoria recém-criada.
   */
  criar: async (categoria: CategoriaData): Promise<Categoria> => {
    try {
      const response = await api.post<Categoria>('/categorias', categoria);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw new Error('Não foi possível criar a categoria.');
    }
  },

  /**
   * Atualiza uma categoria existente.
   * @param id 
   * @param categoria 
   * @returns Uma Promise com a Categoria atualizada.
   */
  atualizar: async (id: number, categoria: CategoriaData): Promise<Categoria> => {
    try {
      const response = await api.put<Categoria>(`/api/categorias/${id}`, categoria);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar categoria ${id}:`, error);
      throw new Error('Não foi possível atualizar a categoria.');
    }
  },

  /**
   * Remove uma categoria.
   * @param id O ID da categoria a ser removida.
   */
  remover: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/categorias/${id}`);
    } catch (error) {
      console.error(`Erro ao remover categoria ${id}:`, error);
      throw new Error('Não foi possível remover a categoria.');
    }
  }
};