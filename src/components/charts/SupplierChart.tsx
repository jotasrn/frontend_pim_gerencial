import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData
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

export const ProductsBySupplierChart: React.FC<{ data: BarChartDataType }> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Quantidade de Produtos por Fornecedor',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            // Garante que o valor é tratado como número antes de concatenar
            const numericValue = typeof value === 'string' ? parseFloat(value) : value;
            if (Number.isInteger(numericValue)) {
              return numericValue + ' produtos';
            }
            return value;
          }
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
};