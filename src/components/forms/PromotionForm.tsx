import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { X, Package, UploadCloud, Trash2 } from 'lucide-react';
import { showToast } from '../Toast';
import { Promocao, PromocaoData, Produto } from '../../types';
import { useProdutos } from '../../hooks/useProdutos';

interface PromotionFormData {
  descricao: string;
  percentualDesconto: string;
  dataInicio: string;
  dataFim: string;
  ativa: boolean;
}

interface PromotionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<boolean>;
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
  const { produtos, loading: loadingProdutos } = useProdutos({ ativo: true });

  const initialFormState = useMemo((): PromotionFormData => ({
    descricao: '',
    percentualDesconto: '',
    dataInicio: '',
    dataFim: '',
    ativa: true,
  }), []);

  const [formData, setFormData] = useState<PromotionFormData>(initialFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [produtosSelecionados, setProdutosSelecionados] = useState<number[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof PromotionFormData | 'imagem' | 'produtos', string>>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setFormData({
          descricao: initialData.descricao || '',
          percentualDesconto: initialData.percentualDesconto?.toString() || '',
          dataInicio: initialData.dataInicio ? initialData.dataInicio.split('T')[0] : '',
          dataFim: initialData.dataFim ? initialData.dataFim.split('T')[0] : '',
          ativa: initialData.ativa ?? true,
        });
        setImagePreview(initialData.imagemUrl || null);
        setProdutosSelecionados(initialData.produtos?.map((p: Produto) => p.id) || []);
        setImageFile(null);
      } else {
        setFormData(initialFormState);
        setImageFile(null);
        setImagePreview(null);
        setProdutosSelecionados([]);
      }
      setErrors({});
      setSearchTerm('');
    }
  }, [initialData, isEditing, isOpen, initialFormState]);

  const handleInputChange = (field: keyof PromotionFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  const handleProductToggle = (produtoId: number) => {
    setProdutosSelecionados(prev => {
      const isSelected = prev.includes(produtoId);
      return isSelected ? prev.filter(id => id !== produtoId) : [...prev, produtoId];
    });
    if (errors.produtos) {
       setErrors(prev => ({ ...prev, produtos: undefined }));
    }
  };

  const filteredProdutos = useMemo(() => {
    return produtos.filter(produto =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [produtos, searchTerm]);


  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
      if (errors.imagem) setErrors(prev => ({ ...prev, imagem: undefined }));
    } else {
      setImageFile(null);
      setImagePreview(isEditing && initialData?.imagemUrl ? initialData.imagemUrl : null);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('promotion-image-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    if (errors.imagem) setErrors(prev => ({ ...prev, imagem: undefined }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof PromotionFormData | 'imagem' | 'produtos', string>> = {};
    if (!formData.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';
    if (!formData.percentualDesconto) newErrors.percentualDesconto = 'Percentual de desconto é obrigatório';
    const desconto = parseFloat(formData.percentualDesconto);
    if (isNaN(desconto) || desconto <= 0 || desconto > 100) newErrors.percentualDesconto = 'Desconto deve ser entre 1% e 100%';
    if (!formData.dataInicio) newErrors.dataInicio = 'Data de início é obrigatória';
    if (!formData.dataFim) newErrors.dataFim = 'Data de fim é obrigatória';
    if (formData.dataInicio && formData.dataFim && new Date(formData.dataFim) <= new Date(formData.dataInicio)) {
      newErrors.dataFim = 'Data de fim deve ser posterior à data de início';
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
      const submissionData = new FormData();
      
      const promocaoDto: PromocaoData = {
        ...formData,
        percentualDesconto: parseFloat(formData.percentualDesconto),
        produtoIds: produtosSelecionados
      };

      submissionData.append('promocao', JSON.stringify(promocaoDto));

      if (imageFile) {
        submissionData.append('imagem', imageFile);
      }
      
      await onSubmit(submissionData);
      
    } catch (err) {
      console.error("Erro no handleSubmit do PromotionForm:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Editar Promoção' : 'Criar Promoção'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none" disabled={loading}><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Promoção</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label htmlFor="promo-descricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <input id="promo-descricao" type="text" value={formData.descricao} onChange={(e) => handleInputChange('descricao', e.target.value)} className={`input ${errors.descricao ? 'input-error' : ''}`} placeholder="Ex: Promoção de Frutas da Semana" disabled={loading} />
                {errors.descricao && <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>}
              </div>
              <div>
                <label htmlFor="promo-desconto" className="block text-sm font-medium text-gray-700 mb-1">Desconto (%) *</label>
                <input id="promo-desconto" type="number" step="0.01" min="0.01" max="100" value={formData.percentualDesconto} onChange={(e) => handleInputChange('percentualDesconto', e.target.value)} className={`input ${errors.percentualDesconto ? 'input-error' : ''}`} placeholder="0.00" disabled={loading} />
                {errors.percentualDesconto && <p className="text-red-500 text-sm mt-1">{errors.percentualDesconto}</p>}
              </div>
              <div className="flex items-end pb-2">
                <input id="promo-ativa" type="checkbox" checked={formData.ativa} onChange={(e) => handleInputChange('ativa', e.target.checked)} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-offset-0 focus:ring-2 focus:ring-green-500" disabled={loading} />
                <label htmlFor="promo-ativa" className="ml-2 text-sm font-medium text-gray-900 select-none">Promoção ativa</label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Período da Promoção</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="promo-dataInicio" className="block text-sm font-medium text-gray-700 mb-1">Data de Início *</label>
                <input id="promo-dataInicio" type="date" value={formData.dataInicio} onChange={(e) => handleInputChange('dataInicio', e.target.value)} className={`input ${errors.dataInicio ? 'input-error' : ''}`} disabled={loading} />
                {errors.dataInicio && <p className="text-red-500 text-sm mt-1">{errors.dataInicio}</p>}
              </div>
              <div>
                <label htmlFor="promo-dataFim" className="block text-sm font-medium text-gray-700 mb-1">Data de Fim *</label>
                <input id="promo-dataFim" type="date" value={formData.dataFim} onChange={(e) => handleInputChange('dataFim', e.target.value)} className={`input ${errors.dataFim ? 'input-error' : ''}`} disabled={loading} />
                {errors.dataFim && <p className="text-red-500 text-sm mt-1">{errors.dataFim}</p>}
              </div>
            </div>
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <UploadCloud className="w-4 h-4 inline mr-1 text-gray-500" /> Imagem da Promoção (Opcional)
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 border">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Package className="w-10 h-10" />
                )}
              </div>
              <div className="flex-1">
                <input
                  id="promotion-image-input" type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer border border-gray-300 rounded-md"
                  disabled={loading}
                />
                {errors.imagem && <p className="text-red-500 text-xs mt-1">{errors.imagem}</p>}
              </div>
              {(imagePreview || imageFile) && (
                <button type="button" onClick={clearImage} className="p-1.5 text-gray-500 hover:text-red-600 focus:outline-none rounded-full hover:bg-red-100" title="Remover imagem" disabled={loading}>
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4"><Package className="w-5 h-5 inline mr-2" /> Produtos da Promoção</h3>
             <p className="text-sm text-gray-600 mb-3">Você pode associar produtos manualmente após criar a promoção, se desejar.</p>
            <div className="mb-4">
              <input type="text" placeholder="Buscar produtos para adicionar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full input" disabled={loading || loadingProdutos} />
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
                        <input type="checkbox" checked={produtosSelecionados.includes(produto.id)} onChange={() => handleProductToggle(produto.id)} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" disabled={loading} />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{produto.nome}</span>
                            <span className="text-sm text-gray-500">{produto.precoVenda ? `R$ ${produto.precoVenda.toFixed(2)}` : ''}</span>
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
            <div className="mt-2 text-sm text-gray-600">{produtosSelecionados.length} produto(s) selecionado(s)</div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t mt-6 sticky bottom-0 bg-white py-4 px-6 z-10">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" disabled={loading}>Cancelar</button>
            <button type="submit" disabled={loading} className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading && (
                 <svg key="spinner-svg" className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              )}
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Promoção')}
            </button>
          </div>
        </form>
      </div>
       <style>{`
        .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed; }
        .input-error { @apply border-red-500 focus:ring-red-500; }
        .select { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed; }
        .textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed; }
      `}</style>
    </div>
  );
};

export default PromotionForm;