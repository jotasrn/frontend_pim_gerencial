import React, { useState } from 'react';
import { X, Lock, Save } from 'lucide-react';
import { showToast } from '../Toast';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
    });
    const [errors, setErrors] = useState<Partial<typeof formData>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Partial<typeof formData> = {};

        if (formData.novaSenha.length < 6) {
            newErrors.novaSenha = 'A nova senha deve ter no mínimo 6 caracteres.';
        }
        if (formData.novaSenha !== formData.confirmarSenha) {
            newErrors.confirmarSenha = 'As senhas não coincidem.';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            showToast.success('Senha alterada com sucesso! (Simulação)');
            onClose();
            setFormData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
            setErrors({});
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Lock className="w-5 h-5 text-gray-500 mr-2" />
                        Alterar Senha
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none" disabled={isLoading}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="senhaAtual" className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                        <input
                            id="senhaAtual" type="password" value={formData.senhaAtual}
                            onChange={(e) => setFormData(p => ({ ...p, senhaAtual: e.target.value }))}
                            className="input" disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                        <input
                            id="novaSenha" type="password" value={formData.novaSenha}
                            onChange={(e) => setFormData(p => ({ ...p, novaSenha: e.target.value }))}
                            className={`input ${errors.novaSenha ? 'input-error' : ''}`} disabled={isLoading}
                        />
                        {errors.novaSenha && <p className="text-red-500 text-xs mt-1">{errors.novaSenha}</p>}
                    </div>
                    <div>
                        <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                        <input
                            id="confirmarSenha" type="password" value={formData.confirmarSenha}
                            onChange={(e) => setFormData(p => ({ ...p, confirmarSenha: e.target.value }))}
                            className={`input ${errors.confirmarSenha ? 'input-error' : ''}`} disabled={isLoading}
                        />
                        {errors.confirmarSenha && <p className="text-red-500 text-xs mt-1">{errors.confirmarSenha}</p>}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="btn btn-outline border-gray-300" disabled={isLoading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2" disabled={isLoading}>
                            {isLoading ? (
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;