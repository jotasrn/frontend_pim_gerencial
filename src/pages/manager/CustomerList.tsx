import React from 'react';
import Layout from '../../components/Layout';
import { useClientes } from '../../hooks/useClientes';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/apiHelpers';

const CustomerList: React.FC = () => {
  const { clientes, loading } = useClientes();

  return (
    <Layout title="Lista de Clientes">
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        {loading && clientes.length === 0 ? (
          <LoadingSpinner text="Carregando clientes..." />
        ) : (
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
              {clientes.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.totalPedidos}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(customer.ultimoPedido)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default CustomerList;