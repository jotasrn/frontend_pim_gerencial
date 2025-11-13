import api from './api';
import { AxiosError } from 'axios';

// Interface para a resposta do QR Code
interface QrCodeResponse {
  qrCodeUri: string;
  secret: string; // Importante para a verificação
}

// Interface para a verificação
interface VerifyRequest {
  secret: string;
  code: string;
}

const handleError = (error: unknown, defaultMessage: string): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || defaultMessage;
  } else if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  return defaultMessage;
};

export const twoFactorAuthService = {
  // 1. Busca o QR Code da API
  gerarQrCode: async (): Promise<QrCodeResponse> => {
    try {
      const response = await api.post<QrCodeResponse>('/2fa/gerar-qrcode');
      return response.data;
    } catch (error) {
      throw new Error(handleError(error, 'Não foi possível gerar o QR Code.'));
    }
  },

  ativar2FA: async (data: VerifyRequest): Promise<void> => {
    try {
      await api.post('/2fa/ativar-2fa', data);
    } catch (error) {
      throw new Error(handleError(error, 'Código de verificação inválido.'));
    }
  },
};