import { useState, useEffect, useCallback, useRef } from 'react';
import { entregaService } from '../services/entregaService';
import { showToast } from '../components/Toast';
import { Entrega } from '../types';
import { sendNotification } from '../utils/notificationHelper';

interface UseMinhasEntregasReturn {
  entregas: Entrega[];
  loading: boolean;
  error: string | null;
  carregarEntregas: () => void;
}

export const useMinhasEntregas = (): UseMinhasEntregasReturn => {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const entregasRef = useRef<Entrega[]>([]);
  const isFirstLoad = useRef(true);

  const carregarEntregas = useCallback(async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true);
    setError(null);
    try {
      const dados = await entregaService.listarMinhasEntregas();
      
      if (!isFirstLoad.current) {
        const idsAntigos = entregasRef.current.map(e => e.id);
        const novasEntregas = dados.filter(d => !idsAntigos.includes(d.id));

        if (novasEntregas.length > 0) {
          const msg = novasEntregas.length === 1 
            ? `Nova entrega #${novasEntregas[0].venda?.id} disponível!`
            : `${novasEntregas.length} novas entregas disponíveis!`;
            
          showToast.info(msg);
          sendNotification('Nova Entrega Atribuída! 🛵', msg);
          
          try {
            const audio = new Audio('/notification.mp3'); 
            audio.play().catch(() => {});
          } catch {
             // Ignora erro caso o navegador bloqueie o áudio automático
          }
        }
      }

      setEntregas(dados);
      entregasRef.current = dados; 
      isFirstLoad.current = false;

    } catch (err: unknown) {
      if (!isAutoRefresh) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
        setError(errorMessage);
        showToast.error(`Erro ao carregar entregas: ${errorMessage}`);
      } else {
        console.error("Erro no auto-refresh de entregas:", err);
      }
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarEntregas();

    const intervalId = setInterval(() => {
      carregarEntregas(true); 
    }, 30000);

    return () => clearInterval(intervalId);
  }, [carregarEntregas]);

  return {
    entregas,
    loading,
    error,
    carregarEntregas,
  };
};