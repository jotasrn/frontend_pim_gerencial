import { useState, useEffect, useCallback } from 'react';
import { fornecedorService } from '../services/fornecedorService';
import { showToast } from '../components/Toast';
import { Fornecedor } from '../types';

type FornecedorData = Omit<Fornecedor, 'id'>;

interface UseFornecedoresReturn {
  fornecedores: Fornecedor[];
  loading: boolean;
  error: string | null;
  carregarFornecedores: () => void;
  criarFornecedor: (data: FornecedorData) => Promise<boolean>;
  atualizarFornecedor: (id: number, data: FornecedorData) => Promise<boolean>;
  removerFornecedor: (id: number) => Promise<boolean>;
}

export const useFornecedores = (): UseFornecedoresReturn => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const carregarFornecedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await fornecedorService.listar();
      setFornecedores(dados);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao carregar fornecedores: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const criarFornecedor = async (data: FornecedorData): Promise<boolean> => {
    setError(null);
    try {
      await fornecedorService.criar(data);
      showToast.success('Fornecedor criado com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao criar fornecedor: ${errorMessage}`);
      return false;
    }
  };

  const atualizarFornecedor = async (id: number, data: FornecedorData): Promise<boolean> => {
    setError(null);
    try {
      await fornecedorService.atualizar(id, data);
      showToast.success('Fornecedor atualizado com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao atualizar fornecedor: ${errorMessage}`);
      return false;
    }
  };

  const removerFornecedor = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await fornecedorService.desativar(id);
      showToast.success('Fornecedor desativado com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao desativar fornecedor: ${errorMessage}`);
      return false;
    }
  };

  useEffect(() => {
    carregarFornecedores();
  }, [carregarFornecedores]);

  return {
    fornecedores,
    loading,
    error,
    carregarFornecedores,
    criarFornecedor,
    atualizarFornecedor,
    removerFornecedor,
  };
};