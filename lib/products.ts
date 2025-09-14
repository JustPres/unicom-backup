// Product data and utilities (API-backed)
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

export async function fetchProducts(params?: { q?: string; category?: string }): Promise<Product[]> {
  const sp = new URLSearchParams()
  if (params?.q) sp.set("q", params.q)
  if (params?.category) sp.set("category", params.category)
  const res = await fetch(`/api/products${sp.toString() ? `?${sp.toString()}` : ""}`)
  if (!res.ok) throw new Error("Failed to fetch products")
  const data = await res.json()
  return data.products as Product[]
}

export async function createProduct(input: Omit<Product, "id" | "rating" | "reviews"> & { rating?: number; reviews?: number }): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("Failed to create product")
  const data = await res.json()
  return data.product as Product
}

export async function searchProducts(query: string): Promise<Product[]> {
  return fetchProducts({ q: query })
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return fetchProducts({ category })
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const all = await fetchProducts()
  return all.find((p) => p.id === id)
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []
  const sp = new URLSearchParams({ ids: ids.join(",") })
  const res = await fetch(`/api/products?${sp.toString()}`)
  if (!res.ok) throw new Error("Failed to fetch products by ids")
  const data = await res.json()
  return data.products as Product[]
}

export async function updateProduct(id: string, updates: Partial<Omit<Product, "id">>): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error("Failed to update product")
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete product")
}
