import React, { useState, useEffect, useRef, useMemo } from 'react'; // Adicionado useMemo
import Layout from '../../components/Layout';
import { 
    Plus, Edit, Trash2, Package, AlertCircle, AlertTriangle, 
    DollarSign, RefreshCw, Search, Filter, X // Adicionado ícones novos
} from 'lucide-react';
import ProductForm from '../../components/forms/ProdutoForm';
import ConfirmationModal from '../../components/modals/ConfirmacaoModal';
import ProdutoDetailsModal from '../../components/modals/ProdutoDetailsModal';
import { useProdutos, isExpired } from '../../hooks/useProdutos';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/apiHelpers';
import { Produto } from '../../types';
import { showToast } from '../../components/Toast';

const ProductManagement: React.FC = () => {
    const {
        produtos: listaProdutos,
        loading: loadingList,
        criarProduto,
        atualizarProduto,
        desativarProduto,
        ativarProduto,
        carregarProdutos,
    } = useProdutos();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const shouldReloadList = useRef(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [productToDeactivate, setProductToDeactivate] = useState<Produto | null>(null);
    const [isDeactivatingLoading, setIsDeactivatingLoading] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

    // --- NOVO: Estado para os Filtros ---
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        termo: '',
        categoria: '',
        precoMin: '',
        precoMax: '',
        statusEstoque: 'todos', // todos, baixo, critico, normal
        statusValidade: 'todos' // todos, vencidos, validos
    });

    const handleOpenCreateForm = () => { setEditingProductId(null); setIsFormOpen(true); };
    const handleOpenEditForm = (produto: Produto) => { setEditingProductId(produto.id); setIsFormOpen(true); };
    const handleOpenDetailsModal = (produto: Produto) => { setSelectedProduct(produto); setIsDetailsModalOpen(true); };
    const handleCloseDetailsModal = () => { setIsDetailsModalOpen(false); setSelectedProduct(null); };

    const handleFormSubmit = async (formData: FormData): Promise<boolean> => {
        let success = false;
        try {
            if (editingProductId) {
                success = await atualizarProduto(editingProductId, formData);
            } else {
                success = await criarProduto(formData);
            }
            if (success) {
                shouldReloadList.current = true;
                setIsFormOpen(false);
                setEditingProductId(null);
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

    const handleCloseForm = () => { setIsFormOpen(false); setEditingProductId(null); };
    const handleCloseConfirmModal = () => { setIsConfirmModalOpen(false); setProductToDeactivate(null); setIsDeactivatingLoading(false); };
    const stopPropagation = (e: React.MouseEvent) => { e.stopPropagation(); };

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

    // --- NOVO: Lógica de Filtragem ---
    
    // 1. Extrair categorias únicas para o dropdown
    const categoriasUnicas = useMemo(() => {
        const cats = listaProdutos.map(p => p.categoria?.nome).filter(Boolean);
        return Array.from(new Set(cats)).sort();
    }, [listaProdutos]);

    // 2. Aplicar filtros
    const produtosFiltrados = useMemo(() => {
        return listaProdutos.filter(produto => {
            // Filtro Texto (Nome)
            const matchTermo = filters.termo === '' || 
                produto.nome.toLowerCase().includes(filters.termo.toLowerCase());

            // Filtro Categoria
            const matchCategoria = filters.categoria === '' || 
                produto.categoria?.nome === filters.categoria;

            // Filtro Preço
            const preco = produto.precoVenda;
            const min = filters.precoMin ? parseFloat(filters.precoMin) : 0;
            const max = filters.precoMax ? parseFloat(filters.precoMax) : Infinity;
            const matchPreco = preco >= min && preco <= max;

            // Filtro Estoque
            let matchEstoque = true;
            if (filters.statusEstoque !== 'todos' && produto.estoque) {
                const qtd = produto.estoque.quantidadeAtual;
                const minEstoque = produto.estoque.quantidadeMinima || 0;
                
                if (filters.statusEstoque === 'critico') matchEstoque = qtd <= 5;
                else if (filters.statusEstoque === 'baixo') matchEstoque = qtd <= minEstoque;
                else if (filters.statusEstoque === 'normal') matchEstoque = qtd > minEstoque;
            }

            // Filtro Validade
            let matchValidade = true;
            if (filters.statusValidade !== 'todos') {
                const vencido = isExpired(produto.dataValidade);
                if (filters.statusValidade === 'vencidos') matchValidade = vencido;
                else if (filters.statusValidade === 'validos') matchValidade = !vencido;
            }

            return matchTermo && matchCategoria && matchPreco && matchEstoque && matchValidade;
        });
    }, [listaProdutos, filters]);

    // --- NOVO: Função para limpar filtros ---
    const limparFiltros = () => {
        setFilters({
            termo: '',
            categoria: '',
            precoMin: '',
            precoMax: '',
            statusEstoque: 'todos',
            statusValidade: 'todos'
        });
    };

    // --- Helpers de Renderização ---
    const renderEstoque = (produto: Produto, isMobile = false) => {
        if (!produto.estoque) return <span className="text-gray-400 dark:text-gray-500">-</span>;
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

    const renderStatus = (product: Produto) => {
        return (
            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${product.ativo
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                }`}>
                {product.ativo ? 'Ativo' : 'Inativo'}
            </span>
        );
    };

    const handleActionButtonClick = async (e: React.MouseEvent, product: Produto) => {
        e.stopPropagation();

        const expired = isExpired(product.dataValidade);

        if (product.ativo) {
            handleOpenDeactivateModal(product);
        } else {
            if (expired) {
                showToast.warning("Produto vencido! Atualize a data de validade para reativar.");
                handleOpenEditForm(product);
            } else {
                await ativarProduto(product);
                carregarProdutos();
            }
        }
    };

    return (
        <Layout title="Gerenciamento de Produtos">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                    <Package className="w-6 h-6 mr-2 text-green-600" />
                    Produtos
                </h1>
                
                <div className="flex gap-2 w-full sm:w-auto">
                    {/* --- NOVO: Botão de Filtros --- */}
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors shadow-sm w-full sm:w-auto border ${showFilters ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                    >
                        <Filter className="h-5 w-5 mr-2" />
                        Filtros
                    </button>

                    <button onClick={handleOpenCreateForm} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors shadow-sm w-full sm:w-auto">
                        <Plus className="h-5 w-5 mr-2" />
                        Adicionar
                    </button>
                </div>
            </div>

            {/* --- NOVO: Painel de Filtros --- */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Filtros Avançados</h3>
                        <button onClick={limparFiltros} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center">
                            <X className="w-4 h-4 mr-1" /> Limpar
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Busca por Nome */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Buscar Nome</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                                    placeholder="Nome do produto..."
                                    value={filters.termo}
                                    onChange={(e) => setFilters({...filters, termo: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Filtro Categoria */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
                            <select
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                                value={filters.categoria}
                                onChange={(e) => setFilters({...filters, categoria: e.target.value})}
                            >
                                <option value="">Todas</option>
                                {categoriasUnicas.map(cat => (
                                    <option key={cat as string} value={cat as string}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro Estoque */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status Estoque</label>
                            <select
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                                value={filters.statusEstoque}
                                onChange={(e) => setFilters({...filters, statusEstoque: e.target.value})}
                            >
                                <option value="todos">Todos</option>
                                <option value="normal">Normal</option>
                                <option value="baixo">Baixo (Atenção)</option>
                                <option value="critico">Crítico (≤ 5)</option>
                            </select>
                        </div>

                        {/* Filtro Validade */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Validade</label>
                            <select
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                                value={filters.statusValidade}
                                onChange={(e) => setFilters({...filters, statusValidade: e.target.value})}
                            >
                                <option value="todos">Todos</option>
                                <option value="validos">Em dia</option>
                                <option value="vencidos">Vencidos</option>
                            </select>
                        </div>

                        {/* Filtro Preço (Min/Max) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-4 flex gap-4 items-end border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                            <div className="w-1/2 md:w-1/4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Preço Min</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                                    placeholder="0.00"
                                    value={filters.precoMin}
                                    onChange={(e) => setFilters({...filters, precoMin: e.target.value})}
                                />
                            </div>
                            <div className="w-1/2 md:w-1/4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Preço Max</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                                    placeholder="Max"
                                    value={filters.precoMax}
                                    onChange={(e) => setFilters({...filters, precoMax: e.target.value})}
                                />
                            </div>
                            <div className="text-xs text-gray-400 pb-2 ml-2 hidden sm:block">
                                Resultados: {produtosFiltrados.length}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                {loadingList && listaProdutos.length === 0 ? (
                    <LoadingSpinner text="Carregando produtos..." />
                ) : listaProdutos.length === 0 && !loadingList ? (
                    <p className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhum produto cadastrado.</p>
                ) : produtosFiltrados.length === 0 ? ( 
                    // --- NOVO: Feedback se filtro não retornar nada ---
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhum produto encontrado com os filtros atuais.</p>
                        <button onClick={limparFiltros} className="text-green-600 hover:underline text-sm font-medium">Limpar Filtros</button>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:hidden">
                            {/* --- MUDANÇA: Usando produtosFiltrados ao invés de listaProdutos --- */}
                            {produtosFiltrados.map((product) => {
                                const expired = isExpired(product.dataValidade);
                                return (
                                    <div key={product.id} className={`p-4 ${!product.ativo ? 'opacity-60 bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer`} onClick={() => handleOpenDetailsModal(product)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {product.imagemUrl ? <img className="h-10 w-10 rounded-full object-cover" src={product.imagemUrl} alt={product.nome} /> : <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400"><Package size={20} /></div>}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.nome}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.categoria?.nome ?? 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3" onClick={stopPropagation}>
                                                <button onClick={() => handleOpenEditForm(product)} className="text-indigo-600 dark:text-indigo-400" title="Editar"><Edit className="h-5 w-5" /></button>
                                                <button onClick={(e) => handleActionButtonClick(e, product)} className={`transition-colors ${product.ativo ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} title={product.ativo ? "Desativar" : (expired ? "Vencido" : "Reativar")}>
                                                    {product.ativo ? <Trash2 className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400 flex items-center"><DollarSign className="w-4 h-4 mr-1" /> {formatCurrency(product.precoVenda)}</span>
                                                {renderEstoque(product, true)}
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                {expired && <span className="text-red-600 dark:text-red-400 font-semibold flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> Vencido: {product.dataValidade ? formatDate(product.dataValidade) : '-'}</span>}
                                                <span className="ml-auto">{renderStatus(product)}</span>
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
                                {/* --- MUDANÇA: Usando produtosFiltrados ao invés de listaProdutos --- */}
                                {produtosFiltrados.map((product) => {
                                    const expired = isExpired(product.dataValidade);
                                    return (
                                        <tr key={product.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${!product.ativo ? 'opacity-60 bg-gray-50 dark:bg-gray-700/50' : ''}`} onClick={() => handleOpenDetailsModal(product)}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {product.imagemUrl ? <img className="h-10 w-10 rounded-full object-cover" src={product.imagemUrl} alt={product.nome} /> : <div className={`h-10 w-10 rounded-full ${!product.ativo ? 'bg-gray-300' : 'bg-gray-200'} dark:bg-gray-600 flex items-center justify-center text-gray-400`}><Package size={20} /></div>}
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
                                            <td className="px-6 py-4 whitespace-nowrap text-center">{renderStatus(product)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={stopPropagation}>
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button onClick={() => handleOpenEditForm(product)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors" title="Editar produto"><Edit className="h-5 w-5" /></button>
                                                    <button onClick={(e) => handleActionButtonClick(e, product)} className={`transition-colors ${product.ativo ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'}`} title={product.ativo ? "Desativar" : (expired ? "Vencido" : "Reativar")}>
                                                        {product.ativo ? <Trash2 className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
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

            <ProductForm isOpen={isFormOpen} onClose={handleCloseForm} onSubmit={handleFormSubmit} produtoIdToEdit={editingProductId} />
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={handleCloseConfirmModal} onConfirm={handleConfirmDeactivate} title="Confirmar Desativação" message={`Tem certeza que deseja DESATIVAR o produto "${productToDeactivate?.nome}"? Ele não aparecerá mais para venda.`} confirmText="Desativar" isLoading={isDeactivatingLoading} />
            <ProdutoDetailsModal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} produto={selectedProduct} />
        </Layout>
    );
};

export default ProductManagement;