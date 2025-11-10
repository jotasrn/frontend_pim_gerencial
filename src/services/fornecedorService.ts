import api from './api';
import { Fornecedor } from '../types';
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
  listar: async (): Promise<Fornecedor[]> => {
    try {
      const response = await api.get<Fornecedor[]>('/fornecedores');
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
      const response = await api.put<Fornecedor>(`/fornecedores/${id}`, fornecedor);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível atualizar o fornecedor.'));
    }
  },

  desativar: async (id: number): Promise<void> => {
    try {
      await api.put(`/fornecedores/${id}/desativar`);
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível desativar o fornecedor.'));
    }
  }
};