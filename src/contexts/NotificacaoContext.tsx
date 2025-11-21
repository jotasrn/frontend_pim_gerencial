import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { NotificationDTO } from '../types';
import { relatorioService } from '../services/relatorioService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    notifications: NotificationDTO[];
    totalNotifications: number;
    refetchNotifications: () => void;
    loading: boolean;
}

const NotificacaoContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
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
                let dados = await relatorioService.getNotificacoes();


                if (usuario.permissao === 'gerente') {
                    dados = dados.filter(notif =>
                        notif.tipo === 'PERDA_ALTA' ||
                        notif.tipo === 'DUVIDA_PENDENTE' ||
                        notif.tipo === 'VENDA_RECORDE'
                    );
                } else if (usuario.permissao === 'estoquista') {
                    dados = dados.filter(notif =>
                        notif.tipo === 'ESTOQUE_BAIXO' ||
                        notif.tipo === 'PRODUTO_VENCIDO' ||
                        notif.tipo === 'PERTO_VENCIMENTO' ||
                        notif.tipo === 'PERDA_ALTA'
                    );
                }

                setNotifications(dados);
            } catch (error) {
                console.error("Erro ao buscar notificações:", error);
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        } else {
            setNotifications([]);
            setLoading(false);
        }
    }, [usuario, hasAdminRole, authCarregando]);

    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const totalNotifications = useMemo(() => {
        return notifications.length;
    }, [notifications]);

    return (
        <NotificacaoContext.Provider value={{
            notifications,
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