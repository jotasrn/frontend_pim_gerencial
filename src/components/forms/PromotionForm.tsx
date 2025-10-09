import React, { useState, useEffect, useMemo } from 'react';
import { X, Package } from 'lucide-react'; // Ícones não utilizados foram removidos
import { showToast } from '../Toast';
import { useProdutos } from '../../hooks/useProdutos';
import { Promocao, PromocaoData } from '../../types';

// --- Interfaces para Tipagem ---

interface PromotionFormData {
  descricao: string;
  percentualDesconto: string;
  dataInicio: string;
  dataFim: string;
  ativa: boolean;
  produtosSelecionados: number[];
}

interface PromotionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promotionData: PromocaoData) => Promise<void>;
  initialData?: Promocao | null;
  isEditing?: boolean;
}

const PromotionForm: React.FC<PromotionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const { produtos, loading: loadingProdutos } = useProdutos();

  const initialFormState = useMemo((): PromotionFormData => ({
    descricao: '',
    percentualDesconto: '',
    dataInicio: '',
    dataFim: '',
    ativa: true,
    produtosSelecionados: [],
  }), []);

  const [formData, setFormData] = useState<PromotionFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof PromotionFormData | 'produtos', string>>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setFormData({
          descricao: initialData.descricao || '',
          percentualDesconto: initialData.percentualDesconto?.toString() || '',
          dataInicio: initialData.dataInicio || '',
          dataFim: initialData.dataFim || '',
          ativa: initialData.ativa ?? true,
          produtosSelecionados: initialData.produtos?.map((p) => p.id) || [],
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
      setSearchTerm('');
    }
  }, [initialData, isEditing, isOpen, initialFormState]);

  const handleInputChange = (field: keyof PromotionFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleProductToggle = (produtoId: number) => {
    setFormData(prev => {
      const isSelected = prev.produtosSelecionados.includes(produtoId);
      return {
        ...prev,
        produtosSelecionados: isSelected
          ? prev.produtosSelecionados.filter(id => id !== produtoId)
          : [...prev.produtosSelecionados, produtoId],
      };
    });
  };

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: Partial<Record<keyof PromotionFormData | 'produtos', string>> = {};
    if (!formData.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';
    if (!formData.percentualDesconto) newErrors.percentualDesconto = 'Percentual de desconto é obrigatório';
    const desconto = parseFloat(formData.percentualDesconto);
    if (isNaN(desconto) || desconto <= 0 || desconto > 100) newErrors.percentualDesconto = 'Desconto deve ser entre 1% e 100%';
    if (!formData.dataInicio) newErrors.dataInicio = 'Data de início é obrigatória';
    if (!formData.dataFim) newErrors.dataFim = 'Data de fim é obrigatória';
    if (formData.dataInicio && formData.dataFim && new Date(formData.dataFim) <= new Date(formData.dataInicio)) {
      newErrors.dataFim = 'Data de fim deve ser posterior à data de início';
    }
    if (formData.produtosSelecionados.length === 0) newErrors.produtos = 'Selecione pelo menos um produto';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    try {
      const { produtosSelecionados, ...restFormData } = formData;
      const submitData: PromocaoData = {
        ...restFormData,
        percentualDesconto: parseFloat(formData.percentualDesconto),
        produtoIds: produtosSelecionados,
      };
      await onSubmit(submitData);
      onClose();
    } catch {
      showToast.error('Erro ao salvar promoção');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Editar Promoção' : 'Criar Promoção'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Informações da Promoção */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Promoção</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição da Promoção *</label>
                <input type="text" value={formData.descricao} onChange={(e) => handleInputChange('descricao', e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.descricao ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ex: Promoção de Frutas da Semana" />
                {errors.descricao && <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Percentual de Desconto (%) *</label>
                <input type="number" step="0.01" min="0.01" max="100" value={formData.percentualDesconto} onChange={(e) => handleInputChange('percentualDesconto', e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.percentualDesconto ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00" />
                {errors.percentualDesconto && <p className="text-red-500 text-sm mt-1">{errors.percentualDesconto}</p>}
              </div>
              <div className="flex items-center self-end">
                <input type="checkbox" id="ativa" checked={formData.ativa} onChange={(e) => handleInputChange('ativa', e.target.checked)} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <label htmlFor="ativa" className="ml-2 text-sm text-gray-700">Promoção ativa</label>
              </div>
            </div>
          </div>

          {/* Período da Promoção */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Período da Promoção</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início *</label>
                <input type="date" value={formData.dataInicio} onChange={(e) => handleInputChange('dataInicio', e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.dataInicio ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.dataInicio && <p className="text-red-500 text-sm mt-1">{errors.dataInicio}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim *</label>
                <input type="date" value={formData.dataFim} onChange={(e) => handleInputChange('dataFim', e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.dataFim ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.dataFim && <p className="text-red-500 text-sm mt-1">{errors.dataFim}</p>}
              </div>
            </div>
          </div>

          {/* Seleção de Produtos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4"><Package className="w-5 h-5 inline mr-2" /> Produtos da Promoção *</h3>
            <div className="mb-4">
              <input type="text" placeholder="Buscar produtos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
              {loadingProdutos ? (
                <div className="p-4 text-center text-gray-500">Carregando produtos...</div>
              ) : filteredProdutos.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Nenhum produto encontrado</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredProdutos.map((produto) => (
                    <div key={produto.id} className="p-3 hover:bg-gray-50">
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.produtosSelecionados.includes(produto.id)} onChange={() => handleProductToggle(produto.id)} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{produto.nome}</span>
                            <span className="text-sm text-gray-500">R$ {produto.precoVenda?.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-gray-500">{produto.categoria?.nome}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.produtos && <p className="text-red-500 text-sm mt-1">{errors.produtos}</p>}
            <div className="mt-2 text-sm text-gray-600">{formData.produtosSelecionados.length} produto(s) selecionado(s)</div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Promoção')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionForm;