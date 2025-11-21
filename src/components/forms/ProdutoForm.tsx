import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { X, Package, DollarSign, Hash, Calendar, UploadCloud, Trash2, Archive, Truck, Plus } from 'lucide-react';
import { showToast } from '../Toast';
import { useCategorias } from '../../hooks/useCategorias';
import { useFornecedores } from '../../hooks/useFornecedores';
import { useEstoque } from '../../hooks/useEstoque';
import { Produto, ProdutoData, CategoriaData } from '../../types';
import { produtoService } from '../../services/produtoService';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoriaData) => Promise<boolean>;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNome('');
      setDescricao('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    setError('');
    setLoading(true);
    const success = await onSubmit({ nome, descricao, ativo: true });
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Nova Categoria</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="cat-modal-nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
            <input
              id="cat-modal-nome" type="text" value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`input ${error ? 'input-error' : ''}`}
              disabled={loading}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div>
            <label htmlFor="cat-modal-descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <textarea
              id="cat-modal-descricao" rows={3} value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="textarea"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<boolean>;
  produtoIdToEdit?: number | null;
}

type FormFields = {
  nome: string;
  descricao: string;
  precoCusto: string;
  categoriaId: string;
  codigoBarras: string;
  tipoMedida: string;
  dataValidade: string;
  dataColheita: string;
  quantidadeAtual: string;
  quantidadeMinima: string;
  fornecedorIds: number[];
  ativo: boolean;
};

