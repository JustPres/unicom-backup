"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Package } from "lucide-react"
import { fetchProducts, createProduct, updateProduct, deleteProduct, type Product, categories } from "@/lib/products"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

export default function InventoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState<Product[]>([])
  const [creating, setCreating] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  // New product form state
  const [name, setName] = useState("")
  const [brand, setBrand] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState("")
  const [description, setDescription] = useState("")
  const [inStock, setInStock] = useState(true)
  const [specRows, setSpecRows] = useState<Array<{ key: string; value: string }>>([])

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      void load()
    }
  }, [loading, user])

  const load = async () => {
    try {
      const list = await fetchProducts()
      setItems(list)
    } catch (e) {
      toast({ title: "Failed to load products", variant: "destructive" })
    }
  }

  const filteredProducts = items.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation centered />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Inventory Management</h1>
              <p className="text-muted-foreground mt-2">Manage your product inventory and stock levels</p>
            </div>
            <Button onClick={() => {
              // reset form for create
              setEditingId(null)
              setName("")
              setBrand("")
              setPrice("")
              setCategory("")
              setImage("")
              setDescription("")
              setInStock(true)
              setSpecRows([])
              setOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand *</Label>
                        <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        className="w-full border rounded-md h-9 px-3 bg-background"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        className="w-full border rounded-md bg-background p-3 text-sm resize-none"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Product description..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="inStock" checked={inStock} onCheckedChange={(v) => setInStock(Boolean(v))} />
                      <Label htmlFor="inStock">In stock</Label>
                    </div>
                  </div>

                  {/* Right Column - Image & Specs */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image">Product Image</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            setImage(String(reader.result || ""))
                          }
                          reader.readAsDataURL(file)
                        }}
                      />
                      {image && (
                        <div className="border rounded-md p-3 bg-muted/30">
                          <p className="text-sm text-muted-foreground mb-2">Preview</p>
                          <div className="flex justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image}
                              alt="Preview"
                              className="max-h-32 max-w-32 object-cover rounded border"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Specifications (Optional)</Label>
                      {specRows.length === 0 && (
                        <p className="text-xs text-muted-foreground">Add technical specifications as key-value pairs</p>
                      )}
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {specRows.map((row, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              placeholder="Key (e.g., CPU)"
                              value={row.key}
                              onChange={(e) => {
                                const copy = [...specRows]
                                copy[idx].key = e.target.value
                                setSpecRows(copy)
                              }}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Value (e.g., Ryzen 7)"
                              value={row.value}
                              onChange={(e) => {
                                const copy = [...specRows]
                                copy[idx].value = e.target.value
                                setSpecRows(copy)
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSpecRows(specRows.filter((_, i) => i !== idx))}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setSpecRows([...specRows, { key: "", value: "" }])}
                      >
                        + Add Specification
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={async () => {
                    if (!name || !brand || !category || price === "") {
                      toast({ title: "Please fill all required fields", variant: "destructive" })
                      return
                    }
                    try {
                      setCreating(true)
                      const specifications = Object.fromEntries(specRows.filter(s => s.key && s.value).map(s => [s.key, s.value]))
                      if (editingId) {
                        await updateProduct(editingId, { name, brand, category, price: Number(price), image, description, inStock, specifications })
                        toast({ title: "Product updated" })
                      } else {
                        await createProduct({ name, brand, category, price: Number(price), image, description, inStock, specifications, rating: 0, reviews: 0 })
                        toast({ title: "Product created" })
                      }
                      setOpen(false)
                      setName(""); setBrand(""); setPrice(""); setCategory(""); setImage(""); setDescription(""); setInStock(true)
                      setSpecRows([])
                      await load()
                    } catch (e) {
                      toast({ title: "Failed to save product", variant: "destructive" })
                    } finally {
                      setCreating(false)
                    }
                  }} disabled={creating}>
                    {creating ? (editingId ? "Saving..." : "Creating...") : (editingId ? "Save" : "Create")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Removed demo stats cards */}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell className="capitalize">{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.inStock ? "default" : "destructive"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Prefill and open dialog for edit
                            setEditingId(product.id)
                            setName(product.name)
                            setBrand(product.brand)
                            setPrice(product.price)
                            setCategory(product.category)
                            setImage(product.image)
                            setDescription(product.description)
                            setInStock(product.inStock)
                            const specs = product.specifications || {}
                            setSpecRows(Object.keys(specs).map((k) => ({ key: k, value: String((specs as any)[k]) })))
                            setOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            if (!window.confirm(`Delete ${product.name}?`)) return
                            try {
                              await deleteProduct(product.id)
                              toast({ title: "Product deleted" })
                              await load()
                            } catch (e) {
                              toast({ title: "Failed to delete product", variant: "destructive" })
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Removed demo low stock alert */}
      </main>
    </div>
  )
}
