import React from 'react';
import Layout from '../../components/Layout';
import { Users, ShoppingBag, Tag, ShoppingCart, Truck, AlertCircle } from 'lucide-react';
import { SalesLineChart, SalesByCategoryChart, TopProductsChart } from '../../components/charts/SalesChart';
// Importe os outros componentes de gráfico que você for usar
// import { StockLevelsChart, StockGaugeChart } from '../../components/charts/StockChart';
// import { LossByReasonChart, LossOverTimeChart } from '../../components/charts/LossChart';

const ManagerDashboard: React.FC = () => {
  // Dados de exemplo (serão substituídos por chamadas de API no futuro)
  const stats = [
    { id: 1, name: 'Usuários', value: '24', icon: <Users className="h-6 w-6 text-blue-500" /> },
    { id: 2, name: 'Produtos', value: '156', icon: <ShoppingBag className="h-6 w-6 text-green-500" /> },
    { id: 3, name: 'Promoções Ativas', value: '8', icon: <Tag className="h-6 w-6 text-purple-500" /> },
    { id: 4, name: 'Pedidos Hoje', value: '32', icon: <ShoppingCart className="h-6 w-6 text-orange-500" /> },
    { id: 5, name: 'Entregas em Andamento', value: '12', icon: <Truck className="h-6 w-6 text-yellow-500" /> },
    { id: 6, name: 'Estoque Baixo', value: '7', icon: <AlertCircle className="h-6 w-6 text-red-500" /> },
  ];

  const recentOrders = [
    { id: '#12345', customer: 'Maria Silva', total: 'R$ 78,50', status: 'Entregue', date: '2 horas atrás' },
    { id: '#12346', customer: 'João Pereira', total: 'R$ 156,00', status: 'Em entrega', date: '3 horas atrás' },
    { id: '#12347', customer: 'Ana Santos', total: 'R$ 42,30', status: 'Processando', date: '5 horas atrás' },
  ];
  
  // --- DADOS COMPLETOS PARA OS GRÁFICOS ---
  const salesLineData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Vendas (R$)',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      tension: 0.1,
    }],
  };
  
  const salesByCategoryData = {
    labels: ['Frutas', 'Verduras', 'Legumes', 'Outros'],
    datasets: [{
      data: [12500, 9500, 7800, 4200],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'],
    }],
  };

  const topProductsData = {
    labels: ['Maçã Gala', 'Alface Americana', 'Cenoura', 'Banana Prata', 'Tomate'],
    datasets: [{
      label: 'Unidades Vendidas',
      data: [450, 380, 320, 290, 250],
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
    }],
  };

  return (
    <Layout title="Dashboard do Gerente">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-50">{stat.icon}</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de Pedidos Recentes */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">Pedidos Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'Entregue' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Em entrega' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção de Gráficos */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900">Análises</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <SalesLineChart data={salesLineData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <SalesByCategoryChart data={salesByCategoryData} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <TopProductsChart data={topProductsData} />
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;