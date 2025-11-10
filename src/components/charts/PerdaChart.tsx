import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface PerdaChartProps {
  labels: string[];
  data: number[];
  title: string;
}

export const PerdasMensaisChart: React.FC<PerdaChartProps> = ({ labels, data, title }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: title },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export const PerdasAnuaisChart: React.FC<PerdaChartProps> = ({ labels, data, title }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: title },
    },
  };

  return <Bar data={chartData} options={options} />;
};

interface PerdaLineChartProps {
  labels: string[];
  data: number[];
  title: string;
}

export const PerdasLinhaChart: React.FC<PerdaLineChartProps> = ({ labels, data, title }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: title },
    },
  };

  return <Line data={chartData} options={options} />;
};
