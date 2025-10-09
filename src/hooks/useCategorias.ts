import { useState, useEffect, useCallback } from 'react';
import { categoriaService } from '../services/categoriaService';
import { showToast } from '../components/Toast';
import { Categoria } from '../types'; 

interface UseCategoriasReturn {
  categorias: Categoria[];
  loading: boolean;
  error: string | null;
  carregarCategorias: () => void;
  criarCategoria: (categoria: Omit<Categoria, 'id'>) => Promise<boolean>;
  atualizarCategoria: (id: number, categoria: Omit<Categoria, 'id'>) => Promise<boolean>;
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
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const criarCategoria = async (categoria: Omit<Categoria, 'id'>): Promise<boolean> => {
    setLoading(true);
    try {
      await categoriaService.criar(categoria);
      await carregarCategorias();
      showToast.success('Categoria criada com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      showToast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const atualizarCategoria = async (id: number, categoria: Omit<Categoria, 'id'>): Promise<boolean> => {
    setLoading(true);
    try {
      await categoriaService.atualizar(id, categoria);
      await carregarCategorias();
      showToast.success('Categoria atualizada com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      showToast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removerCategoria = async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      await categoriaService.remover(id);
      await carregarCategorias();
      showToast.success('Categoria removida com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      showToast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
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