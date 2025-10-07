import { useState, useEffect, useCallback } from 'react';
import { produtoService } from '../services/produtoService';

export const useProdutos = (filtrosIniciais = {}) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState(filtrosIniciais);

  // Carregar produtos
  const carregarProdutos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await produtoService.listar(filtros);
      if (resultado.success) {
        setProdutos(resultado.data);
      } else {
        setError(resultado.message);
      }
    } catch (err) {
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Criar produto
  const criarProduto = async (produto) => {
    setLoading(true);
    try {
      const resultado = await produtoService.criar(produto);
      if (resultado.success) {
        await carregarProdutos(); // Recarregar lista
        return resultado;
      } else {
        setError(resultado.message);
        return resultado;
      }
    } catch (err) {
      const errorResult = { success: false, message: 'Erro ao criar produto' };
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar produto
  const atualizarProduto = async (id, produto) => {
    setLoading(true);
    try {
      const resultado = await produtoService.atualizar(id, produto);
      if (resultado.success) {
        await carregarProdutos(); // Recarregar lista
        return resultado;
      } else {
        setError(resultado.message);
        return resultado;
      }
    } catch (err) {
      const errorResult = { success: false, message: 'Erro ao atualizar produto' };
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  // Remover produto
  const removerProduto = async (id) => {
    setLoading(true);
    try {
      const resultado = await produtoService.remover(id);
      if (resultado.success) {
        await carregarProdutos(); // Recarregar lista
        return resultado;
      } else {
        setError(resultado.message);
        return resultado;
      }
    } catch (err) {
      const errorResult = { success: false, message: 'Erro ao remover produto' };
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  // Buscar produto por ID
  const buscarProduto = async (id) => {
    setLoading(true);
    try {
      const resultado = await produtoService.buscarPorId(id);
      if (!resultado.success) {
        setError(resultado.message);
      }
      return resultado;
    } catch (err) {
      const errorResult = { success: false, message: 'Erro ao buscar produto' };
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar filtros
  const atualizarFiltros = (novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  // Carregar produtos quando os filtros mudarem
  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  return {
    produtos,
    loading,
    error,
    filtros,
    carregarProdutos,
    criarProduto,
    atualizarProduto,
    removerProduto,
    buscarProduto,
    atualizarFiltros,
    setError
  };
};