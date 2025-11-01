'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export function Overview({ data }: { data: any[] }) {
  const chartData = {
    labels: data.map((item) => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Sales',
        data: data.map((item) => item.amount),
        borderColor: 'rgb(5, 150, 105)',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  return <Line data={chartData} options={options} />
}
