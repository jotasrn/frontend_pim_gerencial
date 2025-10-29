import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2 } from 'lucide-react';
import PromotionForm from '../../components/forms/PromotionForm';
import { usePromocoes } from '../../hooks/usePromocoes';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Promocao, PromocaoData } from '../../types';
import { formatDate } from '../../utils/apiHelpers';

const PromotionManagement: React.FC = () => {
  const { promocoes, loading, criarPromocao, atualizarPromocao, removerPromocao } = usePromocoes();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promocao | null>(null);

  const handleOpenCreateForm = () => {
    setEditingPromotion(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (promocao: Promocao) => {
    setEditingPromotion(promocao);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (promotionData: PromocaoData) => {
    let success = false;
    if (editingPromotion) {
      success = await atualizarPromocao(editingPromotion.id, promotionData);
    } else {
      success = await criarPromocao(promotionData);
    }
    
    if (success) {
      setIsFormOpen(false);
    }
  };

  const handleDeletePromotion = (promotionId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta promoção?')) {
      removerPromocao(promotionId);
    }
  };

  return (
    <Layout title="Gerenciamento de Promoções">
      <div className="mb-6">
        <button 
          onClick={handleOpenCreateForm}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Promoção
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        {loading && promocoes.length === 0 ? (
          <LoadingSpinner text="Carregando promoções..." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Desconto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Início</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* MAPEIA OS DADOS CORRETOS DE PROMOÇÕES */}
              {promocoes.map((promotion) => (
                <tr key={promotion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{promotion.descricao}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{promotion.percentualDesconto}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(promotion.dataInicio)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(promotion.dataFim)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      promotion.ativa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {promotion.ativa ? 'Ativa' : 'Encerrada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-4">
                      <button onClick={() => handleOpenEditForm(promotion)} className="text-blue-600 hover:text-blue-900" title="Editar promoção">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDeletePromotion(promotion.id)} className="text-red-600 hover:text-red-900" title="Excluir promoção">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PromotionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingPromotion}
        isEditing={!!editingPromotion}
      />
    </Layout>
  );
};

export default PromotionManagement;