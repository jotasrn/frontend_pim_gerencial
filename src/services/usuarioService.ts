import api from './api';
import { Usuario, UsuarioData } from '../types';

export const usuarioService = {
  /**
   * Busca todos os usuários da API.
   * ATENÇÃO: Este endpoint precisa ser criado e protegido no back-end.
   */
  listar: async (): Promise<Usuario[]> => {
    try {
      // const response = await api.get<Usuario[]>('/usuarios/all');
      // return response.data;
      
      // Simulação enquanto o back-end não está pronto
      console.warn("API endpoint para listar usuários não implementado. Retornando dados de exemplo.");
      return [
        { id: 1, nome: 'Gerente Teste', email: 'manager@example.com', permissao: 'gerente', ativo: true, nomeCompleto: 'Gerente Teste' },
        { id: 2, nome: 'Entregador Teste', email: 'deliverer@example.com', permissao: 'entregador', ativo: true, nomeCompleto: 'Entregador Teste' },
      ];
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw new Error('Não foi possível carregar os usuários.');
    }
  },

  /**
   * Cria um novo usuário (gerente ou entregador).
   * ATENÇÃO: Este endpoint precisa ser criado e protegido no back-end.
   */
  criar: async (usuario: UsuarioData): Promise<Usuario> => {
    try {
      // O endpoint para criar usuários gerais precisa ser implementado
      const response = await api.post<Usuario>('/usuarios/criar', usuario);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw new Error('Não foi possível criar o usuário.');
    }
  },

  /**
   * Atualiza um usuário existente.
   * ATENÇÃO: Este endpoint precisa ser criado e protegido no back-end.
   */
  atualizar: async (id: number, usuario: Partial<UsuarioData>): Promise<Usuario> => {
    try {
      const response = await api.put<Usuario>(`/api/usuarios/${id}`, usuario);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error);
      throw new Error('Não foi possível atualizar o usuário.');
    }
  },

  /**
   * Remove um usuário.
   * ATENÇÃO: Este endpoint precisa ser criado e protegido no back-end.
   */
  remover: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/usuarios/${id}`);
    } catch (error) {
      console.error(`Erro ao remover usuário ${id}:`, error);
      throw new Error('Não foi possível remover o usuário.');
    }
  },
};