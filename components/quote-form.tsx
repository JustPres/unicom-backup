"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Send, Calculator } from "lucide-react"
import { fetchProducts, type Product } from "@/lib/products"
import type { QuoteItem } from "@/lib/quotes"
import { useAuth } from "@/lib/auth"

interface QuoteFormProps {
  onSubmit?: (quoteData: any) => void
}

export function QuoteForm({ onSubmit }: QuoteFormProps) {
  const { user } = useAuth()
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    company: "",
    phone: "",
  })

  const [items, setItems] = useState<QuoteItem[]>([])
  const [notes, setNotes] = useState("")
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const list = await fetchProducts()
        setProducts(list)
      } catch (e) {
        // optional: toast error
      }
    }
    void load()
  }, [])

  // Update customer info when user changes
  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }))
    }
  }, [user])

  const addItem = () => {
    const newItem: QuoteItem = {
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      customSpecs: "",
    }
    setItems([...items, newItem])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Auto-fill product details when product is selected
    if (field === "productId" && value) {
      const product = products.find((p) => p.id === value)
      if (product) {
        updatedItems[index].productName = product.name
        updatedItems[index].unitPrice = product.price
      }
    }

    setItems(updatedItems)
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (items.length === 0 || !customerInfo.name || !customerInfo.email) {
      return
    }

    // Create quote data for preview
    const quoteData = {
      id: crypto.randomUUID(),
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      company: customerInfo.company,
      phone: customerInfo.phone,
      items,
      notes,
      totalAmount: calculateTotal(),
      status: "pending" as const,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }

    console.log("Quote data created:", quoteData)
    // Show dialog instead of submitting directly
    onSubmit?.(quoteData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Provide your contact details for the quote</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                required
                placeholder="Enter your full name for this quote"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
                title="Email is automatically set from your account"
              />
              <p className="text-xs text-muted-foreground">
                Email is automatically set from your logged-in account
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={customerInfo.company}
                onChange={(e) => setCustomerInfo({ ...customerInfo, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quote Items</CardTitle>
              <CardDescription>Add products and quantities for your quote</CardDescription>
            </div>
            <Button type="button" onClick={addItem} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items added yet. Click "Add Item" to get started.
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(index)}
                    title="Remove this item"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={item.productId}
                      onChange={(e) => updateItem(index, "productId", e.target.value)}
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="text"
                      value={`₱${item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                      title="Price is automatically set from the product catalog"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <div className="p-2 bg-muted rounded-md font-medium">
                      ₱{(item.quantity * item.unitPrice).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Custom Specifications (Optional)</Label>
                  <Textarea
                    placeholder="Any custom requirements or specifications..."
                    value={item.customSpecs || ""}
                    onChange={(e) => updateItem(index, "customSpecs", e.target.value)}
                  />
                </div>
              </div>
            ))
          )}

          {items.length > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-emerald-600">₱{calculateTotal().toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>Any special requirements or additional information</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Delivery requirements, timeline, special requests..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={items.length === 0 || !customerInfo.name || !customerInfo.email}
        >
          <Send className="mr-2 h-4 w-4" />
          Request Quote
        </Button>
      </div>
    </form>
  )
}
