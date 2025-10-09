import api from './api';
import { Promocao, PromocaoData, FiltrosPromocoes } from '../types'; // Importa as interfaces

export const promocaoService = {
  /**
   * Lista todas as promoções, com possibilidade de filtros.
   * @param filtros Objeto com os filtros a serem aplicados.
   * @returns Uma Promise com um array de Promoções.
   */
  listar: async (filtros: FiltrosPromocoes = {}): Promise<Promocao[]> => {
    try {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      const response = await api.get<Promocao[]>(`/promocoes${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar promoções:', error);
      throw new Error('Não foi possível carregar as promoções.');
    }
  },

  /**
   * Busca uma promoção específica pelo seu ID.
   * @param id O ID da promoção.
   * @returns Uma Promise com o objeto Promocao.
   */
  buscarPorId: async (id: number): Promise<Promocao> => {
    try {
      const response = await api.get<Promocao>(`/promocoes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar promoção ${id}:`, error);
      throw new Error('Não foi possível encontrar a promoção.');
    }
  },

  /**
   * Cria uma nova promoção.
   * @param promocao Os dados da nova promoção.
   * @returns Uma Promise com a Promocao recém-criada.
   */
  criar: async (promocao: PromocaoData): Promise<Promocao> => {
    try {
      const response = await api.post<Promocao>('/promocoes', promocao);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar promoção:', error);
      throw new Error('Não foi possível criar a promoção.');
    }
  },

  /**
   * Atualiza uma promoção existente.
   * @param id O ID da promoção a ser atualizada.
   * @param promocao Os novos dados para a promoção.
   * @returns Uma Promise com a Promocao atualizada.
   */
  atualizar: async (id: number, promocao: PromocaoData): Promise<Promocao> => {
    try {
      // O endpoint de atualização pode não existir ainda no back-end, mas a estrutura está pronta.
      const response = await api.put<Promocao>(`/promocoes/${id}`, promocao);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar promoção ${id}:`, error);
      throw new Error('Não foi possível atualizar a promoção.');
    }
  },

  /**
   * Remove uma promoção.
   * @param id O ID da promoção a ser removida.
   */
  remover: async (id: number): Promise<void> => {
    try {
      // O endpoint de delete pode não existir ainda no back-end.
      await api.delete(`/promocoes/${id}`);
    } catch (error) {
      console.error(`Erro ao remover promoção ${id}:`, error);
      throw new Error('Não foi possível remover a promoção.');
    }
  },

  /**
   * Associa um único produto a uma promoção.
   * @param promocaoId O ID da promoção.
   * @param produtoId O ID do produto a ser associado.
   * @returns Uma Promise com a Promocao atualizada.
   */
  associarProduto: async (promocaoId: number, produtoId: number): Promise<Promocao> => {
    try {
      const response = await api.post<Promocao>(`/promocoes/${promocaoId}/associar-produto`, {
        produtoId,
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao associar produto ${produtoId} à promoção ${promocaoId}:`, error);
      throw new Error('Não foi possível associar o produto.');
    }
  },
};