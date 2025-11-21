import React, { useMemo, useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Users, ShoppingBag, Tag, ShoppingCart, Truck, AlertCircle } from 'lucide-react';
import { SalesLineChart, SalesByCategoryChart, TopProductsChart } from '../../components/charts/SalesChart';
import { StockGaugeChart } from '../../components/charts/StockChart';
import { LossByReasonChart } from '../../components/charts/LossChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useRelatorios } from '../../hooks/useRelatorios';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/apiHelpers';
import { Venda, FiltrosRelatorios } from '../../types';

const CHART_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6366F1', '#EC4899'];

const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);
  return {
    dataInicio: startDate.toISOString().split('T')[0],
    dataFim: endDate.toISOString().split('T')[0],
  };
};

const ManagerDashboard: React.FC = () => {
  const [filtros] = useState<FiltrosRelatorios>(getDefaultDateRange());

  const {
    vendasPorCategoria,
    topProdutos,
    perdasPorMotivo,
    estoqueCritico,
    vendasRecentes,
    kpis,
    loading,
    error,
    carregarRelatorios,
  } = useRelatorios();

  // Carrega os dados na montagem e quando os filtros mudam
  useEffect(() => {
    carregarRelatorios(filtros);
  }, [carregarRelatorios, filtros]);

  const handleRetry = () => {
    carregarRelatorios(filtros);
  };

  const salesByCategoryChartData = useMemo(() => ({
    labels: vendasPorCategoria.map(item => item.categoria),
    datasets: [{
      data: vendasPorCategoria.map(item => item.totalVendido),
      backgroundColor: CHART_COLORS.slice(0, vendasPorCategoria.length),
    }],
  }), [vendasPorCategoria]);

  const topProductsChartData = useMemo(() => ({
    labels: topProdutos.map(item => item.nomeProduto),
    datasets: [{
      label: 'Unidades Vendidas',
      data: topProdutos.map(item => item.totalVendido),
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
    }],
  }), [topProdutos]);

  const lossByReasonChartData = useMemo(() => ({
    labels: perdasPorMotivo.map(item => item.motivo || 'Não especificado'),
    datasets: [{
      data: perdasPorMotivo.map(item => item.totalPerdido),
      backgroundColor: CHART_COLORS.slice(0, perdasPorMotivo.length),
    }],
  }), [perdasPorMotivo]);

  const salesLineChartData = useMemo(() => {
    if (!vendasRecentes || vendasRecentes.length === 0) {
      return { labels: [], datasets: [] };
    }

    const salesByDate = new Map<string, number>();
    vendasRecentes.forEach(venda => {
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
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.1,
        fill: true,
      }],
    };
  }, [vendasRecentes]);

  const stats = useMemo(() => [
    { id: 1, name: 'Usuários Ativos', value: kpis.usuariosAtivos ?? '...', icon: <Users className="h-6 w-6 text-blue-500" /> },
    { id: 2, name: 'Total Produtos', value: estoqueCritico ? estoqueCritico.totalItens.toString() : '...', icon: <ShoppingBag className="h-6 w-6 text-green-500" /> },
    { id: 3, name: 'Promoções Ativas', value: kpis.promocoesAtivas ?? '...', icon: <Tag className="h-6 w-6 text-purple-500" /> },
    { id: 4, name: 'Pedidos Hoje', value: kpis.pedidosHoje ?? '...', icon: <ShoppingCart className="h-6 w-6 text-orange-500" /> },
    { id: 5, name: 'Entregas Pendentes', value: kpis.entregasPendentes ?? '...', icon: <Truck className="h-6 w-6 text-yellow-500" /> },
    { id: 6, name: 'Estoque Baixo', value: estoqueCritico ? estoqueCritico.itensCriticos.toString() : '...', icon: <AlertCircle className="h-6 w-6 text-red-500" /> },
  ], [estoqueCritico, kpis]);

  if (loading) {
    return (
      <Layout title="Dashboard do Gerente">
        <LoadingSpinner text="Carregando dados do dashboard..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard do Gerente">
        <div className="text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow">
          <AlertCircle className="mx-auto h-12 w-12 mb-4" />
          <p className="font-semibold mb-2">Erro ao carregar dados do dashboard:</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={handleRetry} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard do Gerente">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transform transition hover:scale-105 duration-300 ease-in-out">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">{stat.icon}</div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Últimos Pedidos</h2>
        </div>

        <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {vendasRecentes.length === 0 ? (
            <p className="text-center py-6 text-gray-500 dark:text-gray-400">Nenhum pedido recente encontrado.</p>
          ) : (
            vendasRecentes.map((order: Venda) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-blue-600 dark:text-blue-400">#{order.id}</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(order.valorTotal)}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {order.cliente?.nomeCompleto || 'Cliente não identificado'}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${order.statusPedido === 'CONCLUIDO' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                    order.statusPedido === 'EM_ENTREGA' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                      order.statusPedido === 'PAGAMENTO_APROVADO' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                        order.statusPedido === 'CANCELADO' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                    {order.statusPedido?.replace('_', ' ').toLowerCase() || 'N/A'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">{formatDateTime(order.dataHora)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="overflow-x-auto hidden lg:block">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {vendasRecentes.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500 dark:text-gray-400">Nenhum pedido recente encontrado.</td></tr>
              ) : (
                vendasRecentes.map((order: Venda) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {order.cliente?.nomeCompleto || 'Cliente não identificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100 font-medium">{formatCurrency(order.valorTotal)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${order.statusPedido === 'CONCLUIDO' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                          order.statusPedido === 'EM_ENTREGA' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                            order.statusPedido === 'PAGAMENTO_APROVADO' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                              order.statusPedido === 'CANCELADO' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                        {order.statusPedido?.replace('_', ' ').toLowerCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDateTime(order.dataHora)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Análises Visuais</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">Vendas na Semana (Exemplo)</h3>
            <div className="relative h-72 md:h-80">
              <SalesLineChart data={salesLineChartData} />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">Distribuição de Vendas por Categoria</h3>
            {vendasPorCategoria.length > 0 ? (
              <div className="relative h-72 md:h-80">
                <SalesByCategoryChart data={salesByCategoryChartData} />
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Sem dados de vendas por categoria.</p>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">Principais Motivos de Perda</h3>
            {perdasPorMotivo.length > 0 ? (
              <div className="relative h-72 md:h-80">
                <LossByReasonChart data={lossByReasonChartData} />
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Sem dados de perdas registradas.</p>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4 self-start">Status do Estoque Crítico</h3>
            {estoqueCritico && estoqueCritico.totalItens > 0 ? (
              <div className="relative h-64 w-full">
                <StockGaugeChart
                  criticalItems={estoqueCritico.itensCriticos}
                  totalItems={estoqueCritico.totalItens}
                />
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">Sem dados de estoque crítico.</p>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">Top 5 Produtos Mais Vendidos (Unidades)</h3>
          {topProdutos.length > 0 ? (
            <div className="relative h-72 md:h-80">
              <TopProductsChart data={topProductsChartData} />
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Sem dados de produtos vendidos.</p>
          )}
        </div>
      </div>
    </Layout >
  );
};

export default ManagerDashboard;