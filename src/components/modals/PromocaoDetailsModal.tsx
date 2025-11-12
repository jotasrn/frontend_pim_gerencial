import React, { useState, useEffect } from 'react';
import { X, Tag, Package, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Promocao, Produto } from '../../types';
import { promocaoService } from '../../services/promocaoService';
import { formatCurrency, formatDate } from '../../utils/apiHelpers';
import LoadingSpinner from '../LoadingSpinner';
import { Link } from 'react-router-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    promocaoId: number | null;
}

const PromotionDetailsModal: React.FC<ModalProps> = ({ isOpen, onClose, promocaoId }) => {
    const [promocao, setPromocao] = useState<Promocao | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPromocaoDetails = async (id: number) => {
            setLoading(true);
            setError(null);
            try {
                const data = await promocaoService.buscarPorId(id);
                setPromocao(data);
            } catch (err) {
                setError('Não foi possível carregar os detalhes da promoção.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && promocaoId) {
            fetchPromocaoDetails(promocaoId);
        } else {
            setPromocao(null);
        }
    }, [isOpen, promocaoId]);

    const produtosAssociados = promocao?.produtos || [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Tag className="w-5 h-5 text-purple-600 mr-2" />
                        Detalhes da Promoção
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {loading && <LoadingSpinner text="Carregando detalhes..." />}
                    {error && <p className="text-center text-red-500 dark:text-red-400">{error}</p>}

                    {promocao && !loading && !error && (
                        <>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-shrink-0 w-full sm:w-40 h-40">
                                    {promocao.imagemUrl ? (
                                        <img src={promocao.imagemUrl} alt={promocao.descricao} className="w-full h-full rounded-lg object-cover border dark:border-gray-700" />
                                    ) : (
                                        <div className="w-full h-full rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 border dark:border-gray-700">
                                            <Tag size={64} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{promocao.descricao}</h4>
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {promocao.percentualDesconto}% OFF
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        De: {formatDate(promocao.dataInicio)} Até: {formatDate(promocao.dataFim)}
                                    </div>
                                    <div className="flex items-center text-sm">
                                        {promocao.ativa ? (
                                            <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                                                <CheckCircle className="w-4 h-4 mr-1.5" /> Ativa
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-gray-500 dark:text-gray-400 font-medium">
                                                <XCircle className="w-4 h-4 mr-1.5" /> Encerrada
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2 border-t dark:border-gray-700 pt-4">
                                    Produtos Associados ({produtosAssociados.length})
                                </h4>
                                <div className="border rounded-lg dark:border-gray-700 max-h-64 overflow-y-auto">
                                    {produtosAssociados.length === 0 ? (
                                        <p className="text-center text-gray-500 dark:text-gray-400 p-4">Nenhum produto associado a esta promoção.</p>
                                    ) : (
                                        <ul className="divide-y dark:divide-gray-700">          
                                        {produtosAssociados.map((produto: Produto) => (
                                            <li key={produto.id} className="p-3 flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {produto.imagemUrl ? (
                                                            <img src={produto.imagemUrl} alt={produto.nome} className="h-10 w-10 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400">
                                                                <Package size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{produto.nome}</p>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(produto.precoVenda)}</span>
                                                    </div>
                                                </div>
                                                <Link to="/estoquista/produtos" onClick={onClose} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                                    Ver Produto
                                                </Link>
                                            </li>
                                        ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
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

export default PromotionDetailsModal;