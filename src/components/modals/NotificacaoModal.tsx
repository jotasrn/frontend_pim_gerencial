import React from 'react';
import { useNotifications } from '../../contexts/NotificacaoContext';
import { X, Bell, AlertCircle, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/apiHelpers';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const { expiredProducts, lowStockProducts, totalNotifications } = useNotifications();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-20">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Bell className="w-5 h-5 text-gray-500 mr-2" />
                        Notificações ({totalNotifications})
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {totalNotifications === 0 ? (
                        <p className="text-center text-gray-500 py-4">Nenhuma notificação no momento.</p>
                    ) : (
                        <div className="space-y-6">
                            {expiredProducts.length > 0 && (
                                <div>
                                    <h4 className="text-md font-semibold text-red-600 flex items-center mb-2">
                                        <AlertCircle className="w-5 h-5 mr-2" />
                                        Produtos Vencidos ({expiredProducts.length})
                                    </h4>
                                    <ul className="divide-y divide-gray-200 border rounded-md">
                                        {expiredProducts.map(produto => (
                                            <li key={produto.id} className="px-4 py-3 flex justify-between items-center">
                                                <div>
                                                    <span className="font-medium text-gray-900">{produto.nome}</span>
                                                    <span className="text-sm text-red-600 ml-2">(Vencido em: {produto.dataValidade ? formatDate(produto.dataValidade) : 'N/A'})</span>
                                                </div>
                                                <Link to="/estoquista/produtos" onClick={onClose} className="text-xs text-blue-600 hover:underline">Ver</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {lowStockProducts.length > 0 && (
                                <div>
                                    <h4 className="text-md font-semibold text-yellow-600 flex items-center mb-2">
                                        <Archive className="w-5 h-5 mr-2" />
                                        Estoque Baixo ({lowStockProducts.length})
                                    </h4>
                                    <ul className="divide-y divide-gray-200 border rounded-md">
                                        {lowStockProducts.map(produto => (
                                            <li key={produto.id} className="px-4 py-3 flex justify-between items-center">
                                                <div>
                                                    S <span className="font-medium text-gray-900">{produto.nome}</span>
                                                    <span className="text-sm text-gray-500 ml-2">(Restam: {produto.estoque?.quantidadeAtual ?? 0})</span>
                                                </div>
                                                <Link to="/estoquista/produtos" onClick={onClose} className="text-xs text-blue-600 hover:underline">Ver</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;