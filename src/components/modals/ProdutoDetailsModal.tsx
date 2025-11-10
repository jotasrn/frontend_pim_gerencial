import React from 'react';
import { X, Package, Calendar, Archive, Truck, Hash, Tag } from 'lucide-react';
import { Produto } from '../../types';
import { formatCurrency, formatDate } from '../../utils/apiHelpers';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    produto: Produto | null;
}

const ProdutoDetailsModal: React.FC<ModalProps> = ({ isOpen, onClose, produto }) => {
    if (!isOpen || !produto) return null;

    const fornecedores = produto.fornecedores || [];
    const estoque = produto.estoque;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Package className="w-5 h-5 text-green-600 mr-2" />
                        Detalhes do Produto
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">

                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-shrink-0 w-full sm:w-48 h-48">
                            {produto.imagemUrl ? (
                                <img src={produto.imagemUrl} alt={produto.nome} className="w-full h-full rounded-lg object-cover border dark:border-gray-700" />
                            ) : (
                                <div className="w-full h-full rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 border dark:border-gray-700">
                                    <Package size={64} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-3">
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{produto.nome}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {produto.descricao || 'Este produto não possui descrição.'}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Tag className="w-4 h-4 mr-2" />
                                Categoria: <strong className="text-gray-700 dark:text-gray-200 ml-1">{produto.categoria?.nome || 'N/A'}</strong>
                            </div>
                            <div className="pt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Preço de Custo: {formatCurrency(produto.precoCusto)}</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(produto.precoVenda)}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 border-t dark:border-gray-700 pt-4">
                            Informações de Estoque e Rastreio
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <p className="flex items-center"><Archive className="w-4 h-4 mr-2 text-gray-400" />Estoque: {estoque ? `${estoque.quantidadeAtual} (Min: ${estoque.quantidadeMinima ?? 0})` : 'N/A'}</p>
                            <p className="flex items-center"><Package className="w-4 h-4 mr-2 text-gray-400" />Medida: {produto.tipoMedida || 'N/A'}</p>
                            <p className="flex items-center"><Hash className="w-4 h-4 mr-2 text-gray-400" />Cód. Barras: {produto.codigoBarras || 'N/A'}</p>
                            <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400" />Colheita: {produto.dataColheita ? formatDate(produto.dataColheita) : 'N/A'}</p>
                            <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400" />Validade: {produto.dataValidade ? formatDate(produto.dataValidade) : 'N/A'}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2 border-t dark:border-gray-700 pt-4">
                            Fornecedores Associados ({fornecedores.length})
                        </h4>
                        <div className="border rounded-lg dark:border-gray-700 max-h-40 overflow-y-auto">
                            {fornecedores.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 p-4">Nenhum fornecedor associado.</p>
                            ) : (
                                <ul className="divide-y dark:divide-gray-700">
                                    {fornecedores.map(f => (
                                        <li key={f.id} className="p-3 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Truck className="w-5 h-5 text-cyan-600 mr-3" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{f.nome}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{f.cnpj || f.email}</p>
                                                </div>
                                            </div>
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

export default ProdutoDetailsModal;