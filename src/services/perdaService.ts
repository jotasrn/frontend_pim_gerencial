import api from './api';
import { Perda, PerdaData, FiltrosPerdas } from '../types';
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

export const perdaService = {
  registrar: async (perda: PerdaData): Promise<Perda> => {
    try {
      const response = await api.post<Perda>('/perdas', perda);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível registrar a perda.'));
    }
  },

  listar: async (filtros: FiltrosPerdas = {}): Promise<Perda[]> => {
    try {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      const response = await api.get<Perda[]>(`/perdas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível carregar os registros de perdas.'));
    }
  },

  buscarPorId: async (id: number): Promise<Perda> => {
    try {
      const response = await api.get<Perda>(`/perdas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível encontrar o registro de perda.'));
    }
  }
};