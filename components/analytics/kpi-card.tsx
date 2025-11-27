import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, MessageSquare, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type KpiCardProps = {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  description?: string
}

export function KpiCard({ title, value, change, icon, description }: KpiCardProps) {
  const isPositive = change ? change >= 0 : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center mt-1`}>
            {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            {Math.abs(change)}% from last month
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function KpiGrid({ data }: { data: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total Revenue"
        value={`₱${data?.sales?.total?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
        change={12.5}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <KpiCard
        title="Orders"
        value={data?.sales?.orderCount || 0}
        change={5.2}
        icon={<ShoppingCart className="h-4 w-4" />}
      />
      <KpiCard
        title="Active Customers"
        value={data?.customers?.total || 0}
        change={8.1}
        icon={<Users className="h-4 w-4" />}
      />
      <KpiCard
        title="Active Support Tickets"
        value={data?.tickets?.byStatus?.['open'] || 0}
        change={-2.3}
        icon={<MessageSquare className="h-4 w-4" />}
      />
    </div>
  )
}
