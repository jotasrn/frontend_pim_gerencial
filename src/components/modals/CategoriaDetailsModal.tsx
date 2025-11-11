import React, { useMemo } from 'react';
import { X, Tag, Package, DollarSign, Archive } from 'lucide-react';
import { Categoria, Produto } from '../../types';
import { formatCurrency } from '../../utils/apiHelpers';
import { Link } from 'react-router-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoria: Categoria | null;
    produtos: Produto[];
}

const CategoriaDetailsModal: React.FC<ModalProps> = ({ isOpen, onClose, categoria, produtos }) => {

    const produtosDaCategoria = useMemo(() => {
        if (!categoria) return [];
        return produtos.filter(p => p.categoria?.id === categoria.id);
    }, [categoria, produtos]);

    if (!isOpen || !categoria) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Tag className="w-5 h-5 text-blue-600 mr-2" />
                        {categoria.nome}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Descrição</h4>
                        <p className="text-gray-800 dark:text-gray-200">{categoria.descricao || 'Esta categoria não possui descrição.'}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Produtos nesta Categoria ({produtosDaCategoria.length})
                        </h4>
                        <div className="border rounded-lg dark:border-gray-700 max-h-64 overflow-y-auto">
                            {produtosDaCategoria.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 p-4">Nenhum produto associado.</p>
                            ) : (
                                <ul className="divide-y dark:divide-gray-700">
                                    {produtosDaCategoria.map(p => (
                                        <li key={p.id} className="p-3 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {p.imagemUrl ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={p.imagemUrl} alt={p.nome} />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.nome}</p>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                                                        <span className="flex items-center"><DollarSign className="w-3 h-3 mr-0.5" /> {formatCurrency(p.precoVenda)}</span>
                                                        <span className="flex items-center"><Archive className="w-3 h-3 mr-0.5" /> {p.estoque?.quantidadeAtual ?? 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link to="/estoquista/produtos" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Ver</Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900 p-4 border-t dark:border-gray-700 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoriaDetailsModal;