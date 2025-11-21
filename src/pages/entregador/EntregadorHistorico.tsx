import React from 'react';
import Layout from '../../components/Layout';
import { Archive, AlertCircle, MapPin, Calendar } from 'lucide-react';
import { useMeuHistorico } from '../../hooks/useMeuHistorico';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/apiHelpers';

const HistoricoEntregador: React.FC = () => {
    const { historico, loading, error } = useMeuHistorico();

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ENTREGUE':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'CANCELADO':
            case 'PROBLEMA':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    return (
        <Layout title="Histórico de Entregas">
            <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                    <Archive className="w-6 h-6 mr-2 text-gray-600 dark:text-gray-400" />
                    Meu Histórico
                </h1>
                {!loading && !error && (
                    <div className="flex items-center text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full shadow-sm">
                        Total de Registros:
                        <span className="ml-1.5 font-bold text-base">{historico.length}</span>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Entregas Concluídas e Canceladas</h2>
                </div>

                {loading && (
                    <LoadingSpinner text="Carregando histórico..." />
                )}

                {!loading && error && (
                    <div className="text-center p-6 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        <p>Erro ao carregar histórico: {error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {historico.length === 0 ? (
                            <p className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhum registro no seu histórico.</p>
                        ) : (
                            historico.map((entrega) => (
                                <Link
                                    to={`/entregador/entrega/${entrega.id}`}
                                    key={entrega.id}
                                    className="block p-4 sm:p-6 opacity-90 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-1">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(entrega.status)}`}>
                                                    {entrega.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Pedido #{entrega.venda?.id ?? 'N/A'}
                                                </p>
                                                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    <span>
                                                        {entrega.venda?.enderecoEntrega?.rua ?? 'Endereço'}, {entrega.venda?.enderecoEntrega?.numero ?? 'S/N'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 sm:text-right w-full sm:w-auto justify-end">
                                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <span>
                                                {entrega.dataConclusao ? formatDateTime(entrega.dataConclusao) : 'Data indisponível'}
                                            </span>
                                        </div>

                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default HistoricoEntregador;