import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Share2, Quote } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/products"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth()
  const router = useRouter()

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.origin + `/catalog/${product.id}`,
      })
    } catch (err) {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(window.location.origin + `/catalog/${product.id}`)
      toast.success('Link copied to clipboard')
    }
  }

  const handleQuote = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user?.role === 'admin') {
      toast.info('Admin mode: View only')
    } else {
      router.push(`/quote?productId=${product.id}`)
    }
  }
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!product.inStock && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Out of Stock
          </Badge>
        )}
        {product.inStock && <Badge className="absolute top-2 right-2 bg-emerald-600">In Stock</Badge>}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{product.brand}</span>
          </div>

          <h3 className="font-semibold text-balance leading-tight line-clamp-2">{product.name}</h3>

          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-emerald-600">₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleQuote}
          >
            <Quote className="mr-2 h-4 w-4" />
            Request Quote
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
