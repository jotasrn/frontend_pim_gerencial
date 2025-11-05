import React, { useMemo } from 'react';
import Layout from '../../components/Layout';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useMinhasEntregas } from '../../hooks/useMinhasEntregas';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/apiHelpers';

const DelivererDashboard: React.FC = () => {
  const { entregas, loading, error } = useMinhasEntregas();

  const stats = useMemo(() => {
    const pendentes = entregas.filter(e => e.status === 'AGUARDANDO_COLETA').length;
    const emRota = entregas.filter(e => e.status === 'EM_ROTA').length;
    
    const hoje = new Date().toISOString().split('T')[0];
    const entregasDeHoje = entregas.filter(e => e.venda?.dataHora?.startsWith(hoje));

    return [
      { id: 1, name: 'Entregas Pendentes', value: pendentes.toString(), icon: <Package className="h-6 w-6 text-blue-500" /> },
      { id: 2, name: 'Em Rota', value: emRota.toString(), icon: <Truck className="h-6 w-6 text-yellow-500" /> },
      { id: 3, name: 'Total Hoje (Ativas)', value: entregasDeHoje.length.toString(), icon: <CheckCircle className="h-6 w-6 text-green-500" /> },
      { id: 4, name: 'Total Atribuído', value: entregas.length.toString(), icon: <Clock className="h-6 w-6 text-purple-500" /> },
    ];
  }, [entregas]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'AGUARDANDO_COLETA':
        return 'bg-blue-100 text-blue-800';
      case 'EM_ROTA':
        return 'bg-yellow-100 text-yellow-800';
      case 'ENTREGUE':
        return 'bg-green-100 text-green-800';
      case 'PROBLEMA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="Dashboard do Entregador">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-50">{stat.icon}</div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">{stat.name}</p>
                <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-gray-800">Minhas Entregas Ativas</h2>
        </div>
        
        {loading && (
            <LoadingSpinner text="Carregando entregas..."/>
        )}
        
        {!loading && error && (
             <div className="text-center p-6 text-red-600 bg-red-50">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>Erro ao carregar entregas: {error}</p>
            </div>
        )}
        
        {!loading && !error && (
            <div className="divide-y divide-gray-200">
                {entregas.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">Você não possui entregas ativas no momento.</p>
                ) : (
                    entregas.map((entrega) => (
                        <Link to={`/entregador/entrega/${entrega.id}`} key={entrega.id} className="block p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                <div className="flex items-center mb-3 sm:mb-0">
                                    <div className="flex-shrink-0">
                                        <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getStatusStyle(entrega.status)}`}>
                                            {entrega.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">Pedido #{entrega.venda?.id ?? 'N/A'}</p>
                                        <p className="text-sm text-gray-500">{entrega.venda?.enderecoEntrega?.rua ?? 'Endereço'}, {entrega.venda?.enderecoEntrega?.numero ?? 'S/N'}</p>
                                        <p className="text-xs text-gray-500">{entrega.venda?.enderecoEntrega?.bairro}, {entrega.venda?.enderecoEntrega?.cidade}</p>
                                    </div>
                                </div>
                                <div className="flex items-center w-full sm:w-auto justify-end">
                                    <span className="text-sm text-gray-600">{entrega.venda?.dataHora ? formatDateTime(entrega.venda.dataHora) : '-'}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        )}
      </div>
    </Layout>
  );
};

export default DelivererDashboard;