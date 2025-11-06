import React from 'react';
import { X, Smartphone, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Manage2FAModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Smartphone className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                        Autenticação de 2 Fatores (2FA)
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Para ativar a autenticação de 2 fatores, escaneie o QR Code abaixo com seu aplicativo autenticador (Google Authenticator, Authy, etc).
                    </p>

                    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-4 rounded-md h-48">
                        <LoadingSpinner text="Gerando QR Code... (Simulação)" />
                    </div>

                    <div>
                        <label htmlFor="authCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código de Verificação</label>
                        <input
                            id="authCode" type="text"
                            className="input"
                            placeholder="Digite o código de 6 dígitos"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="btn btn-outline border-gray-300 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            Fechar
                        </button>
                        <button type="button" onClick={onClose} className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Ativar (Simulação)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Manage2FAModal;