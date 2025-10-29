import api from './api';
import { Usuario, UsuarioData } from '../types';
import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const usuarioService = {
  listar: async (): Promise<Usuario[]> => {
    try {
      const response = await api.get<Usuario[]>('/usuarios');
      return response.data;
    } catch (error: unknown) {
      console.error('Erro ao listar usuários:', error);
      let errorMessage = 'Não foi possível carregar os usuários.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  criar: async (usuario: UsuarioData): Promise<Usuario> => {
    try {
      const response = await api.post<Usuario>('/usuarios', usuario);
      return response.data;
    } catch (error: unknown) {
      console.error('Erro ao criar usuário:', error);
      let errorMessage = 'Não foi possível criar o usuário.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  atualizar: async (id: number, usuario: Partial<UsuarioData>): Promise<Usuario> => {
    try {
      const response = await api.put<Usuario>(`/usuarios/${id}`, usuario);
      return response.data;
    } catch (error: unknown) {
      console.error(`Erro ao atualizar usuário ${id}:`, error);
      let errorMessage = 'Não foi possível atualizar o usuário.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  remover: async (id: number): Promise<void> => {
    try {
      await api.delete(`/usuarios/${id}`);
    } catch (error: unknown) {
      console.error(`Erro ao remover usuário ${id}:`, error);
      let errorMessage = 'Não foi possível remover o usuário.';
       if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
       errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },
};