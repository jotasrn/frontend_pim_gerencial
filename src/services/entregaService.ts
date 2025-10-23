import api from './api';
import { Entrega, FiltrosEntregas } from '../types'; // Importa as interfaces do arquivo central

export const entregaService = {
  /**
   * Lista entregas com base em filtros. Usado pelo Gerente.
   * @param filtros Objeto com os filtros a serem aplicados (ex: { status: 'PENDENTE' }).
   * @returns Uma Promise com um array de Entregas.
   */
  listar: async (filtros: FiltrosEntregas = {}): Promise<Entrega[]> => {
    try {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      const response = await api.get<Entrega[]>(`/api/entregas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar entregas:', error);
      throw new Error('Não foi possível carregar as entregas.');
    }
  },

  /**
   * Associa um entregador a uma entrega específica. Usado pelo Gerente.
   * @param entregaId O ID da entrega.
   * @param entregadorId O ID do usuário entregador.
   * @returns Uma Promise com a Entrega atualizada.
   */
  associarEntregador: async (entregaId: number, entregadorId: number): Promise<Entrega> => {
    try {
      const response = await api.put<Entrega>(`/api/entregas/${entregaId}/associar-entregador`, {
        entregadorId,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao associar entregador:', error);
      throw new Error('Não foi possível associar o entregador.');
    }
  },

  /**
   * Lista as entregas atribuídas ao entregador logado.
   * @returns Uma Promise com um array de Entregas.
   */
  listarMinhasEntregas: async (): Promise<Entrega[]> => {
    try {
      const response = await api.get<Entrega[]>('/entregas/minhas-entregas');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar minhas entregas:', error);
      throw new Error('Não foi possível carregar suas entregas.');
    }
  },

  /**
   * Atualiza o status de uma entrega. Usado pelo Entregador.
   * @param entregaId O ID da entrega.
   * @param status O novo status para a entrega.
   * @returns Uma Promise com a Entrega atualizada.
   */
  atualizarStatus: async (entregaId: number, status: string): Promise<Entrega> => {
    try {
      const response = await api.put<Entrega>(`/api/entregas/${entregaId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status da entrega:', error);
      throw new Error('Não foi possível atualizar o status da entrega.');
    }
  },

  /**
   * Busca os detalhes de uma única entrega pelo ID.
   * @param id O ID da entrega.
   * @returns Uma Promise com o objeto Entrega.
   */
  buscarPorId: async (id: number): Promise<Entrega> => {
    try {
      const response = await api.get<Entrega>(`/api/entregas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar entrega ${id}:`, error);
      throw new Error('Não foi possível encontrar a entrega.');
    }
  }
};