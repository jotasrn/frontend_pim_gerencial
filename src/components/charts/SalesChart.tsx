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
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

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

// Gráfico de Vendas por Período
export const SalesLineChart: React.FC<{ data: any }> = ({ data }) => {
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
          callback: function(value: any) {
            return 'R$ ' + value.toLocaleString('pt-BR');
          }
        }
      }
    }
  };

  return <Line data={data} options={options} />;
};

// Gráfico de Vendas por Categoria
export const SalesByCategoryChart: React.FC<{ data: any }> = ({ data }) => {
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
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
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
export const TopProductsChart: React.FC<{ data: any }> = ({ data }) => {
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
          callback: function(value: any) {
            return value + ' unid.';
          }
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
};