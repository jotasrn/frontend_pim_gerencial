import api from './api';
import { Usuario } from '../types';
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

export interface Entregador {
    id: number;
    usuario: Usuario;
    tipoVeiculo: string;
    placaVeiculo: string;
}

export interface EntregadorPerfilUpdateDTO {
    tipoVeiculo?: string;
    placaVeiculo?: string;
}

export interface EntregadorCadastroDTO {
    nomeCompleto: string;
    email: string;
    senha?: string;
    tipoVeiculo?: string;
    placa?: string;
}

export const entregadorService = {
    buscarMeuPerfil: async (): Promise<Entregador> => {
        try {
            const response = await api.get<Entregador>(`/entregadores/me`);
            return response.data;
        } catch (error) {
            throw new Error(handleError(error, 'Não foi possível buscar os dados do entregador.'));
        }
    },

    atualizarMeuPerfil: async (dados: EntregadorPerfilUpdateDTO): Promise<Entregador> => {
        try {
            const response = await api.put<Entregador>(`/entregadores/me`, dados);
            return response.data;
        } catch (error) {
            throw new Error(handleError(error, 'Não foi possível atualizar o perfil do entregador.'));
        }
    },

    buscarPorId: async (id: number): Promise<Entregador> => {
        try {
            const response = await api.get<Entregador>(`/entregadores/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(handleError(error, 'Não foi possível buscar os dados do entregador.'));
        }
    },

    atualizarEntregador: async (id: number, dados: EntregadorCadastroDTO): Promise<Entregador> => {
        try {
            const response = await api.put<Entregador>(`/entregadores/${id}`, dados);
            return response.data;
        } catch (error) {
            throw new Error(handleError(error, 'Não foi possível atualizar o entregador.'));
        }
    }
};