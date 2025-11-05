import api from './api';
import { Cliente } from '../types';
import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const handleError = (error: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.message || axiosError.message || defaultMessage;
  } else if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  return defaultMessage;
};

export const clienteService = {
  listar: async (): Promise<Cliente[]> => {
    try {
      const response = await api.get<Cliente[]>('/clientes');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw new Error(handleError(error, 'Não foi possível carregar os clientes.'));
    }
  },
};