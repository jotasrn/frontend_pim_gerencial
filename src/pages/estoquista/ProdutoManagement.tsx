import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, Package, AlertCircle, AlertTriangle } from 'lucide-react';
import ProductForm from '../../components/forms/ProdutoForm';
import ConfirmationModal from '../../components/modals/ConfirmacaoModal';
import { useProdutos } from '../../hooks/useProdutos';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/apiHelpers';
import { Produto } from '../../types';

const isExpired = (dateString?: string): boolean => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(dateString);
  return expiryDate <= today;
};

const ProductManagement: React.FC = () => {
  const {
    produtos: listaProdutos,
    loading: loadingList,
    criarProduto,
    atualizarProduto,
    desativarProduto,
    carregarProdutos,
  } = useProdutos();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const shouldReloadList = useRef(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDeactivate, setProductToDeactivate] = useState<Produto | null>(null);
  const [isDeactivatingLoading, setIsDeactivatingLoading] = useState(false);

  const handleOpenCreateForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (produto: Produto) => {
    setEditingProduct(produto);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: FormData): Promise<boolean> => {
    let success = false;
    try {
      if (editingProduct) {
        success = await atualizarProduto(editingProduct.id, formData);
      } else {
        success = await criarProduto(formData);
      }

      if (success) {
        shouldReloadList.current = true;
        setIsFormOpen(false);
        setEditingProduct(null);
      }
      return success;
    } catch (error) {
      console.error("Erro pego em ProductManagement handleFormSubmit:", error);
      return false;
    }
  };

  const handleOpenDeactivateModal = (product: Produto) => {
    setProductToDeactivate(product);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!productToDeactivate) return;

    setIsDeactivatingLoading(true);
    const success = await desativarProduto(productToDeactivate.id);
    setIsDeactivatingLoading(false);

    if (success) {
      setIsConfirmModalOpen(false);
      setProductToDeactivate(null);
      carregarProdutos();
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  }

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setProductToDeactivate(null);
    setIsDeactivatingLoading(false);
  }

  useEffect(() => {
    const checkReload = () => {
      if (!isFormOpen && shouldReloadList.current) {
        carregarProdutos();
        shouldReloadList.current = false;
      }
    };
    const timerId = setTimeout(checkReload, 0);
    return () => clearTimeout(timerId);

  }, [isFormOpen, carregarProdutos]);

  const renderEstoque = (produto: Produto) => {
    if (!produto.estoque) {
      return <span className="text-gray-400">-</span>;
    }

    const { quantidadeAtual, quantidadeMinima } = produto.estoque;
    const min = quantidadeMinima ?? 0;

    if (quantidadeAtual <= 5) {
      return (
        <span className="flex items-center text-red-600 font-semibold" title={`Estoque crítico! Mínimo: ${min}`}>
          <AlertCircle className="w-4 h-4 mr-1.5" />
          {quantidadeAtual}
        </span>
      );
    }

    if (quantidadeAtual <= min) {
      return (
        <span className="flex items-center text-yellow-600 font-medium" title={`Estoque baixo. Mínimo: ${min}`}>
          <AlertTriangle className="w-4 h-4 mr-1.5" />
          {quantidadeAtual}
        </span>
      );
    }

    return <span className="text-gray-900">{quantidadeAtual}</span>;
  };

  return (
    <Layout title="Gerenciamento de Produtos">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Produtos</h1>
        <button
          onClick={handleOpenCreateForm}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Produto
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loadingList && listaProdutos.length === 0 ? (
          <LoadingSpinner text="Carregando produtos..." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Venda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Validade</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listaProdutos.length === 0 && !loadingList ? (
                <tr><td colSpan={8} className="text-center py-6 text-gray-500">Nenhum produto cadastrado.</td></tr>
              ) : (
                listaProdutos.map((product) => {
                  const expired = isExpired(product.dataValidade);
                  const lowStock = product.estoque ? product.estoque.quantidadeAtual <= 5 : false;
                  const isActuallyActive = product.ativo && !lowStock;
                  const canReactivate = !lowStock;

                  return (
                    <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${!isActuallyActive ? 'opacity-60 bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.imagemUrl ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={product.imagemUrl} alt={product.nome} />
                          ) : (
                            <div className={`h-10 w-10 rounded-full ${!isActuallyActive ? 'bg-gray-300' : 'bg-gray-200'} flex items-center justify-center text-gray-400`}>
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{product.categoria?.nome ?? 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">{formatCurrency(product.precoVenda)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {renderEstoque(product)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell ${expired ? 'text-red-600 font-semibold' : ''}`}>
                        {expired && <AlertCircle className="w-4 h-4 inline mr-1.5" />}
                        {product.dataValidade ? formatDate(product.dataValidade) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${isActuallyActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {isActuallyActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button onClick={() => handleOpenEditForm(product)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Editar produto">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeactivateModal(product)}
                            className={`transition-colors ${(!isActuallyActive && !canReactivate) ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                            title={isActuallyActive ? "Desativar produto" : (!canReactivate ? "Aumente o estoque para reativar" : "Reativar produto")}
                            disabled={!isActuallyActive && !canReactivate}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <ProductForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        isEditing={!!editingProduct}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDeactivate}
        title={productToDeactivate?.ativo ? "Confirmar Desativação" : "Confirmar Reativação"}
        message={`Tem certeza que deseja ${productToDeactivate?.ativo ? 'DESATIVAR' : 'REATIVAR'} o produto "${productToDeactivate?.nome}"? ${productToDeactivate?.ativo ? 'Ele não aparecerá mais para venda.' : 'Ele voltará a aparecer para venda.'}`}
        confirmText={productToDeactivate?.ativo ? 'Desativar' : 'Reativar'}
        isLoading={isDeactivatingLoading}
      />

    </Layout>
  );
};

export default ProductManagement;