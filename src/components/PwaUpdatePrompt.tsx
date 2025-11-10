import React, { useCallback, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download } from 'lucide-react';
import { showToast } from './Toast';

const PwaUpdatePrompt: React.FC = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('Service Worker registrado com sucesso:', r);
        },
        onRegisterError(error) {
            console.error('Erro no registro do Service Worker:', error);
        },
    });

    const close = useCallback(() => {
        setOfflineReady(false);
        setNeedRefresh(false);
    }, [setOfflineReady, setNeedRefresh]);

    useEffect(() => {
        if (offlineReady) {
            showToast.success('Aplicativo pronto para funcionar offline!');
            close();
        }
    }, [offlineReady, close]);

    if (!needRefresh) {
        return null;
    }

    return (
        <div
            className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-xl bg-white dark:bg-gray-800 border dark:border-gray-700"
            role="alert"
        >
            <div className="flex items-center">
                <div className="mr-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Nova Versão Disponível!</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Recarregue para aplicar as atualizações.</p>
                </div>
                <button
                    onClick={() => updateServiceWorker(true)}
                    className="ml-4 flex items-center px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 shadow-sm"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Atualizar
                </button>
            </div>
        </div>
    );
};

export default PwaUpdatePrompt;