import api from './api';
import { Estoque, Produto } from '../types';
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

export const estoqueService = {
  adicionarQuantidade: async (produtoId: number, quantidade: number): Promise<Estoque> => {
    try {
      const response = await api.put<Estoque>(`/estoque/adicionar/${produtoId}`, {
        quantidade,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível adicionar quantidade ao estoque.'));
    }
  },

  consultarEstoque: async (produtoId: number): Promise<Estoque> => {
    try {
      const response = await api.get<Estoque>(`/estoque/${produtoId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível consultar o estoque.'));
    }
  },

  listarEstoqueBaixo: async (limite = 10): Promise<Produto[]> => {
    try {
      const response = await api.get<Produto[]>(`/relatorios/estoque/critico?limite=${limite}`);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível carregar a lista de estoque baixo.'));
    }
  }
};