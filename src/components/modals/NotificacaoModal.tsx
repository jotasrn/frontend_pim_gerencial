import React from 'react';
import { useNotifications } from '../../contexts/NotificacaoContext';
import { X, Bell, AlertCircle, Archive, Clock, TrendingDown, MessageCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationIcon: React.FC<{ tipo: string }> = ({ tipo }) => {
    switch (tipo) {
        case 'PRODUTO_VENCIDO':
            return <AlertCircle className="w-5 h-5 text-red-500" />;
        case 'PERTO_VENCIMENTO':
            return <Clock className="w-5 h-5 text-blue-500" />;
        case 'ESTOQUE_BAIXO':
            return <Archive className="w-5 h-5 text-yellow-500" />;
        case 'PERDA_ALTA':
            return <TrendingDown className="w-5 h-5 text-red-700" />;

        case 'DUVIDA_PENDENTE':
            return <MessageCircle className="w-5 h-5 text-orange-500" />;
        case 'VENDA_RECORDE':
            return <TrendingUp className="w-5 h-5 text-green-600" />;

        default:
            return <Bell className="w-5 h-5 text-gray-500" />;
    }
};

const getTextColorClass = (tipo: string): string => {
    switch (tipo) {
        case 'PRODUTO_VENCIDO':
            return "text-red-600 dark:text-red-500";
        case 'PERTO_VENCIMENTO':
            return "text-blue-600 dark:text-blue-400";
        case 'ESTOQUE_BAIXO':
            return "text-yellow-600 dark:text-yellow-500";
        case 'PERDA_ALTA':
            return "text-red-700 dark:text-red-500";
        case 'DUVIDA_PENDENTE':
            return "text-orange-600 dark:text-orange-400";
        case 'VENDA_RECORDE':
            return "text-green-600 dark:text-green-400";

        default:
            return "text-gray-700 dark:text-gray-300";
    }
};

const NotificacaoModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const { notifications, totalNotifications, loading } = useNotifications();

    const handleLinkClick = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 p-4 pt-20">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                        Notificações ({totalNotifications})
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">Carregando...</p>
                    ) : totalNotifications === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhuma notificação no momento.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notif, index) => (
                                <li key={notif.id || index} className="p-3 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-md">
                                    <div className="flex-shrink-0 mt-1">
                                        <NotificationIcon tipo={notif.tipo} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-sm font-semibold ${getTextColorClass(notif.tipo)}`}>
                                                {notif.titulo}
                                            </span>
                                            <Link
                                                to={notif.link || '#'}
                                                onClick={handleLinkClick}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-2 flex-shrink-0"
                                            >
                                                Ver
                                            </Link>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{notif.mensagem}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificacaoModal;