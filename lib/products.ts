// Product data and utilities
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  inStock: boolean
  specifications?: Record<string, string>
  brand: string
  rating: number
  reviews: number
}

export const categories = [
  { id: "computers", name: "Computers & Laptops", icon: "💻" },
  { id: "components", name: "PC Components", icon: "🔧" },
  { id: "peripherals", name: "Peripherals", icon: "⌨️" },
  { id: "networking", name: "Networking", icon: "🌐" },
  { id: "storage", name: "Storage", icon: "💾" },
  { id: "accessories", name: "Accessories", icon: "🔌" },
]

export const products: Product[] = []

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category)
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.brand.toLowerCase().includes(lowercaseQuery),
  )
}
