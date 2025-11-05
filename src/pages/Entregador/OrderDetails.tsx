import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { MapPin, Phone, Clock, Package, Truck, CheckCircle, AlertCircle, ArrowLeft, UserCircle } from 'lucide-react';
import { useEntregaDetalhes } from '../../hooks/useEntregaDetalhes';
import { formatCurrency, formatDateTime } from '../../utils/apiHelpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import { EntregaStatusUpdate } from '../../types';

const OrderDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { entrega, loading, error, atualizarStatusEntrega, carregarDetalhes } = useEntregaDetalhes(Number(id));

  const [nomeRecebedor, setNomeRecebedor] = useState('');
  const [docRecebedor, setDocRecebedor] = useState('');
  const [relatoProblema, setRelatoProblema] = useState('');
  const [formError, setFormError] = useState('');

  const [isStartingRoute, setIsStartingRoute] = useState(false);

  if (loading && !entrega) {
    return <Layout title="Carregando Pedido..."><LoadingSpinner text="Carregando detalhes..." /></Layout>;
  }

  if (error || !entrega) {
    return (
      <Layout title="Erro no Pedido">
        <div className="text-center p-6 text-red-600 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="mx-auto h-12 w-12" />
          <p className="mt-4 font-semibold">{error || "Não foi possível carregar os detalhes da entrega."}</p>
          <button onClick={() => navigate('/entregador')} className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Entregas
          </button>
        </div>
      </Layout>
    );
  }

  const { venda } = entrega;
  const cliente = venda?.cliente;
  const endereco = venda?.enderecoEntrega;
  const itens = venda?.itens || [];

  const handleUpdateStatus = async (novoStatus: string) => {
    setFormError('');

    if (novoStatus === 'ENTREGUE' && (!nomeRecebedor.trim() || !docRecebedor.trim())) {
      setFormError('Para marcar como "Entregue", o nome e o documento do recebedor são obrigatórios.');
      return;
    }

    if (novoStatus === 'PROBLEMA' && !relatoProblema.trim()) {
      setFormError('Para reportar um problema, o motivo é obrigatório.');
      return;
    }

    const data: EntregaStatusUpdate & { relatoProblema?: string } = {
      status: novoStatus,
      nomeRecebedor: novoStatus === 'ENTREGUE' ? nomeRecebedor : undefined,
      documentoRecebedor: novoStatus === 'ENTREGUE' ? docRecebedor : undefined,
      relatoProblema: novoStatus === 'PROBLEMA' ? relatoProblema : undefined
    };

    const success = await atualizarStatusEntrega(data);

    if (success) {
      if (novoStatus === 'ENTREGUE' || novoStatus === 'PROBLEMA') {
        navigate('/entregador');
      } else {
        carregarDetalhes();
      }
    }
  };

  const handleStartRoute = async () => {
    setIsStartingRoute(true);
    const success = await atualizarStatusEntrega({ status: 'EM_ROTA' });

    if (success && endereco) {
      const { rua, numero, bairro, cidade, estado } = endereco;
      const addressString = `${rua}, ${numero} - ${bairro}, ${cidade} - ${estado}`;
      const encodedAddress = encodeURIComponent(addressString);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

      window.open(url, '_blank');

      carregarDetalhes();
    }
    setIsStartingRoute(false);
  };

  const getStatusComponent = () => {
    switch (entrega.status) {
      case 'AGUARDANDO_COLETA':
        return (
          <button
            onClick={handleStartRoute}
            disabled={loading || isStartingRoute}
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isStartingRoute ? (
              <svg key="spinner-svg-route" className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Truck className="w-5 h-5 mr-2" />
            )}
            {isStartingRoute ? 'Iniciando...' : 'Iniciar Entrega (Abrir Mapa)'}
          </button>
        );
      case 'EM_ROTA':
        return (
          <>
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner space-y-4">
              <h3 className="text-base font-semibold text-gray-800">Finalizar Entrega:</h3>
              <div>
                <label htmlFor="nomeRecebedor" className="block text-sm font-medium text-gray-700">Nome do Recebedor *</label>
                <input
                  type="text"
                  id="nomeRecebedor"
                  value={nomeRecebedor}
                  onChange={(e) => {
                    setNomeRecebedor(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className={`input mt-1 w-full ${formError && !nomeRecebedor ? 'input-error' : ''}`}
                  placeholder="Quem recebeu o pedido?"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="docRecebedor" className="block text-sm font-medium text-gray-700">Documento do Recebedor (RG/CPF) *</label>
                <input
                  type="text"
                  id="docRecebedor"
                  value={docRecebedor}
                  onChange={(e) => {
                    setDocRecebedor(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className={`input mt-1 w-full ${formError && !docRecebedor ? 'input-error' : ''}`}
                  placeholder="Documento de quem recebeu"
                  disabled={loading}
                />
              </div>
              {formError && formError.includes('Entregue') && <p className="text-red-600 text-sm">{formError}</p>}
              <button
                onClick={() => handleUpdateStatus('ENTREGUE')}
                disabled={loading}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? (
                  <svg key="spinner-svg-deliver" className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2" />
                )}
                Confirmar Entrega
              </button>
            </div>

            <div className="bg-red-50 p-4 rounded-lg shadow-inner space-y-4 mt-4 border border-red-200">
              <h3 className="text-base font-semibold text-red-800">Reportar Problema:</h3>
              <div>
                <label htmlFor="relatoProblema" className="block text-sm font-medium text-gray-700">Motivo (Obrigatório) *</label>
                <textarea
                  id="relatoProblema"
                  rows={3}
                  value={relatoProblema}
                  onChange={(e) => {
                    setRelatoProblema(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className={`textarea mt-1 w-full ${formError && !relatoProblema ? 'input-error' : ''}`}
                  placeholder="Ex: Cliente ausente, endereço não localizado..."
                  disabled={loading}
                />
              </div>
              {formError && formError.includes('Problema') && <p className="text-red-600 text-sm">{formError}</p>}
              <button
                onClick={() => handleUpdateStatus('PROBLEMA')}
                disabled={loading}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? (
                  <svg key="spinner-svg-problem" className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                {loading ? 'Enviando...' : 'Enviar Problema'}
              </button>
            </div>
          </>
        );
      default:
        return (
          <p className="text-center text-lg font-medium text-gray-700">
            Status: {entrega.status.replace('_', ' ')}
          </p>
        );
    }
  };

  return (
    <Layout title={`Pedido #${venda?.id || id}`}>
      <div className="space-y-6 max-w-4xl mx-auto">

        <button onClick={() => navigate(-1)} className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para lista
        </button>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status: {entrega.status.replace('_', ' ')}</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Package className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-600 w-28">Pedido:</span>
              <span className="text-sm text-gray-800 font-semibold">#{venda?.id}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-600 w-28">Horário:</span>
              <span className="text-sm text-gray-800">{venda?.dataHora ? formatDateTime(venda.dataHora) : '-'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informações do Cliente</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <UserCircle className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 font-medium">{cliente?.usuario?.nomeCompleto ?? 'Cliente não informado'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900">{endereco?.rua}, {endereco?.numero}</p>
                {endereco?.complemento && <p className="text-gray-500">{endereco.complemento}</p>}
                <p className="text-gray-500">{endereco?.bairro}, {endereco?.cidade} - {endereco?.estado}</p>
                <p className="text-gray-500">{endereco?.cep}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
              <p className="text-gray-900">{cliente?.telefone || 'Telefone não cadastrado'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Itens do Pedido ({itens.length})</h2>
          <div className="divide-y divide-gray-200">
            {itens.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{item.produto?.nome || 'Produto não encontrado'}</p>
                  <p className="text-sm text-gray-500">{item.quantidade} x {formatCurrency(item.precoUnitario)}</p>
                </div>
                <p className="text-base font-medium text-gray-900">
                  {formatCurrency(item.precoUnitario * item.quantidade)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-900">Total</p>
              <p className="text-xl font-bold text-gray-900">{venda ? formatCurrency(venda.valorTotal) : 'R$ 0,00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ações de Entrega</h2>
          {getStatusComponent()}
        </div>
      </div>
      <style>{`
        .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed; }
        .input-error { @apply border-red-500 focus:ring-red-500; }
        .textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed; }indented`}</style>
    </Layout>
  );
};

export default OrderDetails;