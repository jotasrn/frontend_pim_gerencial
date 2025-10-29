import api from './api';
import { Produto, FiltrosProdutos } from '../types';
import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const produtoService = {
  listar: async (filtros: FiltrosProdutos = {}): Promise<Produto[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros.nome) params.append('nome', filtros.nome);
      if (filtros.categoriaId !== undefined && filtros.categoriaId !== null) {
        params.append('categoriaId', String(filtros.categoriaId));
      }
      if (filtros.ativo !== undefined) {
        params.append('ativo', String(filtros.ativo));
      }
      const queryString = params.toString();
      const endpoint = '/produtos';
      const response = await api.get<Produto[]>(`${endpoint}${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Erro ao listar produtos:', error);
      let errorMessage = 'Não foi possível carregar os produtos.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  criar: async (formData: FormData): Promise<Produto> => {
    try {
      const response = await api.post<Produto>('/produtos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Erro ao criar produto:', error);
      let errorMessage = 'Não foi possível criar o produto.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  atualizar: async (id: number, formData: FormData): Promise<Produto> => {
    try {
      const response = await api.put<Produto>(`/produtos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      console.error(`Erro ao atualizar produto ${id}:`, error);
      let errorMessage = 'Não foi possível atualizar o produto.';
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
      await api.put(`/produtos/${id}/desativar`);
    } catch (error: unknown) {
      console.error(`Erro ao desativar produto ${id}:`, error);
      let errorMessage = 'Não foi possível desativar o produto.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  }
};