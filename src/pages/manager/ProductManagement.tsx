import React from 'react';
import Layout from '../../components/Layout';
import { Plus, CreditCard as Edit2, Trash2 } from 'lucide-react';
import ProductForm from '../../components/forms/ProductForm';
import { showToast } from '../../components/Toast';

const ProductManagement: React.FC = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState(null);

  const products = [
    { id: 1, name: 'Maçã', category: 'Frutas', price: 5.99, stock: 100 },
    { id: 2, name: 'Alface', category: 'Verduras', price: 2.50, stock: 50 },
    { id: 3, name: 'Cenoura', category: 'Legumes', price: 3.99, stock: 75 },
  ];

  const handleCreateProduct = async (productData: any) => {
    // Aqui você faria a chamada para a API
    console.log('Criando produto:', productData);
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleUpdateProduct = async (productData: any) => {
    // Aqui você faria a chamada para a API
    console.log('Atualizando produto:', productData);
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        // Aqui você faria a chamada para a API
        console.log('Excluindo produto:', productId);
        showToast.success('Produto excluído com sucesso!');
      } catch (error) {
        showToast.error('Erro ao excluir produto');
      }
    }
  };

  return (
    <Layout title="Gerenciamento de Produtos">
      <div className="mb-6">
        <button 
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Produto
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar produto"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Excluir produto"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Formulário */}
      <ProductForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        initialData={editingProduct}
        isEditing={!!editingProduct}
      />
    </Layout>
  );
};

export default ProductManagement;