import api from './api';
import { Fornecedor, FiltrosFornecedores } from '../types';
import axios, { AxiosError } from 'axios';

type FornecedorData = Omit<Fornecedor, 'id'>;

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

export const fornecedorService = {
  listar: async (filtros: FiltrosFornecedores = {}): Promise<Fornecedor[]> => {
    try {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      const response = await api.get<Fornecedor[]>(`/fornecedores${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível carregar os fornecedores.'));
    }
  },

  buscarPorId: async (id: number): Promise<Fornecedor> => {
    try {
      const response = await api.get<Fornecedor>(`/fornecedores/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível encontrar o fornecedor.'));
    }
  },

  criar: async (fornecedor: FornecedorData): Promise<Fornecedor> => {
    try {
      const response = await api.post<Fornecedor>('/fornecedores', fornecedor);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível criar o fornecedor.'));
    }
  },

  atualizar: async (id: number, fornecedor: FornecedorData): Promise<Fornecedor> => {
    try {
      console.warn(`Endpoint PUT /fornecedores/${id} não implementado no backend. Simulação.`);
      return { id, ...fornecedor };
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível atualizar o fornecedor.'));
    }
  },

  remover: async (id: number): Promise<void> => {
    try {
     console.warn(`Endpoint DELETE /fornecedores/${id} não implementado no backend. Simulação.`);
      return;
    } catch (error) {
       throw new Error(handleError(error, 'Não foi possível remover o fornecedor.'));
    }
  }
};