type FormErrors = Partial<Record<keyof FormFields | 'imagem' | 'addStock', string>>;

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  produtoIdToEdit,
}) => {
  const { categorias, loading: loadingCategorias, criarCategoria, carregarCategorias } = useCategorias();
  const { fornecedores, loading: loadingFornecedores } = useFornecedores();
  const { adicionarEstoque, isAddingStock } = useEstoque();

  const initialFormFields = useMemo((): FormFields => ({
    nome: '',
    descricao: '',
    precoCusto: '',
    categoriaId: '',
    codigoBarras: '',
    tipoMedida: 'UN',
    dataValidade: '',
    dataColheita: '',
    quantidadeAtual: '0',
    quantidadeMinima: '10',
    fornecedorIds: [],
    ativo: true,
  }), []);

  const [formData, setFormData] = useState<FormFields>(initialFormFields);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [loading, setLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [produtoCarregado, setProdutoCarregado] = useState<Produto | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');

  const [showAddStock, setShowAddStock] = useState(false);
  const [estoqueParaAdicionar, setEstoqueParaAdicionar] = useState('');
  const [addStockError, setAddStockError] = useState<string | null>(null);

  const isEditing = !!produtoIdToEdit;

  useEffect(() => {
    const carregarProduto = async (id: number) => {
      setLocalLoading(true);
      setErrors({});
      setFormData(initialFormFields);
      setImageFile(null);
      setImagePreview(null);
      setProdutoCarregado(null);

      try {
        const produto = await produtoService.buscarPorId(id);
        setFormData({
          nome: produto.nome || '',
          descricao: produto.descricao || '',
          precoCusto: produto.precoCusto?.toString() || '',
          categoriaId: produto.categoria?.id?.toString() || '',
          codigoBarras: produto.codigoBarras || '',
          tipoMedida: produto.tipoMedida || 'UN',
          dataValidade: produto.dataValidade ? produto.dataValidade.split('T')[0] : '',
          dataColheita: produto.dataColheita ? produto.dataColheita.split('T')[0] : '',
          quantidadeAtual: produto.estoque?.quantidadeAtual?.toString() || '0',
          quantidadeMinima: produto.estoque?.quantidadeMinima?.toString() || '10',
          fornecedorIds: produto.fornecedores?.map(f => f.id) || [],
          ativo: produto.ativo ?? true,
        });
        setImagePreview(produto.imagemUrl || null);
        setProdutoCarregado(produto);
      } catch (err: unknown) {
        let errorMessage = 'Erro desconhecido ao carregar produto.';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        showToast.error(`Erro ao carregar produto: ${errorMessage}`);
        setErrors({ nome: 'Erro ao carregar dados do produto.' });
        onClose();
      } finally {
        setLocalLoading(false);
      }
    };

    if (isOpen) {
      if (isEditing && produtoIdToEdit) {
        carregarProduto(produtoIdToEdit);
      } else {
        setLocalLoading(false);
        setProdutoCarregado(null);
        setFormData(initialFormFields);
        setImageFile(null);
        setImagePreview(null);
        setErrors({});
      }
      setSupplierSearchTerm('');
      setShowAddStock(false);
      setEstoqueParaAdicionar('');
      setAddStockError(null);
    }
  }, [produtoIdToEdit, isEditing, isOpen, initialFormFields, onClose]);

  const unidadesMedida = [
    { value: 'KG', label: 'Quilograma (KG)' },
    { value: 'G', label: 'Grama (G)' },
    { value: 'UN', label: 'Unidade (UN)' },
    { value: 'BDJ', label: 'Bandeja (BDJ)' },
    { value: 'L', label: 'Litro (L)' },
    { value: 'ML', label: 'Mililitro (ML)' },
  ];

  const handleInputChange = (field: keyof FormFields, value: string | boolean | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
      setImagePreview(isEditing && produtoCarregado?.imagemUrl ? produtoCarregado.imagemUrl : null);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('product-image-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    if (errors.imagem) setErrors(prev => ({ ...prev, imagem: undefined }));
  };

  const handleCreateCategorySubmit = async (newCategoryData: CategoriaData): Promise<boolean> => {
    const success = await criarCategoria(newCategoryData);
    if (success) {
      await carregarCategorias();
      showToast.success(`Categoria "${newCategoryData.nome}" criada!`);
    }
    return success;
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.precoCusto) newErrors.precoCusto = 'Preço de custo é obrigatório';
    const preco = parseFloat(formData.precoCusto);
    if (isNaN(preco) || preco <= 0) newErrors.precoCusto = 'Preço de custo deve ser positivo';
    if (!formData.categoriaId) newErrors.categoriaId = 'Categoria é obrigatória';

    const qtdMin = parseInt(formData.quantidadeMinima, 10);
    if (isNaN(qtdMin) || qtdMin < 0) newErrors.quantidadeMinima = 'Estoque mínimo deve ser 0 ou mais';

    if (!isEditing) {
      const qtdAtual = parseInt(formData.quantidadeAtual, 10);
      if (isNaN(qtdAtual) || qtdAtual < 0) newErrors.quantidadeAtual = 'Estoque inicial deve ser 0 ou mais';
    }

    if (imageFile && imageFile.size > 10 * 1024 * 1024) {
      newErrors.imagem = 'A imagem não pode exceder 10MB.';
    }
    if (imageFile && !['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type)) {
      newErrors.imagem = 'Formato de imagem inválido (permitido: JPG, PNG, WebP).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdicionarEstoqueClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setAddStockError(null);

    const quantidade = parseInt(estoqueParaAdicionar, 10);
    if (isNaN(quantidade) || quantidade <= 0) {
      setAddStockError('A quantidade a adicionar deve ser um número positivo.');
      return;
    }
    if (!formData.dataColheita) {
      setAddStockError('Data de Colheita/Produção é obrigatória para repor estoque.');
      setErrors(prev => ({ ...prev, dataColheita: 'Campo obrigatório' }));
      return;
    }
    if (!formData.dataValidade) {
      setAddStockError('Data de Validade é obrigatória para repor estoque.');
      setErrors(prev => ({ ...prev, dataValidade: 'Campo obrigatório' }));
      return;
    }

    if (!isEditing || !produtoIdToEdit) return;

    const estoqueAtualizado = await adicionarEstoque(produtoIdToEdit, quantidade);

    if (estoqueAtualizado) {
      setFormData(prev => ({
        ...prev,
        quantidadeAtual: estoqueAtualizado.quantidadeAtual.toString()
      }));
      setEstoqueParaAdicionar('');
      setShowAddStock(false);
      setAddStockError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    let success = false;

    try {
      const submissionData = new FormData();
      const produtoJsonData: ProdutoData = {
        nome: formData.nome,
        descricao: formData.descricao,
        precoCusto: parseFloat(formData.precoCusto),
        categoria: { id: parseInt(formData.categoriaId, 10) },
        dataValidade: formData.dataValidade || undefined,
        dataColheita: formData.dataColheita || undefined,
        tipoMedida: formData.tipoMedida,
        codigoBarras: formData.codigoBarras,
        ativo: formData.ativo,
        quantidadeMinima: parseInt(formData.quantidadeMinima, 10),
        fornecedorIds: formData.fornecedorIds,
      };

      if (!isEditing) {
        produtoJsonData.quantidadeAtual = parseInt(formData.quantidadeAtual, 10);
      }

      submissionData.append('produto', JSON.stringify(produtoJsonData));

      if (imageFile) {
        submissionData.append('imagem', imageFile);
      }

      success = await onSubmit(submissionData);

    } catch (err) {
      console.error("Erro no handleSubmit do ProductForm:", err);
      success = false;
    } finally {
      setLoading(false);
      if (success) {
        setTimeout(() => {
          onClose();
        }, 50);
      }
    }
  };

  const selectedSuppliers = useMemo(() => {
    return fornecedores.filter(f => formData.fornecedorIds.includes(f.id));
  }, [fornecedores, formData.fornecedorIds]);

  const availableSuppliers = useMemo(() => {
    return fornecedores.filter(f =>
      !formData.fornecedorIds.includes(f.id) &&
      (supplierSearchTerm === '' || // Permite termo vazio para mostrar todos quando necessário
       f.nome.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
       (f.cnpj && f.cnpj.includes(supplierSearchTerm)))
    );
  }, [fornecedores, supplierSearchTerm, formData.fornecedorIds]);

  const handleFornecedorAdd = (id: number) => {
    if (!formData.fornecedorIds.includes(id)) {
      handleInputChange('fornecedorIds', [...formData.fornecedorIds, id]);
      setSupplierSearchTerm('');
    }
  };

  const handleFornecedorRemove = (id: number) => {
    handleInputChange('fornecedorIds', formData.fornecedorIds.filter(fid => fid !== id));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl my-8 max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-5 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{isEditing ? 'Editar Produto' : 'Adicionar Produto'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none" disabled={loading || localLoading}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
            {localLoading && (
              <div className="flex-1 flex items-center justify-center p-10">
                <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-4 text-gray-600 dark:text-gray-300">Carregando dados do produto...</span>
              </div>
            )}

            {!localLoading && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <fieldset className="border dark:border-gray-700 rounded-md p-4">
                    <legend className="text-base font-medium text-gray-900 dark:text-gray-100 px-2">Informações Principais</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                      <div>
                        <label htmlFor="nome-produto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <Package className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Nome *
                        </label>
                        <input id="nome-produto" type="text" value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} className={`input ${errors.nome ? 'input-error' : ''}`} placeholder="Ex: Maçã Gala Premium" disabled={loading} />
                        {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                      </div>
                      <div>
                        <label htmlFor="categoria-produto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria *</label>
                        <div className="flex items-center space-x-2">
                          <select id="categoria-produto" value={formData.categoriaId} onChange={(e) => handleInputChange('categoriaId', e.target.value as string)} className={`select ${errors.categoriaId ? 'select-error' : ''}`} disabled={loadingCategorias || loading} >
                            <option value="">{loadingCategorias ? 'Carregando...' : 'Selecione...'}</option>
                            {categorias.map((cat) => (<option key={cat.id} value={cat.id.toString()}>{cat.nome}</option>))}
                          </select>
                          <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800" title="Adicionar Categoria" disabled={loading}>
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        {errors.categoriaId && <p className="text-red-500 text-xs mt-1">{errors.categoriaId}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="descricao-produto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                        <textarea id="descricao-produto" rows={3} value={formData.descricao} onChange={(e) => handleInputChange('descricao', e.target.value)} className="textarea" placeholder="Detalhes sobre o produto, origem, etc." disabled={loading} />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="border dark:border-gray-700 rounded-md p-4">
                    <legend className="text-base font-medium text-gray-900 dark:text-gray-100 px-2">Preço e Medidas</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                      <div>
                        <label htmlFor="preco-custo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <DollarSign className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Preço de Custo (R$) *
                        </label>
                        <input id="preco-custo" type="number" step="0.01" min="0.01" value={formData.precoCusto} onChange={(e) => handleInputChange('precoCusto', e.target.value)} className={`input ${errors.precoCusto ? 'input-error' : ''}`} placeholder="0.00" disabled={loading} />
                        {errors.precoCusto && <p className="text-red-500 text-xs mt-1">{errors.precoCusto}</p>}
                      </div>
                      <div>
                        <label htmlFor="tipo-medida" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidade de Medida</label>
                        <select id="tipo-medida" value={formData.tipoMedida} onChange={(e) => handleInputChange('tipoMedida', e.target.value as string)} className="select" disabled={loading} >
                          {unidadesMedida.map((unidade) => (<option key={unidade.value} value={unidade.value}>{unidade.label}</option>))}
                        </select>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="border dark:border-gray-700 rounded-md p-4">
                    <legend className="text-base font-medium text-gray-900 dark:text-gray-100 px-2">Rastreabilidade</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
                      <div>
                        <label htmlFor="codigo-barras" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <Hash className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Código de Barras
                        </label>
                        <input id="codigo-barras" type="text" value={formData.codigoBarras} onChange={(e) => handleInputChange('codigoBarras', e.target.value)} className="input" placeholder="Ler ou digitar código" disabled={loading} />
                      </div>
                      <div>
                        <label htmlFor="data-colheita" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <Calendar className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Colheita/Produção *
                        </label>
                        <input id="data-colheita" type="date" value={formData.dataColheita} onChange={(e) => handleInputChange('dataColheita', e.target.value)} className={`input ${errors.dataColheita ? 'input-error' : ''}`} disabled={loading} />
                        {errors.dataColheita && <p className="text-red-500 text-xs mt-1">{errors.dataColheita}</p>}
                      </div>
                      <div>
                        <label htmlFor="data-validade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <Calendar className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Data de Validade *
                        </label>
                        <input id="data-validade" type="date" value={formData.dataValidade} onChange={(e) => handleInputChange('dataValidade', e.target.value)} className={`input ${errors.dataValidade ? 'input-error' : ''}`} disabled={loading} />
                        {errors.dataValidade && <p className="text-red-500 text-xs mt-1">{errors.dataValidade}</p>}
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="border dark:border-gray-700 rounded-md p-4">
                    <legend className="text-base font-medium text-gray-900 dark:text-gray-100 px-2">Controle de Estoque</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                      <div>
                        <label htmlFor="quantidadeAtual" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <Archive className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Estoque Atual *
                        </label>
                        <div className="flex items-center space-x-2">
                          <input id="quantidadeAtual" type="number" step="1" min="0" value={formData.quantidadeAtual}
                            onChange={(e) => handleInputChange('quantidadeAtual', e.target.value)}
                            className={`input ${errors.quantidadeAtual ? 'input-error' : ''}`}
                            disabled={isEditing || loading}
                          />
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => setShowAddStock(!showAddStock)}
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                              title="Repor estoque"
                              disabled={loading || isAddingStock}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        {errors.quantidadeAtual && <p className="text-red-500 text-xs mt-1">{errors.quantidadeAtual}</p>}
                      </div>

                      <div>
                        <label htmlFor="quantidadeMinima" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <Archive className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Estoque Mínimo *
                        </label>
                        <input id="quantidadeMinima" type="number" step="1" min="0" value={formData.quantidadeMinima} onChange={(e) => handleInputChange('quantidadeMinima', e.target.value)} className={`input ${errors.quantidadeMinima ? 'input-error' : ''}`} disabled={loading} />
                        {errors.quantidadeMinima && <p className="text-red-500 text-xs mt-1">{errors.quantidadeMinima}</p>}
                      </div>
                    </div>

                    {isEditing && showAddStock && (
                      <div className="mt-4 p-4 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-gray-700 rounded-md">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Repor Estoque</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="estoque-para-adicionar" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Quantidade a Adicionar *</label>
                            <input
                              id="estoque-para-adicionar"
                              type="number"
                              step="1"
                              min="1"
                              value={estoqueParaAdicionar}
                              onChange={(e) => {
                                setEstoqueParaAdicionar(e.target.value);
                                if (addStockError) setAddStockError(null);
                              }}
                              className={`input ${addStockError ? 'input-error' : ''}`}
                              placeholder="0"
                              disabled={isAddingStock || loading}
                            />
                          </div>
                          <div className="md:col-span-2 flex items-end">
                            <button
                              type="button"
                              onClick={handleAdicionarEstoqueClick}
                              disabled={isAddingStock || loading}
                              className="w-full md:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                            >
                              {isAddingStock && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              )}
                              {isAddingStock ? 'Adicionando...' : 'Confirmar Reposição'}
                            </button>
                          </div>
                        </div>
                        {addStockError && <p className="text-red-500 text-xs mt-2">{addStockError}</p>}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Nota: Para repor o estoque, as datas de Colheita e Validade acima devem estar preenchidas.</p>
                      </div>
                    )}
                  </fieldset>

                  <fieldset className="border dark:border-gray-700 rounded-md p-4">
                    <legend className="text-base font-medium text-gray-900 dark:text-gray-100 px-2">Fornecedores</legend>
                    <div className="space-y-3">
                      <label htmlFor="fornecedor-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Truck className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Fornecedores Associados
                      </label>

                      <div className="flex flex-wrap gap-2 p-2 border border-gray-200 dark:border-gray-600 rounded-md min-h-[40px] bg-gray-50 dark:bg-gray-700/50">
                        {loadingFornecedores ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400">Carregando...</span>
                        ) : selectedSuppliers.length === 0 ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400">Nenhum fornecedor selecionado</span>
                        ) : (
                          selectedSuppliers.map(f => (
                            <span key={f.id} className="flex items-center gap-1.5 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-sm font-medium px-2.5 py-0.5 rounded-full">
                              {f.nome}
                              <button
                                type="button"
                                onClick={() => handleFornecedorRemove(f.id)}
                                className="text-green-600 dark:text-green-200 hover:text-green-800 dark:hover:text-green-400"
                                disabled={loading}
                                title={`Remover ${f.nome}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      <input
                        id="fornecedor-search"
                        type="text"
                        placeholder="Buscar para adicionar..."
                        value={supplierSearchTerm}
                        onChange={(e) => setSupplierSearchTerm(e.target.value)}
                        className="input w-full"
                        disabled={loadingFornecedores || loading}
                      />

                      {(supplierSearchTerm.length > 0 || formData.fornecedorIds.length === 0) && (
                        <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-40 overflow-y-auto">
                          {availableSuppliers.length === 0 ? (
                            <p className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">Nenhum fornecedor encontrado.</p>
                          ) : (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                              {availableSuppliers.map(f => (
                                <li
                                  key={f.id}
                                  onClick={() => handleFornecedorAdd(f.id)}
                                  className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <div>
                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{f.nome}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{f.cnpj}</p>
                                  </div>
                                  <Plus className="w-5 h-5 text-green-500" />
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </fieldset>

                  <fieldset className="border dark:border-gray-700 rounded-md p-4">
                    <legend className="text-base font-medium text-gray-900 dark:text-gray-100 px-2">Imagem e Status</legend>
                    <div className="space-y-5 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <UploadCloud className="w-4 h-4 inline mr-1 text-gray-500 dark:text-gray-400" /> Imagem do Produto
                        </label>
                        <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                          <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 border dark:border-gray-600">
                            {imagePreview ? (<img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />) : (<Package className="w-12 h-12" />)}
                          </div>
                          <div className="flex-1 w-full">
                            <input
                              id="product-image-input" type="file" accept="image/png, image/jpeg, image/webp"
                              onChange={handleImageChange}
                              className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 dark:file:bg-green-900 dark:file:text-green-200 dark:hover:file:bg-green-800 cursor-pointer border border-gray-300 dark:border-gray-600 rounded-lg"
                              disabled={loading}
                            />
                            {errors.imagem && <p className="text-red-500 text-xs mt-1">{errors.imagem}</p>}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG ou WebP (Máx. 10MB).</p>
                          </div>
                          {(imagePreview || imageFile) && (
                            <button type="button" onClick={clearImage} className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 focus:outline-none rounded-full hover:bg-red-100 dark:hover:bg-gray-700" title="Remover imagem" disabled={loading}>
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center pt-2">
                        <input
                          type="checkbox" id="ativo" checked={formData.ativo}
                          onChange={(e) => handleInputChange('ativo', e.target.checked)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-offset-0 focus:ring-2 focus:ring-green-500"
                          disabled={loading}
                        />
                        <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900 dark:text-gray-200 select-none">Produto ativo para venda</label>
                      </div>
                    </div>
                  </fieldset>
                </div>

                <div className="flex justify-end space-x-3 pt-5 border-t dark:border-gray-700 mt-6 sticky bottom-0 bg-white dark:bg-gray-800 py-4 px-6 z-10">
                  <button
                    type="button" onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    disabled={loading || localLoading} >
                    Cancelar
                  </button>
                  <button
                    type="submit" disabled={loading || localLoading}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50" >
                    {loading && (
                      <svg key="spinner-svg" className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {loading ? 'Salvando...' : (isEditing ? 'Atualizar Produto' : 'Criar Produto')}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <CategoryFormModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSubmit={handleCreateCategorySubmit}
        />

        <style>{`
  .input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
  .input-error { @apply border-red-500 focus:ring-red-500; }
  .select { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
  .select-error { @apply border-red-500 focus:ring-red-500; }
  .textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100; }
  `}</style>
      </div>
    </>
  );
};

export default ProductForm;