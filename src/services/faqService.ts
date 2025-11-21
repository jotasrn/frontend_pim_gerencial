import api from './api';
import { Faq } from '../types';
import axios, { AxiosError } from 'axios';

type FaqData = Omit<Faq, 'id' | 'createdAt' | 'updatedAt'>;

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

export const faqService = {
  listarAtivos: async (): Promise<Faq[]> => {
    try {
      const response = await api.get<Faq[]>('/faq/ativos');
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível carregar os FAQs.'));
    }
  },

  listarTodos: async (): Promise<Faq[]> => {
    try {
      const response = await api.get<Faq[]>('/faq');
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível carregar os FAQs.'));
    }
  },

  criar: async (faqData: FaqData): Promise<Faq> => {
    try {
      const response = await api.post<Faq>('/faq', faqData);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível criar o FAQ.'));
    }
  },

  atualizar: async (id: number, faqData: FaqData): Promise<Faq> => {
    try {
      const response = await api.put<Faq>(`/faq/${id}`, faqData);
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível atualizar o FAQ.'));
    }
  },

  remover: async (id: number): Promise<void> => {
    try {
      await api.delete(`/faq/${id}`);
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível remover/inativar o FAQ.'));
    }
  }
};