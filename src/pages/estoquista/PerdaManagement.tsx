import React, { useState, useRef, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Plus, Archive, Edit3, Calendar, Download, AlertCircle } from 'lucide-react';
import PerdaForm from '../../components/forms/PerdaForm';
import { usePerdas } from '../../hooks/usePerdas';
import { useProdutos } from '../../hooks/useProdutos';
import { useNotifications } from '../../contexts/NotificacaoContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Perda, PerdaData, Produto } from '../../types';
import { formatDateTime, formatDate } from '../../utils/apiHelpers';
import { PerdasMensaisChart, PerdasAnuaisChart, PerdasLinhaChart } from '../../components/charts/PerdaChart';
import { generatePerdaReport } from '../../utils/reportGenerator';
import { showToast } from '../../components/Toast';

const PerdaManagement: React.FC = () => {
  const { perdas: perdasManuais, loading: loadingPerdas, registrarPerda, carregarPerdas } = usePerdas();
  const { produtos: allProdutos, loading: loadingProdutos } = useProdutos({ status: 'all' });
  const { notifications, loading: loadingNotifications } = useNotifications();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const shouldReloadList = useRef(false);

  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const isLoading = loadingPerdas || loadingProdutos || loadingNotifications;

  const expiredProducts = useMemo((): Produto[] => {
    const vencidosIds = notifications
      .filter(n => n.tipo === 'PRODUTO_VENCIDO')
      .map(n => n.link?.split('/').pop());

    if (!vencidosIds.length) return [];

    return allProdutos.filter(p => vencidosIds.includes(String(p.id)));
  }, [notifications, allProdutos]);

  const allPerdas = useMemo(() => {
    const vencidasComoPerdas: Perda[] = expiredProducts.map((p: Produto, index: number) => ({
      id: -1 * (index + 1),
      produto: p,
      produtoId: p.id,
      quantidade: p.estoque?.quantidadeAtual || 0,
      motivo: 'VENCIMENTO (Automático)',
      dataPerda: p.dataValidade || new Date().toISOString(),
    }));
    return [...perdasManuais, ...vencidasComoPerdas].sort((a, b) => new Date(b.dataPerda).getTime() - new Date(a.dataPerda).getTime());
  }, [perdasManuais, expiredProducts]);

  const handleFormSubmit = async (data: PerdaData): Promise<boolean> => {
    const success = await registrarPerda(data);
    if (success) {
      shouldReloadList.current = true;
      setIsFormOpen(false);
      carregarPerdas();
    }
    return success;
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleDownloadReport = () => {
    let perdasFiltradas: Perda[] = [];
    let periodo = '';

    if (reportType === 'monthly') {
      perdasFiltradas = allPerdas.filter(p => {
        const data = new Date(p.dataPerda);
        return data.getMonth() === selectedMonth && data.getFullYear() === selectedYear;
      });
      periodo = `${String(selectedMonth + 1).padStart(2, '0')}-${selectedYear}`;
    } else {
      perdasFiltradas = allPerdas.filter(p => {
        const data = new Date(p.dataPerda);
        return data.getFullYear() === selectedYear;
      });
      periodo = selectedYear.toString();
    }

    if (perdasFiltradas.length === 0) {
      showToast.error('Não há dados de perdas para o período selecionado.');
      return;
    }

    generatePerdaReport(perdasFiltradas, reportType === 'monthly' ? 'Mensal' : 'Anual', periodo);
  };

  const years = useMemo(() => {
    const startYear = 2023;
    const currentYear = new Date().getFullYear();
    const range = [];
    for (let i = currentYear; i >= startYear; i--) {
      range.push(i);
    }
    return range;
  }, []);

  const months = useMemo(() => [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ], []);

  const { monthlyData, annualData, dailyData } = useMemo(() => {
    const monthly = new Array(12).fill(0);
    const annual: { [key: string]: number } = {};
    const daily: { [key: string]: number } = {};
    const now = new Date();
    const currentYear = now.getFullYear();

    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);
    for (let i = 0; i <= 30; i++) {
      const day = new Date(last30Days);
      day.setDate(last30Days.getDate() + i);
      daily[formatDate(day)] = 0;
    }

    allPerdas.forEach(p => {
      const date = new Date(p.dataPerda);

      if (date.getFullYear() === currentYear) {
        monthly[date.getMonth()] += p.quantidade;
      }

      const yearStr = date.getFullYear().toString();
      annual[yearStr] = (annual[yearStr] || 0) + p.quantidade;

      if (date >= last30Days) {
        const dayStr = formatDate(date);
        if (dayStr in daily) {
          daily[dayStr] += p.quantidade;
        }
      }
    });

    const sortedAnnualLabels = Object.keys(annual).sort((a, b) => parseInt(a) - parseInt(b));

    return {
      monthlyData: { labels: months, data: monthly },
      annualData: { labels: sortedAnnualLabels, data: sortedAnnualLabels.map(year => annual[year]) },
      dailyData: { labels: Object.keys(daily), data: Object.values(daily) }
    };
  }, [allPerdas, months]);

  const perdasVencimento = useMemo(() => {
    return allPerdas.filter(p => p.motivo === 'VENCIMENTO (Automático)');
  }, [allPerdas]);

  return (
    <Layout title="Registro de Perdas">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <Archive className="w-6 h-6 mr-2 text-red-600" />Histórico de Perdas
        </h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Registrar Nova Perda Manual
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Carregando histórico de perdas..." />
      ) : (
        <div className="space-y-8">

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-[2/1] relative">
                <PerdasMensaisChart
                  labels={monthlyData.labels}
                  data={monthlyData.data}
                  title={`Perdas Mensais (${selectedYear})`}
                />
              </div>
              <div className="aspect-[2/1] relative">
                <PerdasAnuaisChart
                  labels={annualData.labels}
                  data={annualData.data}
                  title="Perdas Anuais (Total)"
                />
              </div>
            </div>

            <div className="mt-6 aspect-[2/1] relative">
              <PerdasLinhaChart
                labels={dailyData.labels}
                data={dailyData.data}
                title="Perdas nos Últimos 30 Dias"
              />
            </div>

            <div className="mt-6 pt-4 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex-shrink-0">Baixar Relatório</h3>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <select value={reportType} onChange={(e) => setReportType(e.target.value as 'monthly' | 'yearly')} className="select">
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
                {reportType === 'monthly' && (
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="select">
                    {months.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                )}
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="select">
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button
                  onClick={handleDownloadReport}
                  className="btn bg-gray-700 text-white hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 w-full sm:w-auto rounded-lg shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 p-4 border-b dark:border-gray-700 flex items-center">
              <Edit3 className="w-5 h-5 mr-2" />
              Perdas Registradas (Manual)
            </h3>
            {perdasManuais.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 p-6">Nenhum registro de perda manual.</p>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:hidden">
                  {perdasManuais.map((perda) => (
                    <div key={perda.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{perda.produto?.nome || 'Produto não encontrado'}</span>
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">-{perda.quantidade} unid.</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        <p className="flex items-center"><Edit3 className="w-4 h-4 mr-2" />Motivo: {perda.motivo || '-'}</p>
                        <p className="flex items-center"><Calendar className="w-4 h-4 mr-2" />Data: {formatDateTime(perda.dataPerda)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden lg:table">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Motivo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data da Perda</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {perdasManuais.map((perda) => (
                      <tr key={perda.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{perda.produto?.nome || 'Produto não encontrado'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-bold">-{perda.quantidade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{perda.motivo || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDateTime(perda.dataPerda)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 p-4 border-b dark:border-gray-700 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              Perdas por Vencimento (Automático)
            </h3>
            {perdasVencimento.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 p-6">Nenhum produto vencido detectado.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantidade Perdida</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data de Vencimento</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {perdasVencimento.map((perda) => (
                    <tr key={perda.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{perda.produto?.nome || 'Produto não encontrado'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-bold">-{perda.quantidade}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(perda.dataPerda)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

      <PerdaForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      <style>{`
   .btn { @apply px-4 py-2 rounded-lg flex items-center justify-center transition-colors shadow-sm; }
   .select { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
   `}</style>
    </Layout>
  );
};

export default PerdaManagement;