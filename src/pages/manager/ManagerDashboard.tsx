import React from 'react';
import Layout from '../../components/Layout';
import { Users, ShoppingBag, Tag, ShoppingCart, Truck, AlertCircle } from 'lucide-react';
import { SalesLineChart, SalesByCategoryChart, TopProductsChart } from '../../components/charts/SalesChart';
import { StockLevelsChart, StockGaugeChart } from '../../components/charts/StockChart';
import { LossByReasonChart, LossOverTimeChart } from '../../components/charts/LossChart';
import { PromotionEffectChart, PromotionByCategoryChart } from '../../components/charts/PromotionChart';
import { ProductsBySupplierChart } from '../../components/charts/SupplierChart';

const ManagerDashboard: React.FC = () => {
  // Mock data for dashboard
  const stats = [
    { id: 1, name: 'Usuários', value: '24', icon: <Users className="h-6 w-6 text-blue-500" /> },
    { id: 2, name: 'Produtos', value: '156', icon: <ShoppingBag className="h-6 w-6 text-green-500" /> },
    { id: 3, name: 'Promoções Ativas', value: '8', icon: <Tag className="h-6 w-6 text-purple-500" /> },
    { id: 4, name: 'Pedidos Hoje', value: '32', icon: <ShoppingCart className="h-6 w-6 text-orange-500" /> },
    { id: 5, name: 'Entregas em Andamento', value: '12', icon: <Truck className="h-6 w-6 text-yellow-500" /> },
    { id: 6, name: 'Produtos com Baixo Estoque', value: '7', icon: <AlertCircle className="h-6 w-6 text-red-500" /> },
  ];

  // Mock data for recent orders
  const recentOrders = [
    { id: '#12345', customer: 'Maria Silva', total: 'R$ 78,50', status: 'Entregue', date: '2 horas atrás' },
    { id: '#12346', customer: 'João Pereira', total: 'R$ 156,00', status: 'Em entrega', date: '3 horas atrás' },
    { id: '#12347', customer: 'Ana Santos', total: 'R$ 42,30', status: 'Processando', date: '5 horas atrás' },
    { id: '#12348', customer: 'Carlos Oliveira', total: 'R$ 125,75', status: 'Entregue', date: '1 dia atrás' },
  ];

  // Mock data para gráficos
  const salesLineData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Vendas (R$)',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const salesByCategoryData = {
    labels: ['Frutas', 'Verduras', 'Legumes', 'Temperos', 'Orgânicos'],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          '#EF4444',
          '#F59E0B',
          '#10B981',
          '#3B82F6',
          '#8B5CF6',
        ],
      },
    ],
  };

  const topProductsData = {
    labels: ['Maçã Gala', 'Alface Americana', 'Cenoura', 'Banana Prata', 'Tomate'],
    datasets: [
      {
        label: 'Vendas',
        data: [450, 380, 320, 290, 250],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  const stockLevelsData = {
    labels: ['Maçã', 'Alface', 'Cenoura', 'Banana', 'Tomate'],
    datasets: [
      {
        label: 'Estoque Atual',
        data: [120, 45, 80, 200, 30],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Estoque Mínimo',
        data: [50, 20, 30, 100, 25],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const lossByReasonData = {
    labels: ['Vencimento', 'Dano no Transporte', 'Deterioração', 'Outros'],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: [
          '#EF4444',
          '#F59E0B',
          '#8B5CF6',
          '#6B7280',
        ],
      },
    ],
  };

  const lossOverTimeData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Perdas (unidades)',
        data: [25, 30, 20, 35, 28, 22],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const promotionEffectData = {
    labels: ['Maçã', 'Banana', 'Laranja', 'Uva', 'Pêra'],
    datasets: [
      {
        label: 'Sem Promoção',
        data: [300, 250, 200, 150, 100],
        backgroundColor: 'rgba(107, 114, 128, 0.8)',
      },
      {
        label: 'Com Promoção',
        data: [450, 380, 320, 280, 200],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  const promotionByCategoryData = {
    labels: ['Frutas', 'Verduras', 'Legumes', 'Temperos'],
    datasets: [
      {
        data: [5, 2, 3, 1],
        backgroundColor: [
          '#EF4444',
          '#F59E0B',
          '#10B981',
          '#3B82F6',
        ],
      },
    ],
  };

  const supplierData = {
    labels: ['Fazenda Verde', 'Horta Orgânica', 'Sítio Bela Vista', 'Cooperativa Rural'],
    datasets: [
      {
        label: 'Produtos',
        data: [45, 32, 28, 20],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  return (
    <Layout title="Dashboard do Gerente">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md">
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

      {/* Recent orders section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">Pedidos Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
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

      {/* Gráficos */}
      <div className="mt-8 space-y-8">
        {/* Seção de Vendas */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Análise de Vendas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

        {/* Seção de Estoque */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Controle de Estoque</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
              <StockLevelsChart data={stockLevelsData} />
            </div>
            <div className="bg-white rounded-lg shadow">
              <StockGaugeChart criticalItems={7} totalItems={156} />
            </div>
          </div>
        </div>

        {/* Seção de Perdas */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Análise de Perdas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <LossByReasonChart data={lossByReasonData} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <LossOverTimeChart data={lossOverTimeData} />
            </div>
          </div>
        </div>

        {/* Seção de Promoções */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Efetividade das Promoções</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <PromotionEffectChart data={promotionEffectData} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <PromotionByCategoryChart data={promotionByCategoryData} />
            </div>
          </div>
        </div>

        {/* Seção de Fornecedores */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Análise de Fornecedores</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <ProductsBySupplierChart data={supplierData} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;