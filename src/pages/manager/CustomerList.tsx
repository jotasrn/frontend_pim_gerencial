import React from 'react';
import Layout from '../../components/Layout';

const CustomerList: React.FC = () => {
  const customers = [
    { id: 1, name: 'Maria Silva', email: 'maria@example.com', orders: 12, lastOrder: '2024-03-10' },
    { id: 2, name: 'João Pereira', email: 'joao@example.com', orders: 8, lastOrder: '2024-03-09' },
    { id: 3, name: 'Ana Santos', email: 'ana@example.com', orders: 15, lastOrder: '2024-03-08' },
  ];

  return (
    <Layout title="Lista de Clientes">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total de Pedidos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Pedido</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.orders}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.lastOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default CustomerList;