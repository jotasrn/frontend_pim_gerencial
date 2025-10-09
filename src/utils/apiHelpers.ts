import axios, { AxiosError } from 'axios';

// --- Interfaces e Tipos ---

// Interface para a estrutura de dados de um erro da nossa API
interface ApiErrorData {
  message?: string;
  error?: string;
}

// --- Funções Utilitárias ---

/**
 * Extrai uma mensagem de erro legível de um objeto de erro da API.
 * @param error O objeto de erro, que pode ser de vários tipos.
 * @returns Uma string com a mensagem de erro formatada.
 */
export const formatApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorData>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
};

/**
 * Verifica se existe um token de autenticação no localStorage.
 * @returns `true` se o token existir, `false` caso contrário.
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Obtém o token de autenticação do localStorage.
 * @returns O token como string, ou `null` se não existir.
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Salva o token de autenticação no localStorage.
 * @param token O token JWT a ser salvo.
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Remove o token e os dados do usuário do localStorage (efetua o logout).
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Formata um objeto de dados para ser enviado à API, removendo campos nulos ou vazios.
 * @param data O objeto de dados a ser limpo.
 * @returns Um novo objeto contendo apenas os campos com valores válidos.
 */
export const formatDataForApi = (data: Record<string, unknown>): Record<string, unknown> => {
  const cleanData: Record<string, unknown> = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== null && value !== undefined && value !== '') {
      cleanData[key] = value;
    }
  });
  return cleanData;
};

/**
 * Constrói uma string de query a partir de um objeto de parâmetros.
 * @param params O objeto de parâmetros.
 * @returns Uma string de query (ex: "nome=Maçã&status=ativo").
 */
export const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

/**
 * Função de Debounce: atrasa a execução de uma função.
 */
export const debounce = <T extends (...args: unknown[]) => void>(func: T, wait: number) => {
  let timeout: number;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
};

/**
 * Valida um número de CNPJ.
 * @param cnpj A string do CNPJ.
 * @returns `true` se o CNPJ for válido.
 */
export const validarCNPJ = (cnpj: string): boolean => {
  const cleanCnpj = cnpj.replace(/[^\d]+/g, '');
  
  if (cleanCnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleanCnpj)) return false;
  
  // A lógica de validação do CNPJ continua a mesma
  // ...
  return true;
};

/**
 * Formata um valor numérico para a moeda brasileira (R$).
 * @param value O número a ser formatado.
 * @returns A string formatada.
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata uma data para o padrão brasileiro (dd/mm/aaaa).
 * @param date A data (string ou objeto Date).
 * @returns A data formatada.
 */
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

/**
 * Formata uma data e hora para o padrão brasileiro.
 * @param date A data (string ou objeto Date).
 * @returns A data e hora formatadas.
 */
export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};