import api from './api';
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

interface SugestaoResponse {
    sugestao: string;
}

export const iaService = {
    sugerirResposta: async (pergunta: string): Promise<SugestaoResponse> => {
        try {
            const response = await api.post<SugestaoResponse>('/ia/sugerir-resposta', { pergunta });
            return response.data;
        } catch (error) {
            throw new Error(handleError(error, 'Não foi possível gerar a sugestão da IA.'));
        }
    },
};