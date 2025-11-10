import { useState, useEffect, useCallback } from 'react';
import { perdaService } from '../services/perdaService';
import { showToast } from '../components/Toast';
import { Perda, PerdaData, FiltrosPerdas } from '../types';

interface UsePerdasReturn {
    perdas: Perda[];
    loading: boolean;
    error: string | null;
    carregarPerdas: () => void;
    registrarPerda: (data: PerdaData) => Promise<boolean>;
}

const defaultFilters: FiltrosPerdas = {};

export const usePerdas = (filtrosIniciais: FiltrosPerdas = defaultFilters): UsePerdasReturn => {
    const [perdas, setPerdas] = useState<Perda[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const carregarPerdas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const dados = await perdaService.listar(filtrosIniciais);
            setPerdas(dados);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
            setError(errorMessage);
            showToast.error(`Erro ao carregar perdas: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [filtrosIniciais]);

    const registrarPerda = async (data: PerdaData): Promise<boolean> => {
        setError(null);
        try {
            await perdaService.registrar(data);
            showToast.success('Perda registrada com sucesso!');
            return true;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
            setError(errorMessage);
            showToast.error(`Erro ao registrar perda: ${errorMessage}`);
            return false;
        }
    };

    useEffect(() => {
        carregarPerdas();
    }, [carregarPerdas]);

    return {
        perdas,
        loading,
        error,
        carregarPerdas,
        registrarPerda,
    };
};