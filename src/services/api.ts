import axios, { AxiosError } from 'axios';
import { showToast } from '../components/Toast';

const publicPaths = [
  '/auth/login',
  '/auth/google-login',
  '/auth/solicitar-reset-senha',
  '/auth/resetar-senha',
  '/clientes/registrar',
  '/produtos',
  '/categorias',
  '/uploads/product-images',
  '/promocoes',
  '/newsletter/inscrever',
  '/newsletter/confirmar',
  '/duvidas',
  '/faq/ativos',
];

const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${baseUrl}/api`,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    const isPublicPath = publicPaths.some(path => config.url?.startsWith(path));

    if (token && !isPublicPath) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface ApiErrorData {
  message?: string;
  error?: string;
}

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorData>) => {
    if (error.response) {
      const { status } = error.response;

      if ((status === 401 || status === 403) && window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (error.config?.url !== '/auth/login') {
          showToast.error('Sessão expirada. Por favor, faça login novamente.');

          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      }
    }
    const errorMessage = error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Ocorreu um erro inesperado.';

    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status
    });
  }
);

export default api;