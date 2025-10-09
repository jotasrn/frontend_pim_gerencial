import React, { useState, useEffect, useMemo } from 'react';
import { X, Package, DollarSign, Hash, Calendar } from 'lucide-react';
import { showToast } from '../Toast';
import { useCategorias } from '../../hooks/useCategorias';
import { Produto, ProdutoData } from '../../types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: ProdutoData) => Promise<void>;
  initialData?: Produto | null;
  isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const { categorias, loading: loadingCategorias } = useCategorias();

  const initialFormState = useMemo(() => ({
    nome: '',
    descricao: '',
    precoCusto: '',
    categoriaId: '',
    codigoBarras: '',
    tipoMedida: 'UN',
    dataValidade: '',
    ativo: true,
  }), []);

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialFormState, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setFormData({
          nome: initialData.nome || '',
          descricao: initialData.descricao || '',
          precoCusto: initialData.precoCusto?.toString() || '',
          categoriaId: initialData.categoria?.id?.toString() || '',
          codigoBarras: initialData.codigoBarras || '',
          tipoMedida: initialData.tipoMedida || 'UN',
          dataValidade: initialData.dataValidade || '',
          ativo: initialData.ativo ?? true,
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
    }
  }, [initialData, isEditing, isOpen, initialFormState]);

  const unidadesMedida = [
    { value: 'KG', label: 'Quilograma (KG)' },
    { value: 'G', label: 'Grama (G)' },
    { value: 'UN', label: 'Unidade (UN)' },
    { value: 'BDJ', label: 'Bandeja (BDJ)' },
    { value: 'L', label: 'Litro (L)' },
    { value: 'ML', label: 'Mililitro (ML)' },
  ];

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.precoCusto) newErrors.precoCusto = 'Preço de custo é obrigatório';
    if (parseFloat(formData.precoCusto) <= 0) newErrors.precoCusto = 'Preço de custo deve ser positivo';
    if (!formData.categoriaId) newErrors.categoriaId = 'Categoria é obrigatória';

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
      const submitData: ProdutoData = {
        nome: formData.nome,
        descricao: formData.descricao,
        precoCusto: parseFloat(formData.precoCusto),
        categoria: {
          id: parseInt(formData.categoriaId)
        },
        dataValidade: formData.dataValidade || undefined,
        tipoMedida: formData.tipoMedida,
        codigoBarras: formData.codigoBarras,
        ativo: formData.ativo,
      };

      await onSubmit(submitData);
      onClose();
    } catch {
      showToast.error('Erro ao salvar produto. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Editar Produto' : 'Adicionar Produto'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Package className="w-4 h-4 inline mr-2" /> Nome do Produto *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ex: Maçã Gala Premium"
            />
            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              rows={3}
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Descrição detalhada do produto..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select
                value={formData.categoriaId}
                onChange={(e) => handleInputChange('categoriaId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.categoriaId ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loadingCategorias}
              >
                <option value="">{loadingCategorias ? 'Carregando...' : 'Selecione'}</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>{cat.nome}</option>
                ))}
              </select>
              {errors.categoriaId && <p className="text-red-500 text-sm mt-1">{errors.categoriaId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade de Medida</label>
              <select
                value={formData.tipoMedida}
                onChange={(e) => handleInputChange('tipoMedida', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {unidadesMedida.map((unidade) => (
                  <option key={unidade.value} value={unidade.value}>{unidade.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="w-4 h-4 inline mr-2" /> Preço de Custo (R$) *
            </label>
            <input
              type="number" step="0.01" min="0"
              value={formData.precoCusto}
              onChange={(e) => handleInputChange('precoCusto', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.precoCusto ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="0.00"
            />
            {errors.precoCusto && <p className="text-red-500 text-sm mt-1">{errors.precoCusto}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Hash className="w-4 h-4 inline mr-2" /> Código de Barras
              </label>
              <input
                type="text"
                value={formData.codigoBarras}
                onChange={(e) => handleInputChange('codigoBarras', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Código de barras do produto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-2" /> Data de Validade
              </label>
              <input
                type="date"
                value={formData.dataValidade}
                onChange={(e) => handleInputChange('dataValidade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox" id="ativo"
              checked={formData.ativo}
              onChange={(e) => handleInputChange('ativo', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">Produto ativo para venda</label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar Produto' : 'Criar Produto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;