import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData, 
  TooltipItem 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type BarChartDataType = ChartData<'bar', number[], string>;
type PieChartDataType = ChartData<'pie', number[], string>;


// Gráfico de Efeito das Promoções
export const PromotionEffectChart: React.FC<{ data: BarChartDataType }> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Efeito das Promoções nas Vendas',
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

  return <Bar data={data} options={options} />;
};

// Gráfico de Distribuição de Promoções por Categoria
export const PromotionByCategoryChart: React.FC<{ data: PieChartDataType }> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Promoções por Categoria',
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'pie'>) {
            const label = context.label || '';
            const value = context.parsed;
            if (!context.dataset.data) return label;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            if (total === 0) return `${label}: ${value} promoções`;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} promoções (${percentage}%)`;
          }
        }
      }
    },
  };

  return <Pie data={data} options={options} />;
};