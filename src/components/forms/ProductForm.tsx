import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { X, Package, DollarSign, Hash, Calendar, UploadCloud, Trash2 } from 'lucide-react';
import { showToast } from '../Toast';
import { useCategorias } from '../../hooks/useCategorias';
import { Produto, ProdutoData } from '../../types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<boolean>;
  initialData?: Produto | null;
  isEditing?: boolean;
}

type FormFields = {
  nome: string;
  descricao: string;
  precoCusto: string;
  categoriaId: string;
  codigoBarras: string;
  tipoMedida: string;
  dataValidade: string;
  ativo: boolean;
};

type FormErrors = Partial<Record<keyof FormFields | 'imagem', string>>;

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const { categorias, loading: loadingCategorias } = useCategorias();

  const initialFormFields = useMemo((): FormFields => ({
    nome: '',
    descricao: '',
    precoCusto: '',
    categoriaId: '',
    codigoBarras: '',
    tipoMedida: 'UN',
    dataValidade: '',
    ativo: true,
  }), []);

  const [formData, setFormData] = useState<FormFields>(initialFormFields);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
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
          dataValidade: initialData.dataValidade ? initialData.dataValidade.split('T')[0] : '',
          ativo: initialData.ativo ?? true,
        });
        setImagePreview(initialData.imagemUrl || null);
        setImageFile(null);
      } else {
        setFormData(initialFormFields);
        setImageFile(null);
        setImagePreview(null);
      }
      setErrors({});
    }
  }, [initialData, isEditing, isOpen, initialFormFields]);

  const unidadesMedida = [
    { value: 'KG', label: 'Quilograma (KG)' },
    { value: 'G', label: 'Grama (G)' },
    { value: 'UN', label: 'Unidade (UN)' },
    { value: 'BDJ', label: 'Bandeja (BDJ)' },
    { value: 'L', label: 'Litro (L)' },
    { value: 'ML', label: 'Mililitro (ML)' },
  ];

  const handleInputChange = (field: keyof FormFields, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (errors.imagem) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.imagem;
          return newErrors;
        });
      }
    } else {
      setImageFile(null);
      setImagePreview(isEditing && initialData?.imagemUrl ? initialData.imagemUrl : null);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('product-image-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    if (errors.imagem) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.imagem;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.precoCusto) newErrors.precoCusto = 'Preço de custo é obrigatório';
    const preco = parseFloat(formData.precoCusto);
    if (isNaN(preco) || preco <= 0) newErrors.precoCusto = 'Preço de custo deve ser um número positivo';
    if (!formData.categoriaId) newErrors.categoriaId = 'Categoria é obrigatória';

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      newErrors.imagem = 'A imagem não pode exceder 5MB.';
    }
    if (imageFile && !['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type)) {
      newErrors.imagem = 'Formato de imagem inválido (permitido: JPG, PNG, WebP).';
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
    // REMOVIDA: Variável 'success' não utilizada explicitamente aqui
    // let success = false;

    try {
      const submissionData = new FormData();
      const produtoJsonData: ProdutoData = {
        nome: formData.nome,
        descricao: formData.descricao,
        precoCusto: parseFloat(formData.precoCusto),
        categoria: { id: parseInt(formData.categoriaId, 10) },
        dataValidade: formData.dataValidade || undefined,
        tipoMedida: formData.tipoMedida,
        codigoBarras: formData.codigoBarras,
        ativo: formData.ativo,
      };

      submissionData.append('produto', JSON.stringify(produtoJsonData));

      if (imageFile) {
        submissionData.append('imagem', imageFile);
      }

      // Chama onSubmit e aguarda. O pai tratará o fechamento/recarregamento.
      await onSubmit(submissionData); // O pai agora recebe boolean, mas não precisamos usar aqui.

    } catch (err) {
      // O hook onSubmit já deve tratar e exibir o erro via toast
      console.error("Erro inesperado no handleSubmit do ProductForm:", err);
      // Opcional: showToast.error('Erro inesperado no formulário.');
    } finally {
      // Apenas desliga o loading.
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8 max-h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Editar Produto' : 'Adicionar Produto'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="nome-produto" className="block text-sm font-medium text-gray-700 mb-1">
                <Package className="w-4 h-4 inline mr-1 text-gray-500" /> Nome *
              </label>
              <input
                id="nome-produto"
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className={`input ${errors.nome ? 'input-error' : ''}`}
                placeholder="Ex: Maçã Gala Premium"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
            </div>
            <div>
              <label htmlFor="categoria-produto" className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select
                id="categoria-produto"
                value={formData.categoriaId}
                onChange={(e) => handleInputChange('categoriaId', e.target.value)}
                className={`select ${errors.categoriaId ? 'select-error' : ''}`}
                disabled={loadingCategorias}
              >
                <option value="">{loadingCategorias ? 'Carregando...' : 'Selecione...'}</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>{cat.nome}</option>
                ))}
              </select>
              {errors.categoriaId && <p className="text-red-500 text-xs mt-1">{errors.categoriaId}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="descricao-produto" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              id="descricao-produto"
              rows={3}
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              className="textarea"
              placeholder="Detalhes sobre o produto, origem, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="preco-custo" className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1 text-gray-500" /> Preço de Custo (R$) *
              </label>
              <input
                id="preco-custo"
                type="number" step="0.01" min="0.01"
                value={formData.precoCusto}
                onChange={(e) => handleInputChange('precoCusto', e.target.value)}
                className={`input ${errors.precoCusto ? 'input-error' : ''}`}
                placeholder="0.00"
              />
              {errors.precoCusto && <p className="text-red-500 text-xs mt-1">{errors.precoCusto}</p>}
            </div>
            <div>
              <label htmlFor="tipo-medida" className="block text-sm font-medium text-gray-700 mb-1">Unidade de Medida</label>
              <select
                id="tipo-medida"
                value={formData.tipoMedida}
                onChange={(e) => handleInputChange('tipoMedida', e.target.value)}
                className="select"
              >
                {unidadesMedida.map((unidade) => (
                  <option key={unidade.value} value={unidade.value}>{unidade.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="codigo-barras" className="block text-sm font-medium text-gray-700 mb-1">
                <Hash className="w-4 h-4 inline mr-1 text-gray-500" /> Código de Barras
              </label>
              <input
                id="codigo-barras"
                type="text"
                value={formData.codigoBarras}
                onChange={(e) => handleInputChange('codigoBarras', e.target.value)}
                className="input"
                placeholder="Ler ou digitar código"
              />
            </div>
            <div>
              <label htmlFor="data-validade" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1 text-gray-500" /> Data de Validade
              </label>
              <input
                id="data-validade"
                type="date"
                value={formData.dataValidade}
                onChange={(e) => handleInputChange('dataValidade', e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <UploadCloud className="w-4 h-4 inline mr-1 text-gray-500" /> Imagem do Produto
            </label>
            <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                {imagePreview ? (
                  <img src={imagePreview} alt="Pré-visualização" className="h-full w-full object-cover" />
                ) : (
                  <Package className="w-12 h-12" />
                )}
              </div>
              <div className="flex-1 w-full">
                <input
                  id="product-image-input"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer border border-gray-300 rounded-md"
                />
                {errors.imagem && <p className="text-red-500 text-xs mt-1">{errors.imagem}</p>}
                <p className="text-xs text-gray-500 mt-1">PNG, JPG ou WebP (Máx. 5MB).</p>
              </div>
              {(imagePreview || imageFile) && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="p-1.5 text-gray-500 hover:text-red-600 focus:outline-none rounded-full hover:bg-red-100"
                  title="Remover imagem"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox" id="ativo"
              checked={formData.ativo}
              onChange={(e) => handleInputChange('ativo', e.target.checked)}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-offset-0 focus:ring-2 focus:ring-green-500"
            />
            <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900 select-none">Produto ativo para venda</label>
          </div>

          <div className="flex justify-end space-x-3 pt-5 border-t mt-6 sticky bottom-0 bg-white py-4 px-6 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </>
              ) : (
                isEditing ? 'Atualizar Produto' : 'Criar Produto'
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm; }
        .input-error { @apply border-red-500 focus:ring-red-500; }
        .select { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm; }
        .select-error { @apply border-red-500 focus:ring-red-500; }
        .textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm; }
      `}</style>
    </div>
  );
};

export default ProductForm;