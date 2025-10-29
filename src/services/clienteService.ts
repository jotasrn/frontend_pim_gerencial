import api from './api';
import { Cliente } from '../types';
import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const clienteService = {
  listar: async (): Promise<Cliente[]> => {
    try {
      // Chama o endpoint real do backend
      const response = await api.get<Cliente[]>('/clientes');
      // A API retorna Cliente[], que pode ter usuario aninhado
      return response.data;
    } catch (error: unknown) {
      console.error('Erro ao listar clientes:', error);
      let errorMessage = 'Não foi possível carregar os clientes.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },
  // REMOVIDAS: Funções criar, atualizar, remover (se existissem)
};