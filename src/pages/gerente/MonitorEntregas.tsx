import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { useEntregas } from '../../hooks/useEntregas';
import { Entrega, Usuario } from '../../types';
import { formatCurrency} from '../../utils/apiHelpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Truck, Box, DollarSign, ChevronDown, ChevronUp, MapPin, User, AlertCircle } from 'lucide-react';

interface EntregadorAgrupado {
    entregador: Usuario;
    entregas: Entrega[];
    valorTotal: number;
}

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-indigo-600">
                {icon}
            </div>
            <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
        </div>
    </div>
);

// Componente para o Item do Acordeão 
const EntregadorItem: React.FC<{ data: EntregadorAgrupado }> = ({ data }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
                <div className="flex items-center">
                    <User className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />
                    <div>
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{data.entregador.nomeCompleto}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {data.entregas.length} entregas em andamento
                        </p>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-200 mr-4">{formatCurrency(data.valorTotal)}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </div>
            </button>

            {isOpen && (
                <div className="border-t dark:border-gray-700 p-4 space-y-3">
                    {data.entregas.map(entrega => (
                        <div key={entrega.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-blue-600 dark:text-blue-400">Pedido #{entrega.venda?.id}</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(entrega.venda?.valorTotal || 0)}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Cliente: {entrega.venda?.cliente?.nomeCompleto || 'N/A'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-start">
                                <MapPin className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" />
                                {entrega.venda?.enderecoEntrega ?
                                    `${entrega.venda.enderecoEntrega.rua}, ${entrega.venda.enderecoEntrega.numero}` :
                                    'Endereço não disponível'
                                }
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const MonitorEntregas: React.FC = () => {
    const { entregas, loading, error } = useEntregas({ status: 'EM_ROTA' });

    const entregadoresEmRota = useMemo(() => {
        const groups = new Map<number, EntregadorAgrupado>();

        entregas.forEach(entrega => {
            if (!entrega.entregador) return;

            const id = entrega.entregador.id;

            if (!groups.has(id)) {
                groups.set(id, {
                    entregador: entrega.entregador,
                    entregas: [],
                    valorTotal: 0
                });
            }

            const group = groups.get(id)!;
            group.entregas.push(entrega);
            group.valorTotal += entrega.venda?.valorTotal || 0;
        });

        return Array.from(groups.values());
    }, [entregas]);

    const totalEntregadores = entregadoresEmRota.length;
    const totalEntregas = entregas.length;
    const valorTotalEmRota = useMemo(() => {
        return entregas.reduce((acc, e) => acc + (e.venda?.valorTotal || 0), 0);
    }, [entregas]);

    return (
        <Layout title="Monitor de Entregas">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                    <Truck className="w-6 h-6 mr-2 text-indigo-600" />
                    Monitor de Entregas em Rota
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <KpiCard
                    title="Entregadores em Rota"
                    value={loading ? '...' : totalEntregadores}
                    icon={<Truck className="h-6 w-6" />}
                />
                <KpiCard
                    title="Entregas em Andamento"
                    value={loading ? '...' : totalEntregas}
                    icon={<Box className="h-6 w-6" />}
                />
                <KpiCard
                    title="Valor Total em Rota"
                    value={loading ? '...' : formatCurrency(valorTotalEmRota)}
                    icon={<DollarSign className="h-6 w-6" />}
                />
            </div>

            <div className="space-y-4">
                {loading && (
                    <LoadingSpinner text="Buscando entregas em andamento..." />
                )}
                {error && !loading && (
                    <div className="text-center p-6 text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/20 rounded-lg">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        <p className="font-semibold">Erro ao carregar dados</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {!loading && !error && entregadoresEmRota.length === 0 && (
                    <p className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhum entregador em rota no momento.</p>
                )}
                {!loading && !error && entregadoresEmRota.map(group => (
                    <EntregadorItem key={group.entregador.id} data={group} />
                ))}
            </div>

        </Layout>
    );
};

export default MonitorEntregas;