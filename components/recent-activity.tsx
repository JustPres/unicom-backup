'use client'

import { CheckCircle2, Clock, XCircle } from "lucide-react"

type Activity = {
  id: string
  type: 'quote' | 'order' | 'ticket'
  title: string
  description: string
  time: string
  status: 'completed' | 'pending' | 'failed'
}

export function RecentActivity() {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'quote',
      title: 'New quote request',
      description: 'From Acme Inc.',
      time: '2 minutes ago',
      status: 'pending'
    },
    {
      id: '2',
      type: 'order',
      title: 'Order #1234 completed',
      description: 'Shipped to customer',
      time: '1 hour ago',
      status: 'completed'
    },
    {
      id: '3',
      type: 'ticket',
      title: 'New support ticket',
      description: 'High priority',
      time: '3 hours ago',
      status: 'pending'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className="mt-1">
            {getStatusIcon(activity.status)}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{activity.title}</p>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
