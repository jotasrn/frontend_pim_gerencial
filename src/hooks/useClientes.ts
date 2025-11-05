import { useState, useEffect, useCallback } from 'react';
import { clienteService } from '../services/clienteService';
import { showToast } from '../components/Toast';
import { Cliente } from '../types';

interface UseClientesReturn {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  carregarClientes: () => void;
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao carregar clientes: ${errorMessage}`);
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
    carregarClientes,
  };
};