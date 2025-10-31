// src/services/api.ts
import axios from 'axios';

const publicPaths = [
  '/auth/login',
  '/auth/google-login',
  '/auth/solicitar-reset-senha',
  '/auth/resetar-senha',
  '/clientes/registrar'
];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isPublicPath = publicPaths.some(path => config.url?.endsWith(path));

    if (token && !isPublicPath) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isPublicPath) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {

      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        window.location.href = '/login';
      }
    }

    const errorMessage = error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Erro interno do servidor';

    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status
    });
  }
);

export default api;