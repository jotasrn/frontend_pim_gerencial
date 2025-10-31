import { useState } from 'react';
import { estoqueService } from '../services/estoqueService';
import { showToast } from '../components/Toast';
import { Estoque } from '../types';

interface UseEstoqueReturn {
  isAddingStock: boolean;
  adicionarEstoque: (produtoId: number, quantidade: number) => Promise<Estoque | null>;
}

export const useEstoque = (): UseEstoqueReturn => {
  const [isAddingStock, setIsAddingStock] = useState(false);

  const adicionarEstoque = async (produtoId: number, quantidade: number): Promise<Estoque | null> => {
    setIsAddingStock(true);
    try {
      const estoqueAtualizado = await estoqueService.adicionarQuantidade(produtoId, quantidade);
      showToast.success('Estoque atualizado com sucesso!');
      return estoqueAtualizado;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      showToast.error(`Erro ao adicionar estoque: ${errorMessage}`);
      return null;
    } finally {
      setIsAddingStock(false);
    }
  };

  return {
    isAddingStock,
    adicionarEstoque,
  };
};