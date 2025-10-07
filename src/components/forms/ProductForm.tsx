import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Hash, Calendar, Upload } from 'lucide-react';
import { showToast } from '../Toast';
import { useCategorias } from '../../hooks/useCategorias';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const { categorias, loading: loadingCategorias } = useCategorias();
  
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    precoCusto: initialData?.precoCusto || '',
    precoVenda: initialData?.precoVenda || '',
    categoriaId: initialData?.categoriaId || '',
    fornecedorId: initialData?.fornecedorId || '',
    codigoBarras: initialData?.codigoBarras || '',
    unidadeMedida: initialData?.unidadeMedida || 'kg',
    quantidadeEstoque: initialData?.quantidadeEstoque || '',
    estoqueMinimo: initialData?.estoqueMinimo || '',
    dataValidade: initialData?.dataValidade || '',
    ativo: initialData?.ativo ?? true,
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imagemUrl || null);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const unidadesMedida = [
    { value: 'kg', label: 'Quilograma (kg)' },
    { value: 'g', label: 'Grama (g)' },
    { value: 'unid', label: 'Unidade' },
    { value: 'maço', label: 'Maço' },
    { value: 'dúzia', label: 'Dúzia' },
    { value: 'litro', label: 'Litro (L)' },
    { value: 'ml', label: 'Mililitro (ml)' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        showToast.error('Imagem deve ter no máximo 5MB');
        return;
      }
      
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.precoCusto) newErrors.precoCusto = 'Preço de custo é obrigatório';
    if (!formData.precoVenda) newErrors.precoVenda = 'Preço de venda é obrigatório';
    if (!formData.categoriaId) newErrors.categoriaId = 'Categoria é obrigatória';
    if (!formData.quantidadeEstoque) newErrors.quantidadeEstoque = 'Quantidade em estoque é obrigatória';
    if (!formData.estoqueMinimo) newErrors.estoqueMinimo = 'Estoque mínimo é obrigatório';

    if (formData.precoCusto && formData.precoVenda) {
      if (parseFloat(formData.precoVenda) <= parseFloat(formData.precoCusto)) {
        newErrors.precoVenda = 'Preço de venda deve ser maior que o preço de custo';
      }
    }

    if (formData.quantidadeEstoque && parseFloat(formData.quantidadeEstoque) < 0) {
      newErrors.quantidadeEstoque = 'Quantidade não pode ser negativa';
    }

    if (formData.estoqueMinimo && parseFloat(formData.estoqueMinimo) < 0) {
      newErrors.estoqueMinimo = 'Estoque mínimo não pode ser negativo';
    }

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
      const submitData = {
        ...formData,
        precoCusto: parseFloat(formData.precoCusto),
        precoVenda: parseFloat(formData.precoVenda),
        quantidadeEstoque: parseFloat(formData.quantidadeEstoque),
        estoqueMinimo: parseFloat(formData.estoqueMinimo),
        categoriaId: parseInt(formData.categoriaId),
        fornecedorId: formData.fornecedorId ? parseInt(formData.fornecedorId) : null,
      };

      if (image) {
        submitData.imagem = image;
      }
      
      await onSubmit(submitData);
      showToast.success(isEditing ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
      onClose();
    } catch (error) {
      showToast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Produto' : 'Adicionar Produto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Package className="w-4 h-4 inline mr-2" />
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.nome ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Maçã Gala Premium"
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Descrição detalhada do produto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) => handleInputChange('categoriaId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.categoriaId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loadingCategorias}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
                {errors.categoriaId && <p className="text-red-500 text-sm mt-1">{errors.categoriaId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidade de Medida</label>
                <select
                  value={formData.unidadeMedida}
                  onChange={(e) => handleInputChange('unidadeMedida', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {unidadesMedida.map((unidade) => (
                    <option key={unidade.value} value={unidade.value}>
                      {unidade.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Preços */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preços</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Preço de Custo (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precoCusto}
                  onChange={(e) => handleInputChange('precoCusto', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.precoCusto ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.precoCusto && <p className="text-red-500 text-sm mt-1">{errors.precoCusto}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precoVenda}
                  onChange={(e) => handleInputChange('precoVenda', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.precoVenda ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.precoVenda && <p className="text-red-500 text-sm mt-1">{errors.precoVenda}</p>}
              </div>
            </div>
          </div>

          {/* Estoque */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Controle de Estoque</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade em Estoque *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantidadeEstoque}
                  onChange={(e) => handleInputChange('quantidadeEstoque', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.quantidadeEstoque ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.quantidadeEstoque && <p className="text-red-500 text-sm mt-1">{errors.quantidadeEstoque}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Mínimo *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.estoqueMinimo}
                  onChange={(e) => handleInputChange('estoqueMinimo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.estoqueMinimo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.estoqueMinimo && <p className="text-red-500 text-sm mt-1">{errors.estoqueMinimo}</p>}
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Adicionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Hash className="w-4 h-4 inline mr-2" />
                  Código de Barras
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
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Data de Validade
                </label>
                <input
                  type="date"
                  value={formData.dataValidade}
                  onChange={(e) => handleInputChange('dataValidade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => handleInputChange('ativo', e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
                  Produto ativo
                </label>
              </div>
            </div>
          </div>

          {/* Upload de Imagem */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Imagem do Produto</h3>
            <div className="space-y-4">
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Clique para fazer upload de uma imagem
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PNG, JPG, GIF até 5MB
                      </span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Produto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;