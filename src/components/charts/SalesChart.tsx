import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  TooltipItem,
  Filler // Adicionado para preenchimento do gráfico de linha
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../contexts/TemaContext'; // Importe seu hook de tema

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler // Registre o Filler
);

// --- Tipagem Específica dos Dados ---
type LineChartDataType = ChartData<'line', number[], string>;
type DoughnutChartDataType = ChartData<'doughnut', number[], string>;
type BarChartDataType = ChartData<'bar', number[], string>;

// --- Opções Padrão de Gráfico (para tema claro/escuro) ---
const getChartOptions = (theme: 'light' | 'dark', titleText: string, yTicksCallback?: (value: number | string) => string) => {
  const


    textColor = theme === 'dark' ? '#E5E7EB' : '#1F2937'; 
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const tooltipBg = theme === 'dark' ? '#374151' : '#FFFFFF';

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          callback: yTicksCallback,
        },
        grid: {
          color: gridColor,
        }
      },
      x: {
        ticks: {
          color: textColor,
        },
        grid: {
          display: false,
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
        }
      },
      title: {
        display: true,
        text: titleText,
        color: textColor,
        font: { size: 16 }
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
        backgroundColor: tooltipBg,
        borderColor: gridColor,
        borderWidth: 1,
      }
    }
  };
};


// Gráfico de Vendas por Período
export const SalesLineChart: React.FC<{ data: LineChartDataType }> = ({ data }) => {
  const { theme } = useTheme();
  const options = getChartOptions(
    theme,
    'Evolução das Vendas',
    (value: number | string) => {
      const numericValue = typeof value === 'string' ? parseFloat(value) : value;
      return 'R$ ' + numericValue.toLocaleString('pt-BR');
    }
  );

  return <Line data={data} options={options} />;
};

// Gráfico de Vendas por Categoria
export const SalesByCategoryChart: React.FC<{ data: DoughnutChartDataType }> = ({ data }) => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#E5E7EB' : '#1F2937';
  const tooltipBg = theme === 'dark' ? '#374151' : '#FFFFFF';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: textColor,
        }
      },
      title: {
        display: true,
        text: 'Vendas por Categoria',
        color: textColor,
        font: { size: 16 }
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
        backgroundColor: tooltipBg,
        borderColor: gridColor,
        borderWidth: 1,
        callbacks: {
          label: function (context: TooltipItem<'doughnut'>) {
            const label = context.label || '';
            const value = context.parsed;
            if (!context.dataset.data) return label;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            if (total === 0) return `${label}: R$ ${value.toLocaleString('pt-BR')}`;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: R$ ${value.toLocaleString('pt-BR')} (${percentage}%)`;
          }
        }
      }
    },
  };

  return <Doughnut data={data} options={options} />;
};

// Top 5 Produtos Mais Vendidos
export const TopProductsChart: React.FC<{ data: BarChartDataType }> = ({ data }) => {
  const { theme } = useTheme();
  const options = getChartOptions(
    theme,
    'Top 5 Produtos Mais Vendidos',
    (value: number | string) => value + ' unid.'
  );

  // Sobrescreve 'indexAxis' para gráfico de barras horizontal
  const barOptions = {
    ...options,
    indexAxis: 'y' as const,
    scales: {
      ...options.scales,
      x: options.scales.y, 
      y: options.scales.x,
    },
    plugins: {
      ...options.plugins,
      legend: {
        display: false, 
      },
    }
  };

  return <Bar data={data} options={barOptions} />;
};