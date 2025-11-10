import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, Package, AlertCircle, AlertTriangle, DollarSign, RefreshCw } from 'lucide-react';
import ProductForm from '../../components/forms/ProdutoForm';
import ConfirmationModal from '../../components/modals/ConfirmacaoModal';
import ProdutoDetailsModal from '../../components/modals/ProdutoDetailsModal';
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
 const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
 const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

 const handleOpenCreateForm = () => {
  setEditingProduct(null);
  setIsFormOpen(true);
 };

 const handleOpenEditForm = (produto: Produto) => {
  setEditingProduct(produto);
  setIsFormOpen(true);
 };

 const handleOpenDetailsModal = (produto: Produto) => {
  setSelectedProduct(produto);
  setIsDetailsModalOpen(true);
 };

 const handleCloseDetailsModal = () => {
  setIsDetailsModalOpen(false);
  setSelectedProduct(null);
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
   console.error("Erro em ProductManagement handleFormSubmit:", error);
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
 };

 const handleCloseConfirmModal = () => {
  setIsConfirmModalOpen(false);
  setProductToDeactivate(null);
  setIsDeactivatingLoading(false);
 };

 const stopPropagation = (e: React.MouseEvent) => {
  e.stopPropagation();
 };

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

 const renderEstoque = (produto: Produto, isMobile = false) => {
  if (!produto.estoque) {
   return <span className="text-gray-400 dark:text-gray-500">-</span>;
  }
  const { quantidadeAtual, quantidadeMinima } = produto.estoque;
  const min = quantidadeMinima ?? 0;
  if (quantidadeAtual <= 5) {
   return (
    <span className={`flex items-center text-red-600 dark:text-red-400 font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`} title={`Estoque crítico! Mínimo: ${min}`}>
     <AlertCircle className="w-4 h-4 mr-1.5" />
     {isMobile ? 'Crítico:' : ''} {quantidadeAtual}
    </span>
   );
  }
  if (quantidadeAtual <= min) {
   return (
    <span className={`flex items-center text-yellow-600 dark:text-yellow-400 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`} title={`Estoque baixo. Mínimo: ${min}`}>
     <AlertTriangle className="w-4 h-4 mr-1.5" />
     {isMobile ? 'Baixo:' : ''} {quantidadeAtual}
    </span>
   );
  }
  return <span className={`text-gray-900 dark:text-gray-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>{isMobile ? 'Estoque:' : ''} {quantidadeAtual}</span>;
 };

 const renderStatus = (product: Produto, lowStock: boolean) => {
  const isActuallyActive = product.ativo && !lowStock;
  return (
   <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${isActuallyActive
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    }`}>
    {isActuallyActive ? 'Ativo' : 'Inativo'}
   </span>
  );
 };

 const handleActionButtonClick = (e: React.MouseEvent, product: Produto, isActuallyActive: boolean, canReactivate: boolean) => {
  e.stopPropagation();
  if (isActuallyActive) {
   handleOpenDeactivateModal(product);
  } else if (canReactivate) {
   handleOpenEditForm(product);
  }
 };

 return (
  <Layout title="Gerenciamento de Produtos">
   <div className="mb-6 flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4">
    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
     <Package className="w-6 h-6 mr-2 text-green-600" />
     Produtos
    </h1>
    <button
     onClick={handleOpenCreateForm}
     className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors shadow-sm w-full sm:w-auto"
    >
     <Plus className="h-5 w-5 mr-2" />
     Adicionar Produto
    </button>
   </div>

   <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
    {loadingList && listaProdutos.length === 0 ? (
     <LoadingSpinner text="Carregando produtos..." />
    ) : listaProdutos.length === 0 && !loadingList ? (
     <p className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhum produto cadastrado.</p>
    ) : (
     <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:hidden">
       {listaProdutos.map((product) => {
        const expired = isExpired(product.dataValidade);
        const lowStock = product.estoque ? product.estoque.quantidadeAtual <= 5 : false;
        const isActuallyActive = product.ativo && !lowStock;
        const canReactivate = !lowStock;
        return (
         <div 
          key={product.id} 
          className={`p-4 ${!isActuallyActive ? 'opacity-60 bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer`}
          onClick={() => handleOpenDetailsModal(product)}
         >
          <div className="flex items-center justify-between">
           <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
             {product.imagemUrl ? (
              <img className="h-10 w-10 rounded-full object-cover" src={product.imagemUrl} alt={product.nome} />
             ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400">
               <Package size={20} />
              </div>
             )}
            </div>
            <div className="ml-3">
             <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.nome}</p>
             <p className="text-xs text-gray-500 dark:text-gray-400">{product.categoria?.nome ?? 'N/A'}</p>
            </div>
           </div>
           <div className="flex items-center space-x-3" onClick={stopPropagation}>
            <button onClick={() => handleOpenEditForm(product)} className="text-indigo-600 dark:text-indigo-400" title="Editar">
             <Edit className="h-5 w-5" />
            </button>
            <button 
             onClick={(e) => handleActionButtonClick(e, product, isActuallyActive, canReactivate)}
             className={`transition-colors 
              ${isActuallyActive ? 'text-red-600 dark:text-red-400' :
               (canReactivate ? 'text-green-600 dark:text-green-400' : 'text-gray-400 cursor-not-allowed')
              }`} 
             title={isActuallyActive ? "Desativar" : (!canReactivate ? "Estoque crítico" : "Reativar")}
             disabled={!isActuallyActive && !canReactivate}
            >
             {isActuallyActive ? <Trash2 className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
            </button>
           </div>
          </div>
          <div className="mt-2 space-y-2">
           <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400 flex items-center"><DollarSign className="w-4 h-4 mr-1" /> {formatCurrency(product.precoVenda)}</span>
            {renderEstoque(product, true)}
           </div>
           <div className="flex justify-between text-xs">
            {expired && (
             <span className="text-red-600 dark:text-red-400 font-semibold flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Vencido: {product.dataValidade ? formatDate(product.dataValidade) : '-'}
             </span>
            )}
            <span className="ml-auto">{renderStatus(product, lowStock)}</span>
           </div>
          </div>
         </div>
        );
       })}
      </div>
      
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden lg:table">
       <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Imagem</th>
         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoria</th>
         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Preço Venda</th>
         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estoque</th>
         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Validade</th>
         <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
        </tr>
       </thead>
       <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {listaProdutos.map((product) => {
         const expired = isExpired(product.dataValidade);
         const lowStock = product.estoque ? product.estoque.quantidadeAtual <= 5 : false;
         const isActuallyActive = product.ativo && !lowStock;
         const canReactivate = !lowStock;
         return (
          <tr 
           key={product.id} 
           className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${!isActuallyActive ? 'opacity-60 bg-gray-50 dark:bg-gray-700/50' : ''}`}
           onClick={() => handleOpenDetailsModal(product)}
          >
           <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex-shrink-0 h-10 w-10">
             {product.imagemUrl ? (
              <img className="h-10 w-10 rounded-full object-cover" src={product.imagemUrl} alt={product.nome} />
             ) : (
              <div className={`h-10 w-10 rounded-full ${!isActuallyActive ? 'bg-gray-300' : 'bg-gray-200'} dark:bg-gray-600 flex items-center justify-center text-gray-400`}>
               <Package size={20} />
              </div>
             )}
            </div>
           </td>
           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{product.nome}</td>
           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{product.categoria?.nome ?? 'N/A'}</td>
           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 font-semibold">{formatCurrency(product.precoVenda)}</td>
           <td className="px-6 py-4 whitespace-nowrap text-sm">{renderEstoque(product)}</td>
           <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell ${expired ? 'text-red-600 dark:text-red-400 font-semibold' : ''}`}>
            {expired && <AlertCircle className="w-4 h-4 inline mr-1.5" />}
            {product.dataValidade ? formatDate(product.dataValidade) : '-'}
           </td>
           <td className="px-6 py-4 whitespace-nowrap text-center">{renderStatus(product, lowStock)}</td>
           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={stopPropagation}>
            <div className="flex items-center justify-end space-x-3">
             <button onClick={() => handleOpenEditForm(product)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors" title="Editar produto">
              <Edit className="h-5 w-5" />
             </button>
             <button
              onClick={(e) => handleActionButtonClick(e, product, isActuallyActive, canReactivate)}
              className={`transition-colors 
              ${isActuallyActive ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' :
             (canReactivate ? 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300' : 'text-gray-400 cursor-not-allowed')
              }`} 
              title={isActuallyActive ? "Desativar produto" : (!canReactivate ? "Aumente o estoque para reativar" : "Reativar produto")}
              disabled={!isActuallyActive && !canReactivate}
             >
              {isActuallyActive ? <Trash2 className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
             </button>
            </div>
           </td>
          </tr>
         );
        })}
       </tbody>
      </table>
     </>
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
    title="Confirmar Desativação"
    message={`Tem certeza que deseja DESATIVAR o produto "${productToDeactivate?.nome}"? Ele não aparecerá mais para venda.`}
    confirmText="Desativar"
    isLoading={isDeactivatingLoading}
   />
   
   <ProdutoDetailsModal
    isOpen={isDetailsModalOpen}
    onClose={handleCloseDetailsModal}
    produto={selectedProduct}
   />
  </Layout>
 );
};

export default ProductManagement;
