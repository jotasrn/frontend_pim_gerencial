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
};