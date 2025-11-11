import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Produto } from '../types';
import { produtoService } from '../services/produtoService';
import { useAuth } from './AuthContext';

const isExpired = (dateString?: string): boolean => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(dateString);
    return expiryDate <= today;
};

interface NotificationContextType {
    expiredProducts: Produto[];
    lowStockProducts: Produto[];
    totalNotifications: number;
    refetchNotifications: () => void;
    loading: boolean;
}

const NotificacaoContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [expiredProducts, setExpiredProducts] = useState<Produto[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const { usuario, carregando: authCarregando } = useAuth();

    const hasAdminRole = useMemo(() => {
        if (!usuario) return false;
        return usuario.permissao === 'gerente' || usuario.permissao === 'estoquista';
    }, [usuario]);

    const fetchNotifications = useCallback(async () => {
        if (authCarregando) {
            return;
        }

        if (usuario && hasAdminRole) {
            setLoading(true);
            try {
                const dados = await produtoService.listar({ status: 'all' });

                const expired: Produto[] = [];
                const lowStock: Produto[] = [];

                dados.forEach(p => {
                    const isLowStock = p.estoque && p.estoque.quantidadeAtual <= (p.estoque.quantidadeMinima ?? 10);
                    const hasExpired = isExpired(p.dataValidade);

                    if (hasExpired && p.ativo) {
                        expired.push(p);
                    }

                    if (isLowStock && p.ativo && !hasExpired) {
                        lowStock.push(p);
                    }
                });

                setExpiredProducts(expired);
                setLowStockProducts(lowStock);

            } catch (error) {
                console.error("Erro ao buscar notificações:", error);
            } finally {
                setLoading(false);
            }
        } else {
            setExpiredProducts([]);
            setLowStockProducts([]);
            setLoading(false);
        }
    }, [usuario, hasAdminRole, authCarregando]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const totalNotifications = useMemo(() => {
        return expiredProducts.length + lowStockProducts.length;
    }, [expiredProducts, lowStockProducts]);

    return (
        <NotificacaoContext.Provider value={{
            expiredProducts,
            lowStockProducts,
            totalNotifications,
            refetchNotifications: fetchNotifications,
            loading
        }}>
            {children}
        </NotificacaoContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificacaoContext);
    if (context === undefined) {
        throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
    }
    return context;
};