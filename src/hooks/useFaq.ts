import { useState, useEffect, useCallback } from 'react';
import { faqService } from '../services/faqService';
import { showToast } from '../components/Toast';
import { Faq } from '../types';

type FaqData = Omit<Faq, 'id' | 'createdAt' | 'updatedAt'>;

interface UseFaqReturn {
  faqs: Faq[];
  loading: boolean;
  error: string | null;
  carregarFaqs: () => void;
  criarFaq: (data: FaqData) => Promise<boolean>;
  atualizarFaq: (id: number, data: FaqData) => Promise<boolean>;
  removerFaq: (id: number) => Promise<boolean>;
}

export const useFaq = (): UseFaqReturn => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const carregarFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await faqService.listarTodos(); // Usa listarTodos (que usa /ativos por enquanto)
      setFaqs(dados);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao carregar FAQs: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const criarFaq = async (data: FaqData): Promise<boolean> => {
    setError(null);
    try {
      await faqService.criar(data);
      showToast.success('FAQ criado com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao criar FAQ: ${errorMessage}`);
      return false;
    }
  };

  const atualizarFaq = async (id: number, data: FaqData): Promise<boolean> => {
    setError(null);
    try {
      await faqService.atualizar(id, data);
      showToast.success('FAQ atualizado com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao atualizar FAQ: ${errorMessage}`);
      return false;
    }
  };

  const removerFaq = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await faqService.remover(id);
      showToast.success('FAQ removido com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao remover FAQ: ${errorMessage}`);
      return false;
    }
  };

  useEffect(() => {
    carregarFaqs();
  }, [carregarFaqs]);

  return {
    faqs,
    loading,
    error,
    carregarFaqs,
    criarFaq,
    atualizarFaq,
    removerFaq,
  };
};