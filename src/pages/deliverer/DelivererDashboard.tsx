import React from 'react';
import Layout from '../../components/Layout';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const DelivererDashboard: React.FC = () => {
  const stats = [
    { id: 1, name: 'Entregas Hoje', value: '8', icon: <Package className="h-6 w-6 text-blue-500" /> },
    { id: 2, name: 'Em Andamento', value: '3', icon: <Truck className="h-6 w-6 text-yellow-500" /> },
    { id: 3, name: 'Concluídas', value: '5', icon: <CheckCircle className="h-6 w-6 text-green-500" /> },
    { id: 4, name: 'Tempo Médio', value: '25min', icon: <Clock className="h-6 w-6 text-purple-500" /> },
  ];

  const deliveries = [
    { 
      id: '#12345',
      customer: 'Maria Silva',
      address: 'Rua das Flores, 123',
      status: 'Em andamento',
      time: '10:30'
    },
    { 
      id: '#12346',
      customer: 'João Pereira',
      address: 'Av. Principal, 456',
      status: 'Pendente',
      time: '11:00'
    },
    { 
      id: '#12347',
      customer: 'Ana Santos',
      address: 'Rua do Comércio, 789',
      status: 'Concluído',
      time: '09:45'
    },
  ];

  return (
    <Layout title="Dashboard do Entregador">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">Entregas do Dia</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {delivery.id}
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{delivery.customer}</p>
                    <p className="text-sm text-gray-500">{delivery.address}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    delivery.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                    delivery.status === 'Em andamento' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {delivery.status}
                  </span>
                  <span className="ml-4 text-sm text-gray-500">{delivery.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default DelivererDashboard;