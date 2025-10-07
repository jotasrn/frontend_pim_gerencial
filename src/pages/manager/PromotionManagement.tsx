import React from 'react';
import Layout from '../../components/Layout';
import { Plus, CreditCard as Edit2, Trash2 } from 'lucide-react';
import PromotionForm from '../../components/forms/PromotionForm';
import { showToast } from '../../components/Toast';

const PromotionManagement: React.FC = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [editingPromotion, setEditingPromotion] = React.useState(null);

  const promotions = [
    { 
      id: 1, 
      name: 'Frutas da Semana', 
      discount: 20, 
      startDate: '2024-03-01',
      endDate: '2024-03-15',
      status: 'Ativa'
    },
    { 
      id: 2, 
      name: 'Legumes em Oferta', 
      discount: 15, 
      startDate: '2024-03-10',
      endDate: '2024-03-20',
      status: 'Ativa'
    },
    { 
      id: 3, 
      name: 'Promoção Verduras', 
      discount: 25, 
      startDate: '2024-03-05',
      endDate: '2024-03-12',
      status: 'Encerrada'
    },
  ];

  const handleCreatePromotion = async (promotionData: any) => {
    // Aqui você faria a chamada para a API
    console.log('Criando promoção:', promotionData);
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleEditPromotion = (promotion: any) => {
    setEditingPromotion(promotion);
    setShowForm(true);
  };

  const handleUpdatePromotion = async (promotionData: any) => {
    // Aqui você faria a chamada para a API
    console.log('Atualizando promoção:', promotionData);
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleDeletePromotion = async (promotionId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta promoção?')) {
      try {
        // Aqui você faria a chamada para a API
        console.log('Excluindo promoção:', promotionId);
        showToast.success('Promoção excluída com sucesso!');
      } catch (error) {
        showToast.error('Erro ao excluir promoção');
      }
    }
  };

  return (
    <Layout title="Gerenciamento de Promoções">
      <div className="mb-6">
        <button 
          onClick={() => {
            setEditingPromotion(null);
            setShowForm(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Promoção
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Início</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fim</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promotions.map((promotion) => (
              <tr key={promotion.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{promotion.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{promotion.discount}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{promotion.startDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{promotion.endDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    promotion.status === 'Ativa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {promotion.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditPromotion(promotion)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar promoção"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDeletePromotion(promotion.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Excluir promoção"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Formulário */}
      <PromotionForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPromotion(null);
        }}
        onSubmit={editingPromotion ? handleUpdatePromotion : handleCreatePromotion}
        initialData={editingPromotion}
        isEditing={!!editingPromotion}
      />
    </Layout>
  );
};

export default PromotionManagement;