import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';
import { Produto } from '../types';

interface NotificationData {
    expiredProducts: Produto[];
    lowStockProducts: Produto[];
}

interface NotificationContextType extends NotificationData {
    totalNotifications: number;
    setNotificationData: (data: Partial<NotificationData>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<NotificationData>({
        expiredProducts: [],
        lowStockProducts: [],
    });

    const setNotificationData = useCallback((newData: Partial<NotificationData>) => {
        setData(prev => ({ ...prev, ...newData }));
    }, []);

    const totalNotifications = useMemo(() => {
        return data.expiredProducts.length + data.lowStockProducts.length;
    }, [data]);

    const value = {
        ...data,
        totalNotifications,
        setNotificationData,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
    }
    return context;
};