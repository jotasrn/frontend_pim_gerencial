import { useState, useEffect, useCallback } from 'react';
import { categoriaService } from '../services/categoriaService';

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar categorias
  const carregarCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await categoriaService.listar();
      if (resultado.success) {
        setCategorias(resultado.data);
      } else {
        setError(resultado.message);
      }
    } catch (err) {
      setError('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar categoria
  const criarCategoria = async (categoria) => {
    setLoading(true);
    try {
      const resultado = await categoriaService.criar(categoria);
      if (resultado.success) {
        await carregarCategorias(); // Recarregar lista
        return resultado;
      } else {
        setError(resultado.message);
        return resultado;
      }
    } catch (err) {
      const errorResult = { success: false, message: 'Erro ao criar categoria' };
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar categoria
  const atualizarCategoria = async (id, categoria) => {
    setLoading(true);
    try {
      const resultado = await categoriaService.atualizar(id, categoria);
      if (resultado.success) {
        await carregarCategorias(); // Recarregar lista
        return resultado;
      } else {
        setError(resultado.message);
        return resultado;
      }
    } catch (err) {
      const errorResult = { success: false, message: 'Erro ao atualizar categoria' };
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  // Remover categoria
  const removerCategoria = async (id) => {
    setLoading(true);
    try {
      const resultado = await categoriaService.remover(id);
      if (resultado.success) {
        await carregarCategorias(); // Recarregar lista
        return resultado;
      } else {
        setError(resultado.message);
        return resultado;
      }
    } catch (err) {
      const errorResult = { success: false, message: 'Erro ao remover categoria' };
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  // Buscar categoria por ID
  const buscarCategoria = async (id) => {
    setLoading(true);
    try {
      const resultado = await categoriaService.buscarPorId(id);
      if (!resultado.success) {
        setError(resultado.message);
      }
      return resultado;
    } catch (err) {
      const errorResult = { success: false, message: 'Erro ao buscar categoria' };
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  // Carregar categorias na inicialização
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
    buscarCategoria,
    setError
  };
};