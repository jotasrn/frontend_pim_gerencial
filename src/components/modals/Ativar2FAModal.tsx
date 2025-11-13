import React, { useState, useEffect } from 'react';
import { X, Smartphone, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { twoFactorAuthService } from '../../services/twoFactorAuthService';
import { showToast } from '../Toast';
import { useAuth } from '../../contexts/AuthContext'; // Importar o useAuth

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Manage2FAModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const { usuario } = useAuth(); // Pegar o usuário logado
    const [isLoading, setIsLoading] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [authCode, setAuthCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Busca o QR Code quando o modal abre
    useEffect(() => {
        if (isOpen && !usuario?.is2faEnabled) {
            const gerarQrCode = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await twoFactorAuthService.gerarQrCode();
                    setQrCodeUri(response.qrCodeUri);
                    setSecret(response.secret);
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
                    setError(msg);
                    showToast.error(msg);
                } finally {
                    setIsLoading(false);
                }
            };
            gerarQrCode();
        }
    }, [isOpen, usuario]);

    const handleAtivar = async () => {
        if (!secret || authCode.length !== 6) {
            setError("O código deve ter 6 dígitos.");
            return;
        }

        setIsActivating(true);
        setError(null);

        try {
            await twoFactorAuthService.ativar2FA({ secret, code: authCode });
            showToast.success("2FA ativado com sucesso! Faça login novamente.");
            // (Opcional: deslogar o usuário para forçar o login com 2FA)
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(msg);
            showToast.error(msg);
        } finally {
            setIsActivating(false);
        }
    };

    // Limpa o estado ao fechar
    const handleClose = () => {
        setQrCodeUri(null);
        setSecret(null);
        setAuthCode('');
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Smartphone className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                        Autenticação de 2 Fatores (2FA)
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {usuario?.is2faEnabled ? (
                        <div className="text-center text-green-600 dark:text-green-400">
                            <ShieldCheck className="w-12 h-12 mx-auto mb-2" />
                            <p className="font-semibold">2FA já está ativo na sua conta.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Para ativar, escaneie o QR Code com seu app autenticador (Google Authenticator, etc).
                            </p>

                            <div className="flex items-center justify-center bg-white p-4 rounded-md h-48">
                                {isLoading && <LoadingSpinner text="Gerando QR Code..." />}
                                {error && !isLoading && <p className="text-red-500 text-sm">{error}</p>}
                                {qrCodeUri && !isLoading && (
                                    <img src={qrCodeUri} alt="QR Code 2FA" className="h-full w-auto" />
                                )}
                            </div>

                            <div>
                                <label htmlFor="authCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código de Verificação</label>
                                <input
                                    id="authCode"
                                    type="text"
                                    value={authCode}
                                    onChange={(e) => setAuthCode(e.target.value)}
                                    className={`input ${error ? 'input-error' : ''}`}
                                    placeholder="Digite o código de 6 dígitos"
                                    maxLength={6}
                                    disabled={isLoading}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={handleClose} className="btn btn-outline border-gray-300 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            Fechar
                        </button>
                        {!usuario?.is2faEnabled && (
                            <button
                                type="button"
                                onClick={handleAtivar}
                                disabled={isLoading || isActivating || !qrCodeUri}
                                className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                {isActivating ? (
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <ShieldCheck className="w-4 h-4" />
                                )}
                                {isActivating ? 'Ativando...' : 'Ativar'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Manage2FAModal;