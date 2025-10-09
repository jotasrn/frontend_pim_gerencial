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
  TooltipItem 
} from 'chart.js';

import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- Tipagem Específica dos Dados ---
type LineChartDataType = ChartData<'line', number[], string>;
type DoughnutChartDataType = ChartData<'doughnut', number[], string>;
type BarChartDataType = ChartData<'bar', number[], string>;


// Gráfico de Vendas por Período
export const SalesLineChart: React.FC<{ data: LineChartDataType }> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evolução das Vendas',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            const numericValue = typeof value === 'string' ? parseFloat(value) : value;
            return 'R$ ' + numericValue.toLocaleString('pt-BR');
          }
        }
      }
    }
  };

  return <Line data={data} options={options} />;
};

// Gráfico de Vendas por Categoria
export const SalesByCategoryChart: React.FC<{ data: DoughnutChartDataType }> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Vendas por Categoria',
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'doughnut'>) {
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
  const options = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 5 Produtos Mais Vendidos',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            return value + ' unid.';
          }
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
};