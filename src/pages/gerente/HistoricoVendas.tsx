import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import { relatorioService } from '../../services/relatorioService';
import { Venda, FiltrosRelatorios } from '../../types';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/apiHelpers';
import { SalesLineChart } from '../../components/charts/SalesChart';
import { generateVendasReport } from '../../utils/reportGenerator';
import { showToast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, Download, AlertCircle, ShoppingCart, User, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    isLoading: boolean;
    isPercent?: boolean;
    growth?: number;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, isLoading, isPercent = false, growth = 0 }) => {
    const formattedValue = isPercent
        ? `${(value as number).toFixed(1)}%`
        : formatCurrency(value as number);

    const isPositive = growth > 0;
    const isNegative = growth < 0;
    const growthIcon = isPositive ? <TrendingUp size={16} /> : isNegative ? <TrendingDown size={16} /> : <Minus size={16} />;
    const growthColor = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-green-600">
                    {icon}
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                    {isLoading ? (
                        <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
                    ) : (
                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{formattedValue}</p>
                    )}
                </div>
                {isPercent && !isLoading && (
                    <div className={`flex items-center text-sm font-medium ${growthColor}`}>
                        {growthIcon}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- (HELPER) Funções de Data e Cálculo ---
const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    return {
        dataInicio: startDate.toISOString().split('T')[0],
        dataFim: endDate.toISOString().split('T')[0],
    };
};

const calcularCrescimento = (atual: number, anterior: number): number => {
    if (anterior === 0) {
        return atual > 0 ? 100.0 : 0.0;
    }
    return ((atual - anterior) / anterior) * 100;
};

const SalesHistory: React.FC = () => {
    const defaultDates = useMemo(() => getDefaultDateRange(), []);
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isReportLoading, setIsReportLoading] = useState(false);

    const [kpis, setKpis] = useState({ total: 0, crescimento: 0, isLoading: true });

    const [dataInicio, setDataInicio] = useState(defaultDates.dataInicio);
    const [dataFim, setDataFim] = useState(defaultDates.dataFim);

    const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosRelatorios>(defaultDates);

    useEffect(() => {
        const carregarVendasEComparar = async () => {
            setLoading(true);
            setKpis({ total: 0, crescimento: 0, isLoading: true });
            setError(null);

            try {
                const inicioAtual = new Date(filtrosAtivos.dataInicio + 'T00:00:00');
                const fimAtual = new Date(filtrosAtivos.dataFim + 'T23:59:59');
                const duracaoMs = fimAtual.getTime() - inicioAtual.getTime();

                const fimAnterior = new Date(inicioAtual.getTime() - (24 * 60 * 60 * 1000));
                const inicioAnterior = new Date(fimAnterior.getTime() - duracaoMs);

                const filtrosAnteriores = {
                    dataInicio: inicioAnterior.toISOString().split('T')[0],
                    dataFim: fimAnterior.toISOString().split('T')[0],
                };

                const [vendasAtuais, vendasAnteriores] = await Promise.all([
                    relatorioService.gerarRelatorioVendas(filtrosAtivos),
                    relatorioService.gerarRelatorioVendas(filtrosAnteriores)
                ]);

                const totalAtual = vendasAtuais.reduce((acc, v) => acc + v.valorTotal, 0);
                const totalAnterior = vendasAnteriores.reduce((acc, v) => acc + v.valorTotal, 0);
                const crescimento = calcularCrescimento(totalAtual, totalAnterior);

                setVendas(vendasAtuais);
                setKpis({ total: totalAtual, crescimento: crescimento, isLoading: false });

            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Erro desconhecido';
                setError(`Falha ao carregar histórico de vendas: ${msg}`);
                showToast.error(`Falha ao carregar histórico: ${msg}`);
                setKpis({ total: 0, crescimento: 0, isLoading: false });
            } finally {
                setLoading(false);
            }
        };

        carregarVendasEComparar();
    }, [filtrosAtivos]);

    const handleFiltrarClick = () => {
        setFiltrosAtivos({ dataInicio, dataFim });
    };

    // **** CORREÇÃO DA LÓGICA DE DOWNLOAD ****
    const handleDownloadReport = () => {
        setIsReportLoading(true);

        // 1. Usa os dados já filtrados (da variável 'vendas')
        if (vendas.length === 0) {
            showToast.info("Nenhuma venda encontrada no período selecionado para gerar o relatório.");
            setIsReportLoading(false);
            return;
        }

        try {
            // 2. Usa as datas do filtro para o nome do arquivo
            const periodo = `${formatDate(dataInicio)}_a_${formatDate(dataFim)}`;
            generateVendasReport(vendas, periodo);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro desconhecido';
            showToast.error(`Erro ao gerar relatório: ${msg}`);
        } finally {
            setIsReportLoading(false);
        }
    };
    // **** FIM DA CORREÇÃO ****

    const salesLineChartData = useMemo(() => {
        const salesByDate = new Map<string, number>();

        vendas.forEach(venda => {
            const date = formatDate(venda.dataHora);
            const total = salesByDate.get(date) || 0;
            salesByDate.set(date, total + venda.valorTotal);
        });

        const sortedSales = new Map([...salesByDate.entries()].sort((a, b) => {
            const [dayA, monthA, yearA] = a[0].split('/').map(Number);
            const [dayB, monthB, yearB] = b[0].split('/').map(Number);
            return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
        }));

        return {
            labels: Array.from(sortedSales.keys()),
            datasets: [{
                label: 'Vendas (R$)',
                data: Array.from(sortedSales.values()),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.1,
                fill: true
            }]
        };
    }, [vendas]);

    return (
        <Layout title="Histórico de Vendas">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                    <ShoppingCart className="w-6 h-6 mr-2 text-green-600" />
                    Histórico de Vendas
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <KpiCard
                    title="Valor Total de Vendas"
                    value={kpis.total}
                    icon={<DollarSign className="h-6 w-6" />}
                    isLoading={kpis.isLoading}
                />
                <KpiCard
                    title="Crescimento (vs. Período Ant.)"
                    value={kpis.crescimento}
                    icon={kpis.crescimento >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                    isLoading={kpis.isLoading}
                    isPercent={true}
                    growth={kpis.crescimento}
                />
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Início</label>
                        <input
                            type="date"
                            id="dataInicio"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                            className="input w-full"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Fim</label>
                        <input
                            type="date"
                            id="dataFim"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                            className="input w-full"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto pt-6">
                        <button
                            onClick={handleFiltrarClick}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm font-medium w-full sm:w-auto"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Filtrar
                        </button>
                        <button
                            onClick={handleDownloadReport}
                            disabled={isReportLoading}
                            className="bg-gray-600 text-white px-5 py-2.5 rounded-full flex items-center justify-center dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors shadow-sm font-medium w-full sm:w-auto"
                        >
                            {isReportLoading ? 'Gerando...' : <><Download className="w-4 h-4 mr-2" /> Baixar PDF do Período</>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                    Crescimento de Vendas no Período
                </h3>
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <LoadingSpinner text="Carregando gráfico..." />
                    </div>
                ) : salesLineChartData.labels.length > 0 ? (
                    <div className="aspect-[2/1] relative">
                        <SalesLineChart data={salesLineChartData} />
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-10">Sem dados de vendas para exibir no gráfico.</p>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                {error && !loading && (
                    <div className="text-center p-6 text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        <p className="font-semibold">Erro ao carregar vendas</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {loading && vendas.length === 0 ? (
                    <LoadingSpinner text="Carregando histórico..." />
                ) : vendas.length === 0 && !loading ? (
                    <p className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma venda encontrada para este período.</p>
                ) : (
                    <>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:hidden">
                            {vendas.map((venda) => (
                                <div key={venda.id} className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-blue-600 dark:text-blue-400">Pedido #{venda.id}</span>
                                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(venda.valorTotal)}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-2">
                                        <p className="flex items-center"><User className="w-4 h-4 mr-2" />{venda.cliente?.nomeCompleto || 'Cliente'}</p>
                                        <p className="flex items-center"><DollarSign className="w-4 h-4 mr-2" />{venda.formaPagamento}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${venda.statusPedido === 'CONCLUIDO' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                            venda.statusPedido === 'CANCELADO' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                            {venda.statusPedido?.replace('_', ' ').toLowerCase() || 'N/A'}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">{formatDateTime(venda.dataHora)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden lg:table">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pedido ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pagamento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {vendas.map((venda) => (
                                    <tr key={venda.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">#{venda.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDateTime(venda.dataHora)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">{venda.cliente?.nomeCompleto || 'Cliente'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{venda.formaPagamento}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${venda.statusPedido === 'CONCLUIDO' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                                    venda.statusPedido === 'CANCELADO' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                {venda.statusPedido?.replace('_', ' ').toLowerCase() || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(venda.valorTotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>

            {/* REMOVIDA A TAG <style> */}
        </Layout >
    );
};

export default SalesHistory;