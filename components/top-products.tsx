'use client'

import { Progress } from "@/components/ui/progress"

interface Product {
  name: string
  count: number
}

export function TopProducts({ products }: { products: Product[] }) {
  const maxCount = Math.max(...products.map(p => p.count), 1)
  
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.name} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{product.name}</span>
            <span className="text-sm text-muted-foreground">{product.count} quotes</span>
          </div>
          <Progress value={(product.count / maxCount) * 100} className="h-2" />
        </div>
      ))}
      {products.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No product data available
        </p>
      )}
    </div>
  )
}
