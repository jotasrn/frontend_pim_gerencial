import React, { createContext, useContext, useState } from 'react';

// Context para gerenciar estado global da API
const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi deve ser usado dentro de um ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para mostrar notificações de sucesso
  const showSuccess = (message) => {
    // Aqui você pode integrar com uma biblioteca de toast/notificação
    console.log('✅ Sucesso:', message);
    // Exemplo: toast.success(message);
  };

  // Função para mostrar notificações de erro
  const showError = (message) => {
    setError(message);
    // Aqui você pode integrar com uma biblioteca de toast/notificação
    console.error('❌ Erro:', message);
    // Exemplo: toast.error(message);
  };

  // Função para limpar erros
  const clearError = () => {
    setError(null);
  };

  // Wrapper para chamadas de API com loading global
  const apiCall = async (apiFunction, showSuccessMessage = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      
      if (result.success) {
        if (showSuccessMessage && result.message) {
          showSuccess(result.message);
        }
      } else {
        showError(result.message);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro interno do servidor';
      showError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    error,
    showSuccess,
    showError,
    clearError,
    apiCall
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};