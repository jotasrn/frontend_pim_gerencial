import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    TooltipItem
} from 'chart.js';
import { useTheme } from '../../contexts/TemaContext';

ChartJS.register(
    ArcElement,
    Title,
    Tooltip,
    Legend
);

type DoughnutChartDataType = ChartData<'doughnut', number[], string>;

interface ChartProps {
    data: DoughnutChartDataType;
}

export const ProductStatusChart: React.FC<ChartProps> = ({ data }) => {
    const { theme } = useTheme();
    const textColor = theme === 'dark' ? '#E5E7EB' : '#1F2937';
    const tooltipBg = theme === 'dark' ? '#374151' : '#FFFFFF';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: textColor,
                    padding: 20,
                }
            },
            title: {
                display: false,
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
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        if (total === 0) return `${label}: ${value}`;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
    };

    return <Doughnut data={data} options={options} />;
};