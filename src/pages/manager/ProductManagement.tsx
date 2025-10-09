import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ProductForm from '../../components/forms/ProductForm';
import { useProdutos } from '../../hooks/useProdutos';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/apiHelpers';
import { Produto, ProdutoData } from '../../types';

const ProductManagement: React.FC = () => {
  const { produtos, loading, criarProduto, atualizarProduto, removerProduto } = useProdutos();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);

  const handleOpenCreateForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (produto: Produto) => {
    setEditingProduct(produto);
    setIsFormOpen(true);
  };

  // A função agora passa os dados tipados diretamente para o hook
  const handleFormSubmit = async (productData: ProdutoData) => {
    let success = false;
    if (editingProduct) {
      success = await atualizarProduto(editingProduct.id, productData);
    } else {
      success = await criarProduto(productData);
    }
    
    if (success) {
      setIsFormOpen(false);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto? A ação não pode ser desfeita.')) {
      removerProduto(productId);
    }
  };

  return (
    <Layout title="Gerenciamento de Produtos">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Produtos</h1>
        <button 
          onClick={handleOpenCreateForm}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Produto
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        {loading && produtos.length === 0 ? (
          <LoadingSpinner text="Carregando produtos..." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço de Venda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produtos.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.categoria?.nome ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.precoVenda)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-4">
                      <button onClick={() => handleOpenEditForm(product)} className="text-blue-600 hover:text-blue-900" title="Editar produto">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900" title="Excluir produto">
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

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct} 
        isEditing={!!editingProduct}
      />
    </Layout>
  );
};

export default ProductManagement;