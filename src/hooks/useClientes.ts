import { useState, useEffect, useCallback } from 'react';
import { clienteService } from '../services/clienteService';
import { showToast } from '../components/Toast';
import { Cliente } from '../types';

interface UseClientesReturn {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
}

export const useClientes = (): UseClientesReturn => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const carregarClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await clienteService.listar();
      setClientes(dados);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  return {
    clientes,
    loading,
    error,
  };
};