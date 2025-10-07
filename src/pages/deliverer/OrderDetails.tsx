import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { MapPin, Phone, Clock, Package, Truck } from 'lucide-react';

const OrderDetails: React.FC = () => {
  const { id } = useParams();

  // Mock order data
  const order = {
    id: id,
    customer: {
      name: 'Maria Silva',
      phone: '(11) 98765-4321',
      address: 'Rua das Flores, 123 - Jardim Primavera',
      complement: 'Apto 42',
      city: 'São Paulo',
      state: 'SP',
    },
    items: [
      { id: 1, name: 'Maçã', quantity: 2, unit: 'kg', price: 9.98 },
      { id: 2, name: 'Alface', quantity: 1, unit: 'unid', price: 2.50 },
      { id: 3, name: 'Cenoura', quantity: 1, unit: 'kg', price: 3.99 },
    ],
    status: 'Em andamento',
    createdAt: '2024-03-15 10:30',
    total: 16.47,
  };

  const statusSteps = [
    { id: 1, name: 'Pedido Recebido', icon: Package, completed: true },
    { id: 2, name: 'Em Rota de Entrega', icon: Truck, completed: true },
    { id: 3, name: 'Entregue', icon: MapPin, completed: false },
  ];

  return (
    <Layout title={`Pedido ${order.id}`}>
      <div className="space-y-6">
        {/* Status do Pedido */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Status da Entrega</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <p className="mt-2 text-sm text-gray-500">{step.name}</p>
                {index < statusSteps.length - 1 && (
                  <div className={`h-1 w-24 ${
                    step.completed ? 'bg-green-400' : 'bg-gray-200'
                  } mx-2`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Informações do Cliente */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informações do Cliente</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-6 h-6 text-gray-400 mr-3">
                <MapPin className="w-full h-full" />
              </div>
              <div>
                <p className="text-gray-900">{order.customer.address}</p>
                <p className="text-gray-500">{order.customer.complement}</p>
                <p className="text-gray-500">{`${order.customer.city}, ${order.customer.state}`}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 text-gray-400 mr-3">
                <Phone className="w-full h-full" />
              </div>
              <p className="text-gray-900">{order.customer.phone}</p>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 text-gray-400 mr-3">
                <Clock className="w-full h-full" />
              </div>
              <p className="text-gray-900">Pedido realizado em {order.createdAt}</p>
            </div>
          </div>
        </div>

        {/* Itens do Pedido */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Itens do Pedido</h2>
          <div className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex justify-between">
                <div>
                  <p className="text-gray-900">{item.name}</p>
                  <p className="text-gray-500">{`${item.quantity} ${item.unit}`}</p>
                </div>
                <p className="text-gray-900">R$ {item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between">
              <p className="text-lg font-medium text-gray-900">Total</p>
              <p className="text-lg font-medium text-gray-900">R$ {order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end space-x-4">
          <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
            Reportar Problema
          </button>
          <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
            Confirmar Entrega
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetails;