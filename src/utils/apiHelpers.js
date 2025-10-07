// Utilitários para trabalhar com a API

// Formatar erros da API
export const formatApiError = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Erro interno do servidor';
};

// Verificar se o usuário está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Obter token do localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Salvar token no localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// Remover token do localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Formatar dados para envio na API
export const formatDataForApi = (data) => {
  // Remove campos vazios ou undefined
  const cleanData = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== null && value !== undefined && value !== '') {
      cleanData[key] = value;
    }
  });
  
  return cleanData;
};

// Converter query params para string
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};

// Debounce para pesquisas
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Validar CNPJ
export const validarCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  
  if (cnpj.length !== 14) return false;
  
  // Elimina CNPJs inválidos conhecidos
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Valida DVs
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
};

// Formatar moeda brasileira
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatar data brasileira
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

// Formatar data e hora brasileira
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};