import React from 'react';
import Layout from '../../components/Layout';
import { useClientes } from '../../hooks/useClientes';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, AlertCircle } from 'lucide-react';

const CustomerList: React.FC = () => {
  const { clientes, loading, error } = useClientes();

  const totalClientes = clientes.length;

  return (
    <Layout title="Lista de Clientes">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
          <Users className="w-6 h-6 mr-2 text-purple-600"/>
          Clientes Cadastrados
        </h1>
        {!loading && !error && (
          <div className="flex items-center text-sm font-medium bg-purple-100 text-purple-800 px-3 py-1 rounded-full shadow-sm">
            Total de Clientes:
            <span className="ml-1.5 font-bold text-base">{totalClientes}</span>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {error && !loading && (
           <div className="text-center p-6 text-red-600 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p className="font-semibold">Erro ao carregar clientes</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && totalClientes === 0 ? (
          <LoadingSpinner text="Carregando clientes..." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Completo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">CPF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Telefone</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {totalClientes === 0 && !loading ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">Nenhum cliente encontrado.</td></tr>
              ) : (
                clientes.map((customer) => (
                  <tr key={customer.id} className={`hover:bg-gray-50 transition-colors ${!customer.ativo ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.nomeCompleto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {customer.cpf || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {customer.telefone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default CustomerList;