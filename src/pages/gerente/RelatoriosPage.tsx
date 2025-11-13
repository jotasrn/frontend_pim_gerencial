import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '../../components/Layout';
import { SalesLineChart, SalesByCategoryChart, TopProductsChart } from '../../components/charts/SalesChart';
import { StockGaugeChart } from '../../components/charts/StockChart';
import { LossByReasonChart } from '../../components/charts/LossChart';
import { ProductStatusChart } from '../../components/charts/ProdutosChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useRelatorios } from '../../hooks/useRelatorios';
import { formatDate } from '../../utils/apiHelpers';
import { generateDashboardExcelReport} from '../../utils/reportGenerator';
import { showToast } from '../../components/Toast';
import { Calendar, AlertCircle, BarChart2, RefreshCw, FileDown, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf'; 

const CHART_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6366F1', '#EC4899'];

const ChartCard: React.FC<{ title: string; children: React.ReactNode; hasData: boolean }> = ({ title, children, hasData }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        {hasData ? (
            <div className="relative h-72 md:h-80">
                {children}
            </div>
        ) : (
            <div className="flex items-center justify-center h-72 md:h-80">
                <p className="text-center text-gray-500 dark:text-gray-400">Sem dados para exibir.</p>
            </div>
        )}
    </div>
);

// --- (HELPER) Datas Padrão ---
const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return {
        dataInicio: startDate.toISOString().split('T')[0],
        dataFim: endDate.toISOString().split('T')[0],
    };
};

