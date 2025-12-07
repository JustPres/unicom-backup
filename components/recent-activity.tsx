'use client'

import { CheckCircle2, Clock, XCircle, FileText, Package, Headphones } from "lucide-react"

type Activity = {
  id: string
  type: 'quote' | 'order' | 'ticket'
  title: string
  description: string
  time: string
  status: 'completed' | 'pending' | 'failed' | 'approved' | 'rejected' | 'open' | 'in_progress' | 'resolved'
}

export function RecentActivity({ activities }: { activities?: Activity[] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No recent activity
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'pending':
      case 'open':
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quote':
        return <FileText className="h-4 w-4" />
      case 'order':
        return <Package className="h-4 w-4" />
      case 'ticket':
        return <Headphones className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {activities.slice(0, 5).map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className="mt-1">
            {getStatusIcon(activity.status)}
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              {getTypeIcon(activity.type)}
              <p className="text-sm font-medium leading-none">{activity.title}</p>
            </div>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
