import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  TooltipItem 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- Tipagem Específica dos Dados ---
type BarChartDataType = ChartData<'bar', number[], string>;


// Gráfico de Estoque por Produto
export const StockLevelsChart: React.FC<{ data: BarChartDataType }> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Níveis de Estoque por Produto',
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} unidades`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
      },
      x: {
        stacked: true,
      }
    }
  };

  return <Bar data={data} options={options} />;
};

// Gauge de Nível Crítico de Estoque 
export const StockGaugeChart: React.FC<{ criticalItems: number; totalItems: number }> = ({ 
  criticalItems, 
  totalItems 
}) => {
  const percentage = totalItems > 0 ? (criticalItems / totalItems) * 100 : 0;
  
  const getColor = (percentage: number) => {
    if (percentage >= 30) return '#EF4444'; 
    if (percentage >= 15) return '#F59E0B'; 
    return '#10B981';
  };

  const getStatus = (percentage: number) => {
    if (percentage >= 30) return 'Crítico';
    if (percentage >= 15) return 'Atenção';
    return 'Normal';
  };

  return (
    <div className="flex flex-col items-center p-6">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={getColor(percentage)}
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-gray-900">Produtos em Estoque Crítico</p>
        <p className={`text-lg font-bold ${
          percentage >= 30 ? 'text-red-600' : 
          percentage >= 15 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {getStatus(percentage)}
        </p>
        <p className="text-sm text-gray-500">
          {criticalItems} de {totalItems} produtos
        </p>
      </div>
    </div>
  );
};