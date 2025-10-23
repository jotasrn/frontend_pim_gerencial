import React, { useMemo } from 'react';
import Layout from '../../components/Layout';
import { Users, ShoppingBag, Tag, ShoppingCart, Truck, AlertCircle } from 'lucide-react';
import { SalesLineChart, SalesByCategoryChart, TopProductsChart } from '../../components/charts/SalesChart';
import { StockGaugeChart } from '../../components/charts/StockChart';
import { LossByReasonChart } from '../../components/charts/LossChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useRelatorios } from '../../hooks/useRelatorios';
import { formatCurrency, formatDateTime } from '../../utils/apiHelpers'; // Funções utilitárias
import { Venda } from '../../types'; // Importar tipo Venda

// Cores padrão para gráficos
const CHART_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6366F1', '#EC4899'];

const ManagerDashboard: React.FC = () => {
  // Busca os dados reais usando o hook
  const {
    vendasPorCategoria,
    topProdutos,
    perdasPorMotivo,
    // niveisEstoque, // Não usado diretamente nos gráficos atuais
    estoqueCritico,
    vendasRecentes,
    loading,
    error,
    carregarRelatorios, // Função para recarregar dados
  } = useRelatorios();

  // --- Mapeamento dos Dados para os Gráficos (Otimizado com useMemo) ---

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
      backgroundColor: 'rgba(16, 185, 129, 0.8)', // Cor verde principal
    }],
  }), [topProdutos]);

  const lossByReasonChartData = useMemo(() => ({
    labels: perdasPorMotivo.map(item => item.motivo || 'Não especificado'),
    datasets: [{
      data: perdasPorMotivo.map(item => item.totalPerdido),
      backgroundColor: CHART_COLORS.slice(0, perdasPorMotivo.length),
    }],
  }), [perdasPorMotivo]);

  // Placeholder para o gráfico de linha (requer dados agrupados por tempo)
  const salesLineDataPlaceholder = useMemo(() => ({
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'], // Exemplo: Dias da semana
    datasets: [{
      label: 'Vendas da Semana (R$)',
      data: [120, 190, 150, 250, 220, 300, 270], // Dados fictícios
      borderColor: 'rgb(16, 185, 129)', // Verde
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      tension: 0.1,
    }],
  }), []); // Dependência vazia, pois são dados fixos

  // --- Cards de Estatísticas (Preenchidos com dados do hook e placeholders) ---
  const stats = useMemo(() => [
    { id: 1, name: 'Usuários Ativos', value: '...', icon: <Users className="h-6 w-6 text-blue-500" /> }, // TODO: Endpoint de contagem
    { id: 2, name: 'Total Produtos', value: estoqueCritico ? estoqueCritico.totalItens.toString() : '...', icon: <ShoppingBag className="h-6 w-6 text-green-500" /> },
    { id: 3, name: 'Promoções Ativas', value: '...', icon: <Tag className="h-6 w-6 text-purple-500" /> }, // TODO: Endpoint de contagem
    { id: 4, name: 'Pedidos Hoje', value: '...', icon: <ShoppingCart className="h-6 w-6 text-orange-500" /> }, // TODO: Endpoint de contagem
    { id: 5, name: 'Entregas Pendentes', value: '...', icon: <Truck className="h-6 w-6 text-yellow-500" /> }, // TODO: Endpoint de contagem
    { id: 6, name: 'Estoque Baixo', value: estoqueCritico ? estoqueCritico.itensCriticos.toString() : '...', icon: <AlertCircle className="h-6 w-6 text-red-500" /> },
  ], [estoqueCritico]); // Recalcula apenas se estoqueCritico mudar

  // --- Renderização Condicional ---

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
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg shadow">
          <AlertCircle className="mx-auto h-12 w-12 mb-4" />
          <p className="font-semibold mb-2">Erro ao carregar dados do dashboard:</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={carregarRelatorios} // Chama a função para recarregar
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </Layout>
    );
  }

  // --- Renderização Principal ---

  return (
    <Layout title="Dashboard do Gerente">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-lg shadow p-6 transform transition hover:scale-105 duration-300 ease-in-out">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-100">{stat.icon}</div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de Pedidos Recentes */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Últimos Pedidos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendasRecentes.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">Nenhum pedido recente encontrado.</td></tr>
              ) : (
                vendasRecentes.map((order: Venda) => ( // Adicionado tipo Venda aqui
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline cursor-pointer">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {/* Acesso seguro aos dados do cliente/usuário */}
                      {order.cliente?.usuario?.nomeCompleto || 'Cliente não identificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{formatCurrency(order.valorTotal)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Mapeamento de status para cores/nomes */}
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        order.statusPedido === 'CONCLUIDO' ? 'bg-green-100 text-green-800' :
                        order.statusPedido === 'EM_ENTREGA' ? 'bg-yellow-100 text-yellow-800' :
                        order.statusPedido === 'PAGAMENTO_APROVADO' ? 'bg-blue-100 text-blue-800' :
                        order.statusPedido === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800' // Status padrão
                      }`}>
                        {order.statusPedido?.replace('_', ' ').toLowerCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(order.dataHora)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção de Gráficos */}
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Análises Visuais</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Linha (Placeholder) */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Vendas na Semana (Exemplo)</h3>
            <SalesLineChart data={salesLineDataPlaceholder} />
          </div>
          {/* Gráfico de Vendas por Categoria */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Distribuição de Vendas por Categoria</h3>
            {vendasPorCategoria.length > 0 ? (
              <SalesByCategoryChart data={salesByCategoryChartData} />
            ) : (
              <p className="text-center text-gray-500 py-8">Sem dados de vendas por categoria.</p>
            )}
          </div>
          {/* Gráfico de Perdas por Motivo */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Principais Motivos de Perda</h3>
            {perdasPorMotivo.length > 0 ? (
             <LossByReasonChart data={lossByReasonChartData} />
            ) : (
              <p className="text-center text-gray-500 py-8">Sem dados de perdas registradas.</p>
            )}
          </div>
          {/* Gauge de Estoque Crítico */}
          <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center min-h-[300px]">
           <h3 className="text-lg font-medium text-gray-800 mb-4 self-start">Status do Estoque Crítico</h3>
            {estoqueCritico && estoqueCritico.totalItens > 0 ? (
              <StockGaugeChart
                criticalItems={estoqueCritico.itensCriticos}
                totalItems={estoqueCritico.totalItens}
              />
            ) : (
               <p className="text-center text-gray-500">Sem dados de estoque crítico.</p>
            )}
          </div>
        </div>
        {/* Gráfico Top 5 Produtos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Top 5 Produtos Mais Vendidos (Unidades)</h3>
           {topProdutos.length > 0 ? (
            <TopProductsChart data={topProductsChartData} />
           ) : (
             <p className="text-center text-gray-500 py-8">Sem dados de produtos vendidos.</p>
           )}
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;