import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  TooltipItem
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type LineChartDataType = ChartData<'line', number[], string>;
type PieChartDataType = ChartData<'pie', number[], string>;

export const LossByReasonChart: React.FC<{ data: PieChartDataType }> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Perdas por Motivo',
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'pie'>) {
            const label = context.label || '';
            const value = context.parsed;
            if (!context.dataset.data) return label;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            if (total === 0) return `${label}: ${value} unid.`;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} unid. (${percentage}%)`;
          }
        }
      }
    },
  };

  return <Pie data={data} options={options} />;
};

export const LossOverTimeChart: React.FC<{ data: LineChartDataType }> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evolução das Perdas',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            return value + ' unid.';
          }
        }
      }
    }
  };

  return <Line data={data} options={options} />;
};