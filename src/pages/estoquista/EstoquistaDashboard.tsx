import React, { useMemo } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useProdutos } from '../../hooks/useProdutos';
import { useCategorias } from '../../hooks/useCategorias';
import { useFornecedores } from '../../hooks/useFornecedores';
import { useNotifications } from '../../contexts/NotificacaoContext';
import { Package, AlertCircle, AlertTriangle, Truck, LayoutGrid, CheckSquare, XSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/apiHelpers';

const EstoquistaDashboard: React.FC = () => {
    const { produtos, loading: loadingProdutos } = useProdutos();
    const { categorias, loading: loadingCategorias } = useCategorias();
    const { fornecedores, loading: loadingFornecedores } = useFornecedores();
    const { lowStockProducts, expiredProducts } = useNotifications();

    const isLoading = loadingProdutos || loadingCategorias || loadingFornecedores;

    const stats = useMemo(() => {
        const totalProdutos = produtos.length;
        const produtosAtivos = produtos.filter(p => p.ativo).length;
        const produtosInativos = totalProdutos - produtosAtivos;
        const totalCategorias = categorias.length;
        const totalFornecedores = fornecedores.length;
        const totalEstoqueBaixo = lowStockProducts.length;
        const totalVencidos = expiredProducts.length;

        return [
            { id: 1, name: 'Total de Produtos', value: totalProdutos, icon: Package, color: 'text-blue-500' },
            { id: 2, name: 'Produtos Ativos', value: produtosAtivos, icon: CheckSquare, color: 'text-green-500' },
            { id: 3, name: 'Estoque Baixo', value: totalEstoqueBaixo, icon: AlertTriangle, color: 'text-yellow-600', alert: totalEstoqueBaixo > 0 },
            { id: 4, name: 'Produtos Vencidos', value: totalVencidos, icon: AlertCircle, color: 'text-red-600', alert: totalVencidos > 0 },
            { id: 5, name: 'Produtos Inativos', value: produtosInativos, icon: XSquare, color: 'text-gray-500' },
            { id: 6, name: 'Total Fornecedores', value: totalFornecedores, icon: Truck, color: 'text-cyan-500' },
            { id: 7, name: 'Total Categorias', value: totalCategorias, icon: LayoutGrid, color: 'text-purple-500' },
        ];
    }, [produtos, categorias, fornecedores, lowStockProducts, expiredProducts]);

    if (isLoading) {
        return (
            <Layout title="Dashboard do Estoquista">
                <LoadingSpinner text="Carregando dados..." />
            </Layout>
        );
    }

    return (
        <Layout title="Dashboard do Estoquista">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 transform transition hover:scale-105 duration-300 ease-in-out ${stat.alert ? 'border-2 border-red-500' : ''}`}
                    >
                        <div className="flex items-center">
                            <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.name}</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 p-4 border-b dark:border-gray-700 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Produtos com Estoque Baixo
                    </h3>
                    <div className="divide-y dark:divide-gray-700 max-h-80 overflow-y-auto">
                        {lowStockProducts.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 p-6">Nenhum produto com estoque baixo.</p>
                        ) : (
                            lowStockProducts.map(produto => (
                                <Link
                                    key={produto.id}
                                    to="/estoquista/produtos"
                                    className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{produto.nome}</span>
                                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                                        Restam: {produto.estoque?.quantidadeAtual ?? 0}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 p-4 border-b dark:border-gray-700 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Produtos Vencidos
                    </h3>
                    <div className="divide-y dark:divide-gray-700 max-h-80 overflow-y-auto">
                        {expiredProducts.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 p-6">Nenhum produto vencido.</p>
                        ) : (
                            expiredProducts.map(produto => (
                                <Link
                                    key={produto.id}
                                    to="/estoquista/produtos"
                                    className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{produto.nome}</span>
                                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                        Vencido em: {produto.dataValidade ? formatDate(produto.dataValidade) : 'N/A'}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EstoquistaDashboard;