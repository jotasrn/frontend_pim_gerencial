import { useState, useEffect, useCallback } from 'react';
import { entregaService } from '../services/entregaService';
import { useAuth } from '../contexts/AuthContext';

export const useEntregas = (filtrosIniciais = {}) => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const { user } = useAuth();

  // Carregar entregas (diferente para gerente e entregador)
  const carregarEntregas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let resultado;
      
      if (user?.role === 'deliverer') {
        // Para entregadores, carregar apenas suas entregas
        resultado = await entregaService.listarMinhasEntregas();
      } else {
        // Para gerentes, carregar todas as entregas com filtros
        resultado = await entregaService.listar(filtros);
      }
      
      if (resultado.success) {
        setEntregas(resultado.data);
      } else {
        setError(resultado.message);
      }
    } catch (err) {
      setError('Erro ao carregar entregas');
    } finally {
      setLoading(false);
    }
  }, [filtros, user?.role]);

  // Associar entregador (apenas para gerentes)
  const associarEntregador = async (entregaId, entregadorId) => {
    if (user?.role !== 'manager') {
      return { success: false, message: 'Acesso negado' };
    }

    setLoading(true);
    try {
      const resultado = await entregaService.associarEntregador(entregaId, entregadorId);
      if (resultado.success) {
        await carregarEntregas(); // Recarregar lista
        return resultado;
      } else {
        setError(resultado.message);
        return resultado;
      }
    } catch (err) {
      const errorResult = { success: false, message: 'Erro ao associar entregador' };
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status da entrega (apenas para entregadores)
  const atualizarStatus = async (entregaId, status) => {
    if (user?.role !== 'deliverer') {
      return { success: false, message: 'Acesso negado' };
    }

    setLoading(true);
    try {
      const resultado = await entregaService.atualizarStatus(entregaId, status);
      if (resultado.success) {
        await carregarEntregas(); // Recarregar lista
        return resultado;
      } else {
        setError(resultado.message);
        return resultado;
      }
    } catch (err) {
      const errorResult = { success: false, message: 'Erro ao atualizar status' };
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  // Buscar entrega por ID
  const buscarEntrega = async (id) => {
    setLoading(true);
    try {
      const resultado = await entregaService.buscarPorId(id);
      if (!resultado.success) {
        setError(resultado.message);
      }
      return resultado;
    } catch (err) {
      const errorResult = { success: false, message: 'Erro ao buscar entrega' };
      setError(errorResult.message);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar filtros (apenas para gerentes)
  const atualizarFiltros = (novosFiltros) => {
    if (user?.role === 'manager') {
      setFiltros(prev => ({ ...prev, ...novosFiltros }));
    }
  };

  // Carregar entregas quando os filtros mudarem ou o usuário mudar
  useEffect(() => {
    if (user) {
      carregarEntregas();
    }
  }, [carregarEntregas, user]);

  return {
    entregas,
    loading,
    error,
    filtros,
    carregarEntregas,
    associarEntregador,
    atualizarStatus,
    buscarEntrega,
    atualizarFiltros,
    setError
  };
};