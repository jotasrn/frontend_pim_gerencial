import api from './api';
import { Duvida, DuvidaResposta, DuvidaRespostaRequest } from '../types';
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

export const duvidaService = {
  listar: async (status: string = 'ABERTO'): Promise<Duvida[]> => {
    try {
      const endpoint = status === 'RESPONDIDO' ? '/duvidas/publicas' : '/duvidas/pendentes';
      const response = await api.get<Duvida[]>(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível carregar as dúvidas.'));
    }
  },

  listarPendentes: async (): Promise<Duvida[]> => {
    try {
      const response = await api.get<Duvida[]>('/duvidas/pendentes');
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível carregar as dúvidas pendentes.'));
    }
  },

  responderDuvida: async (id: number, respostaData: DuvidaRespostaRequest): Promise<DuvidaResposta> => {
    try {
      const response = await api.post<DuvidaResposta>(`/duvidas/${id}/responder`, respostaData);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível enviar a resposta.'));
    }
  },

  editar: async (id: number, respostaData: DuvidaRespostaRequest): Promise<DuvidaResposta> => {
    try {
      const response = await api.put<DuvidaResposta>(`/duvidas/${id}/resposta`, respostaData);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível editar a resposta.'));
    }
  },

  remover: async (id: number): Promise<void> => {
    try {
      await api.delete(`/duvidas/${id}`);
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível remover a dúvida.'));
    }
  },
};