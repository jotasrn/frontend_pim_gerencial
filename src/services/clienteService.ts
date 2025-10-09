import { Cliente } from '../types';

export const clienteService = {
  /**
   * Busca todos os clientes da API.
   * ATENÇÃO: Este endpoint precisa ser criado e protegido no back-end.
   */
  listar: async (): Promise<Cliente[]> => {
    try {
      // const response = await api.get<Cliente[]>('/clientes');
      // return response.data;
      
      // Simulação enquanto o back-end não está pronto
      console.warn("API endpoint para listar clientes não implementado. Retornando dados de exemplo.");
      return [
        { id: 1, nome: 'Maria Silva', email: 'maria@example.com', totalPedidos: 12, ultimoPedido: '2025-09-10' },
        { id: 2, nome: 'João Pereira', email: 'joao@example.com', totalPedidos: 8, ultimoPedido: '2025-09-09' },
      ];
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw new Error('Não foi possível carregar os clientes.');
    }
  },
};