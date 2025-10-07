import React from 'react';
import Layout from '../../components/Layout';
import { Package, TrendingUp, AlertTriangle, ShoppingBag } from 'lucide-react';

const StockistDashboard: React.FC = () => {
  const stats = [
    { id: 1, name: 'Produtos Cadastrados', value: '45', icon: <Package className="h-6 w-6 text-blue-500" /> },
    { id: 2, name: 'Vendas do Mês', value: 'R$ 12.450', icon: <TrendingUp className="h-6 w-6 text-green-500" /> },
    { id: 3, name: 'Estoque Baixo', value: '8', icon: <AlertTriangle className="h-6 w-6 text-red-500" /> },
    { id: 4, name: 'Novos Pedidos', value: '23', icon: <ShoppingBag className="h-6 w-6 text-purple-500" /> },
  ];

  const recentProducts = [
    { id: 1, name: 'Maçã Gala', category: 'Frutas', stock: 50, price: 'R$ 5,99' },
    { id: 2, name: 'Alface Americana', category: 'Verduras', stock: 25, price: 'R$ 2,50' },
    { id: 3, name: 'Cenoura', category: 'Legumes', stock: 30, price: 'R$ 3,99' },
    { id: 4, name: 'Banana Prata', category: 'Frutas', stock: 40, price: 'R$ 4,50' },
  ];

  const lowStockProducts = [
    { id: 1, name: 'Tomate', stock: 5, minStock: 20 },
    { id: 2, name: 'Cebola', stock: 8, minStock: 25 },
    { id: 3, name: 'Batata', stock: 12, minStock: 30 },
  ];

  return (
    <Layout title="Dashboard do Estoquista">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-800">Produtos Recentes</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentProducts.map((product) => (
                <div key={product.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{product.price}</p>
                      <p className="text-sm text-gray-500">Estoque: {product.stock}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-800">Alerta de Estoque Baixo</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-red-600">Estoque atual: {product.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Mínimo: {product.minStock}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Crítico
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StockistDashboard;