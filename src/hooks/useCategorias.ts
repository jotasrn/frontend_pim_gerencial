import { useState, useEffect, useCallback } from 'react';
import { categoriaService } from '../services/categoriaService';
import { showToast } from '../components/Toast';
import { Categoria } from '../types';

type CategoriaData = Omit<Categoria, 'id'>;

interface UseCategoriasReturn {
  categorias: Categoria[];
  loading: boolean;
  error: string | null;
  carregarCategorias: () => void;
  criarCategoria: (categoria: CategoriaData) => Promise<boolean>;
  atualizarCategoria: (id: number, categoria: CategoriaData) => Promise<boolean>;
  removerCategoria: (id: number) => Promise<boolean>;
}

export const useCategorias = (): UseCategoriasReturn => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const carregarCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await categoriaService.listar();
      setCategorias(dados);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao carregar categorias: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const criarCategoria = async (categoria: CategoriaData): Promise<boolean> => {
    setError(null);
    try {
      await categoriaService.criar(categoria);
      showToast.success('Categoria criada com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao criar categoria: ${errorMessage}`);
      return false;
    }
  };

  const atualizarCategoria = async (id: number, categoria: CategoriaData): Promise<boolean> => {
    setError(null);
    try {
      await categoriaService.atualizar(id, categoria);
      showToast.success('Categoria atualizada com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao atualizar categoria: ${errorMessage}`);
      return false;
    }
  };

  const removerCategoria = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await categoriaService.desativar(id);
      showToast.success('Categoria removida com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`${errorMessage}`);
      return false;
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  return {
    categorias,
    loading,
    error,
    carregarCategorias,
    criarCategoria,
    atualizarCategoria,
    removerCategoria,
  };
};