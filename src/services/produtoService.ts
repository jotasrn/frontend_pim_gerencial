import api from './api';

import { Produto, ProdutoData, FiltrosProdutos } from '../types';

export const produtoService = {
  listar: async (filtros: FiltrosProdutos = {}): Promise<Produto[]> => {
    try {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      const response = await api.get<Produto[]>(`/produtos${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw new Error('Não foi possível carregar os produtos.');
    }
  },

  criar: async (produto: ProdutoData): Promise<Produto> => {
    try {
      const response = await api.post<Produto>('/produtos', produto);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw new Error('Não foi possível criar o produto.');
    }
  },

  atualizar: async (id: number, produto: ProdutoData): Promise<Produto> => {
    try {
      const response = await api.put<Produto>(`/produtos/${id}`, produto);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar produto ${id}:`, error);
      throw new Error('Não foi possível atualizar o produto.');
    }
  },

  remover: async (id: number): Promise<void> => {
    try {
      await api.delete(`/produtos/${id}`);
    } catch (error) {
      console.error(`Erro ao remover produto ${id}:`, error);
      throw new Error('Não foi possível remover o produto.');
    }
  }
};