import React, { useMemo } from 'react';
import { X, Truck, Mail, Phone, FileText, Package } from 'lucide-react';
import { Fornecedor, Produto } from '../../types';
import { formatCurrency } from '../../utils/apiHelpers';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    fornecedor: Fornecedor | null;
    produtos: Produto[];
}

const FornecedorDetailsModal: React.FC<ModalProps> = ({ isOpen, onClose, fornecedor, produtos }) => {

    const associatedProducts = useMemo(() => {
        if (!fornecedor) return [];
        return produtos.filter(produto =>
            produto.fornecedores?.some(f => f.id === fornecedor.id)
        );
    }, [fornecedor, produtos]);

    if (!isOpen || !fornecedor) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Truck className="w-5 h-5 text-cyan-600 mr-2" />
                        Detalhes do Fornecedor
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="space-y-4">
                        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">{fornecedor.nome}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <p className="flex items-center"><FileText className="w-4 h-4 mr-2 text-gray-400" />CNPJ: {fornecedor.cnpj || 'Não informado'}</p>
                            <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" />Telefone: {fornecedor.telefone || 'Não informado'}</p>
                            <p className="flex items-center sm:col-span-2"><Mail className="w-4 h-4 mr-2 text-gray-400" />Email: {fornecedor.email || 'Não informado'}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Produtos Associados ({associatedProducts.length})
                        </h4>
                        <div className="border rounded-lg dark:border-gray-700 max-h-60 overflow-y-auto">
                            {associatedProducts.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 p-4">Nenhum produto associado a este fornecedor.</p>
                            ) : (
                                <ul className="divide-y dark:divide-gray-700">
                                    {associatedProducts.map(produto => (
                                        <li key={produto.id} className="p-3 flex items-center justify-between">
                                            <div className="flex items-center">
                                                {produto.imagemUrl ? (
                                                    <img src={produto.imagemUrl} alt={produto.nome} className="w-10 h-10 rounded-full object-cover mr-3" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mr-3">
                                                        <Package size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{produto.nome}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Estoque: {produto.estoque?.quantidadeAtual ?? 0}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                {formatCurrency(produto.precoVenda)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 bg-gray-50 dark:bg-gray-700 p-4 border-t dark:border-gray-600 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FornecedorDetailsModal;