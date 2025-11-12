import api from './api';
import { Promocao, FiltrosPromocoes } from '../types';
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

export const promocaoService = {
  listar: async (filtros: FiltrosPromocoes = {}): Promise<Promocao[]> => {
    try {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      const response = await api.get<Promocao[]>(`/promocoes${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível carregar as promoções.'));
    }
  },

  buscarPorId: async (id: number): Promise<Promocao> => {
    try {
      const response = await api.get<Promocao>(`/promocoes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível encontrar a promoção.'));
    }
  },

  criar: async (formData: FormData): Promise<Promocao> => {
    try {
      const response = await api.post<Promocao>('/promocoes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível criar a promoção.'));
    }
  },

  atualizar: async (id: number, formData: FormData): Promise<Promocao> => {
    try {
      const response = await api.put<Promocao>(`/promocoes/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível atualizar a promoção.'));
    }
  },

  desativar: async (id: number): Promise<void> => {
    try {
      await api.put(`/promocoes/${id}/desativar`);
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível desativar a promoção.'));
    }
  },

};