// --- Componente Principal ---
const RelatoriosPage: React.FC = () => {
    const defaultDates = useMemo(() => getDefaultDateRange(), []);
    const [dataInicio, setDataInicio] = useState(defaultDates.dataInicio);
    const [dataFim, setDataFim] = useState(defaultDates.dataFim);

    const {
        vendas,
        perdas,
        produtos,
        vendasPorCategoria,
        topProdutos,
        perdasPorMotivo,
        estoqueCritico,
        loading,
        error,
        carregarRelatorios,
    } = useRelatorios();

    const [isDownloading, setIsDownloading] = useState(false);
    const chartsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        carregarRelatorios(defaultDates);
    }, [carregarRelatorios, defaultDates]);

    const handleFiltrarClick = () => {
        carregarRelatorios({ dataInicio, dataFim });
    };

    const handleResetClick = () => {
        setDataInicio(defaultDates.dataInicio);
        setDataFim(defaultDates.dataFim);
        carregarRelatorios(defaultDates);
    };

    const handleDownloadPDF = async () => {
        if (!chartsContainerRef.current) {
            showToast.error("Erro ao localizar a área de relatórios.");
            return;
        }
        setIsDownloading(true);
        showToast.info("Gerando PDF, por favor aguarde...");

        try {
            const canvas = await html2canvas(chartsContainerRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: window.getComputedStyle(document.body).backgroundColor === 'rgb(17, 24, 39)' ? '#111827' : '#FFFFFF',
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`Relatorio_Graficos_${formatDate(new Date())}.pdf`);

        } catch (e) {
            console.error("Erro ao gerar PDF:", e);
            showToast.error("Falha ao gerar PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadExcel = () => {
        setIsDownloading(true);
        showToast.info("Gerando Excel...");
        generateDashboardExcelReport(
            vendas,
            vendasPorCategoria,
            topProdutos,
            perdas,
            produtos
        );
        setIsDownloading(false);
    };

    // --- Dados dos Gráficos (Derivados) ---
    const salesLineChartData = useMemo(() => {
        const salesByDate = new Map<string, number>();
        vendas.forEach(venda => {
            const date = formatDate(venda.dataHora);
            salesByDate.set(date, (salesByDate.get(date) || 0) + venda.valorTotal);
        });
        const sortedSales = new Map([...salesByDate.entries()].sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()));
        return {
            labels: Array.from(sortedSales.keys()),
            datasets: [{
                label: 'Vendas (R$)',
                data: Array.from(sortedSales.values()),
                borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.1, fill: true
            }],
        };
    }, [vendas]);

    const productStatusData = useMemo(() => {
        const ativos = produtos.filter(p => p.ativo).length;
        const inativos = produtos.length - ativos;
        return {
            labels: ['Ativos', 'Inativos'],
            datasets: [{
                data: [ativos, inativos],
                backgroundColor: ['#10B981', '#6B7280'],
            }]
        };
    }, [produtos]);

    const lossByReasonChartData = useMemo(() => ({
        labels: perdasPorMotivo.map(item => item.motivo || 'Não especificado'),
        datasets: [{ data: perdasPorMotivo.map(item => item.totalPerdido), backgroundColor: CHART_COLORS.slice(2, 2 + perdasPorMotivo.length) }],
    }), [perdasPorMotivo]);

    const salesByCategoryChartData = useMemo(() => ({
        labels: vendasPorCategoria.map(item => item.categoria),
        datasets: [{ data: vendasPorCategoria.map(item => item.totalVendido), backgroundColor: CHART_COLORS.slice(0, vendasPorCategoria.length) }],
    }), [vendasPorCategoria]);

    const topProductsChartData = useMemo(() => ({
        labels: topProdutos.map(item => item.nomeProduto),
        datasets: [{ label: 'Unidades Vendidas', data: topProdutos.map(item => item.totalVendido), backgroundColor: 'rgba(16, 185, 129, 0.8)' }],
    }), [topProdutos]);

    return (
        <Layout title="Relatórios Gerenciais">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                    <BarChart2 className="w-6 h-6 mr-2 text-blue-600" />
                    Relatórios Gerenciais
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Início</label>
                        <input
                            type="date" id="dataInicio" value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                            className="input w-full"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Fim</label>
                        <input
                            type="date" id="dataFim" value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                            className="input w-full"
                        />
                    </div>

                    {/* --- BOTÕES COM ESTILO CORRIGIDO --- */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <button
                            onClick={handleFiltrarClick}
                            disabled={loading || isDownloading}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm font-medium w-full sm:w-auto"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Filtrar
                        </button>
                        <button
                            onClick={handleResetClick}
                            disabled={loading || isDownloading}
                            className="bg-gray-600 text-white px-5 py-2.5 rounded-full flex items-center justify-center hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors shadow-sm font-medium w-full sm:w-auto"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Limpar
                        </button>
                    </div>

                </div>
            </div>

            {loading ? (
                <LoadingSpinner text="Carregando relatórios..." />
            ) : error ? (
                <div className="text-center p-6 text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p className="font-semibold">Erro ao carregar relatórios</p>
                    <p className="text-sm">{error}</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row gap-2 w-full justify-end mb-4">
                        <button
                            onClick={handleDownloadExcel}
                            disabled={isDownloading}
                            className="bg-green-600 text-white px-5 py-2.5 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors shadow-sm font-medium w-full sm:w-auto"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            {isDownloading ? 'Gerando...' : 'Baixar Excel'}
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="bg-red-600 text-white px-5 py-2.5 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-sm font-medium w-full sm:w-auto"
                        >
                            <FileDown className="w-4 h-4 mr-2" />
                            {isDownloading ? 'Gerando...' : 'Baixar PDF'}
                        </button>
                    </div>

                    <div ref={chartsContainerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title={`Vendas no Período (${dataInicio} a ${dataFim})`} hasData={vendas.length > 0}>
                            <SalesLineChart data={salesLineChartData} />
                        </ChartCard>

                        <ChartCard title={`Top 5 Produtos (${dataInicio} a ${dataFim})`} hasData={topProdutos.length > 0}>
                            <TopProductsChart data={topProductsChartData} />
                        </ChartCard>

                        <ChartCard title={`Vendas por Categoria (${dataInicio} a ${dataFim})`} hasData={vendasPorCategoria.length > 0}>
                            <SalesByCategoryChart data={salesByCategoryChartData} />
                        </ChartCard>

                        <ChartCard title={`Perdas por Motivo (${dataInicio} a ${dataFim})`} hasData={perdas.length > 0}>
                            <LossByReasonChart data={lossByReasonChartData} />
                        </ChartCard>

                        <ChartCard title="Status Geral do Estoque" hasData={estoqueCritico != null && estoqueCritico.totalItens > 0}>
                            {estoqueCritico && (
                                <StockGaugeChart
                                    criticalItems={estoqueCritico.itensCriticos}
                                    totalItems={estoqueCritico.totalItens}
                                />
                            )}
                        </ChartCard>

                        <ChartCard title="Produtos Ativos vs. Inativos" hasData={produtos.length > 0}>
                            <ProductStatusChart data={productStatusData} />
                        </ChartCard>
                    </div>
                </>
            )}

            {/* REMOVIDA A TAG <style> */}
            <style>{`
   .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
   .select { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
  `}</style>
        </Layout>
    );
};

export default RelatoriosPage;