import api from './api';
import { Entrega, FiltrosEntregas, EntregaStatusUpdate } from '../types';
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

export const entregaService = {
  listar: async (filtros: FiltrosEntregas = {}): Promise<Entrega[]> => {
    try {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      const response = await api.get<Entrega[]>(`/entregas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível carregar as entregas.'));
    }
  },

  listarMinhasEntregas: async (): Promise<Entrega[]> => {
    try {
      const response = await api.get<Entrega[]>('/entregas/minhas-entregas');
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível carregar suas entregas.'));
    }
  },

  listarMeuHistorico: async (): Promise<Entrega[]> => {
    try {
      const response = await api.get<Entrega[]>('/entregas/meu-historico');
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível carregar seu histórico de entregas.'));
    }
  },

  buscarPorId: async (id: number): Promise<Entrega> => {
    try {
      const response = await api.get<Entrega>(`/entregas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível encontrar a entrega.'));
    }
  },

  atualizarStatus: async (entregaId: number, data: EntregaStatusUpdate): Promise<Entrega> => {
    try {
      const response = await api.put<Entrega>(`/entregas/${entregaId}/status`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível atualizar o status da entrega.'));
    }
  },

  associarEntregador: async (entregaId: number, entregadorId: number): Promise<Entrega> => {
    try {
      const response = await api.put<Entrega>(`/entregas/${entregaId}/associar`, { entregadorId });
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível associar o entregador.'));
    }
  },
};