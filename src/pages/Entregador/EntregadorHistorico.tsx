import React from 'react';
import Layout from '../../components/Layout';
import { Archive, AlertCircle } from 'lucide-react';
import { useMeuHistorico } from '../../hooks/useMeuHistorico';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/apiHelpers';

const HistoricoEntregador: React.FC = () => {
    const { historico, loading, error } = useMeuHistorico();

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ENTREGUE':
                return 'bg-green-100 text-green-800';
            case 'CANCELADO':
            case 'PROBLEMA':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Layout title="Histórico de Entregas">
            <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
                    <Archive className="w-6 h-6 mr-2 text-gray-600" />
                    Meu Histórico
                </h1>
                {!loading && !error && (
                    <div className="flex items-center text-sm font-medium bg-gray-200 text-gray-700 px-3 py-1 rounded-full shadow-sm">
                        Total de Registros:
                        <span className="ml-1.5 font-bold text-base">{historico.length}</span>
                    </div>
                )}
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-medium text-gray-800">Entregas Concluídas e Canceladas</h2>
                </div>

                {loading && (
                    <LoadingSpinner text="Carregando histórico..." />
                )}

                {!loading && error && (
                    <div className="text-center p-6 text-red-600 bg-red-50">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        <p>Erro ao carregar histórico: {error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="divide-y divide-gray-200">
                        {historico.length === 0 ? (
                            <p className="text-center py-10 text-gray-500">Nenhum registro no seu histórico.</p>
                        ) : (
                            historico.map((entrega) => (
                                <Link
                                    to={`/entregador/entrega/${entrega.id}`}
                                    key={entrega.id}
                                    className="block p-4 sm:p-6 opacity-80 hover:opacity-100 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                        <div className="flex items-center mb-2 sm:mb-0">
                                            <div className="flex-shrink-0">
                                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusStyle(entrega.status)}`}>
                                                    {entrega.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-900">Pedido #{entrega.venda?.id ?? 'N/A'}</p>
                                                <p className="text-sm text-gray-500">{entrega.venda?.enderecoEntrega?.rua ?? 'Endereço'}, {entrega.venda?.enderecoEntrega?.numero ?? 'S/N'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center w-full sm:w-auto justify-end">
                                            <span className="text-sm text-gray-600">
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