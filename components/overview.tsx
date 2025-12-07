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

interface OverviewData {
  quotes?: {
    daily: Array<{ date: string; count: number; total: number }>
  }
  customers?: {
    daily: Array<{ date: string; count: number }>
  }
  tickets?: {
    daily: Array<{ date: string; count: number }>
  }
}

export function Overview({ data }: { data: OverviewData }) {
  const quotesDaily = data?.quotes?.daily || []
  const customersDaily = data?.customers?.daily || []
  const ticketsDaily = data?.tickets?.daily || []

  // Show empty state if no data
  if (quotesDaily.length === 0 && customersDaily.length === 0 && ticketsDaily.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
        <p className="text-sm">No activity in the last 30 days</p>
        <p className="text-xs mt-2">Activity trends will appear here</p>
      </div>
    )
  }

  // Merge dates from all datasets
  const allDates = Array.from(new Set([
    ...quotesDaily.map(item => item.date),
    ...customersDaily.map(item => item.date),
    ...ticketsDaily.map(item => item.date)
  ])).sort()

  // Create data maps for easy lookup
  const quotesMap = new Map(quotesDaily.map(item => [item.date, item]))
  const customersMap = new Map(customersDaily.map(item => [item.date, item]))
  const ticketsMap = new Map(ticketsDaily.map(item => [item.date, item]))

  const chartData = {
    labels: allDates.map((date) => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: 'Quote Requests',
        data: allDates.map(date => quotesMap.get(date)?.count || 0),
        borderColor: 'rgb(5, 150, 105)',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'New Customers',
        data: allDates.map(date => customersMap.get(date)?.count || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Support Tickets',
        data: allDates.map(date => ticketsMap.get(date)?.count || 0),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          afterLabel: function (context: any) {
            const date = allDates[context.dataIndex]
            const quote = quotesMap.get(date)
            if (context.dataset.label === 'Quote Requests' && quote) {
              return `Total Value: ₱${(quote.total || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
            return ''
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 1,
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  )
}
