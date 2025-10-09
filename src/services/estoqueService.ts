import api from './api';
import { Estoque, Produto } from '../types'; // Importa as interfaces do arquivo central

export const estoqueService = {
  /**
   * Adiciona uma quantidade ao estoque de um produto específico.
   * @param produtoId O ID do produto.
   * @param quantidade A quantidade a ser adicionada.
   * @returns Uma Promise com o estado do estoque atualizado.
   */
  adicionarQuantidade: async (produtoId: number, quantidade: number): Promise<Estoque> => {
    try {
      const response = await api.put<Estoque>(`/api/estoque/adicionar/${produtoId}`, {
        quantidade,
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao adicionar estoque para o produto ${produtoId}:`, error);
      throw new Error('Não foi possível adicionar quantidade ao estoque.');
    }
  },

  /**
   * Consulta o registro de estoque para um produto específico.
   * @param produtoId O ID do produto.
   * @returns Uma Promise com o objeto Estoque.
   */
  consultarEstoque: async (produtoId: number): Promise<Estoque> => {
    // Este endpoint precisa ser criado no back-end se ainda não existir.
    try {
      const response = await api.get<Estoque>(`/api/estoque/${produtoId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao consultar estoque do produto ${produtoId}:`, error);
      throw new Error('Não foi possível consultar o estoque.');
    }
  },

  /**
   * Lista os produtos que estão com o estoque abaixo do nível mínimo.
   * @param limite O número máximo de produtos a serem retornados.
   * @returns Uma Promise com um array de Produtos.
   */
  listarEstoqueBaixo: async (limite = 10): Promise<Produto[]> => {
    // Este endpoint precisa corresponder ao do back-end (ex: /api/relatorios/estoque-baixo)
    try {
      const response = await api.get<Produto[]>(`/api/estoque/baixo?limite=${limite}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar produtos com estoque baixo:', error);
      throw new Error('Não foi possível carregar a lista de estoque baixo.');
    }
  }
};