import api from './api';
import { Categoria } from '../types';
import axios, { AxiosError } from 'axios';

type CategoriaData = Omit<Categoria, 'id'>;

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const categoriaService = {
  listar: async (): Promise<Categoria[]> => {
    try {
      const response = await api.get<Categoria[]>('/categorias');
      return response.data;
    } catch (error: unknown) {
      console.error('Erro ao listar categorias:', error);
      let errorMessage = 'Não foi possível carregar as categorias.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  criar: async (categoria: CategoriaData): Promise<Categoria> => {
    try {
      const response = await api.post<Categoria>('/categorias', categoria);
      return response.data;
    } catch (error: unknown) {
      console.error('Erro ao criar categoria:', error);
      let errorMessage = 'Não foi possível criar a categoria.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  atualizar: async (id: number, categoria: CategoriaData): Promise<Categoria> => {
    try {
      const response = await api.put<Categoria>(`/categorias/${id}`, categoria);
      return response.data;
    } catch (error: unknown) {
      console.error(`Erro ao atualizar categoria ${id}:`, error);
      let errorMessage = 'Não foi possível atualizar a categoria.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  desativar: async (id: number): Promise<void> => {
    try {
      await api.put(`/categorias/${id}/desativar`);
    } catch (error: unknown) {
      console.error(`Erro ao desativar categoria ${id}:`, error);
      let errorMessage = 'Não foi possível desativar a categoria.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        if (axiosError.response?.status === 409) {
          errorMessage = axiosError.response?.data?.message || errorMessage;
        } else {
          errorMessage = axiosError.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      } if (errorMessage.toLowerCase().includes('associada a produtos')) {
        throw new Error('Não é possível excluir: Categoria está associada a produtos.');
      }
      throw new Error(errorMessage);
    }
  }
};