'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentSales({ sales }: { sales?: any[] }) {
  if (!sales || sales.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No recent sales data available
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sales.slice(0, 5).map((sale, i) => {
        const initials = sale.customerName
          ?.split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase() || 'US'

        return (
          <div key={sale.id || i} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{sale.customerName || 'Unknown'}</p>
              <p className="text-sm text-muted-foreground">
                {sale.customerEmail || 'No email'}
              </p>
            </div>
            <div className="ml-auto font-medium">+₱{(sale.totalAmount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        )
      })}
    </div>
  )
}
