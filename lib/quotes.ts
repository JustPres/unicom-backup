// Quote system data and utilities
export interface QuoteItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  customSpecs?: string
}

export interface Quote {
  id: string
  customerName: string
  customerEmail: string
  company?: string
  phone?: string
  items: QuoteItem[]
  totalAmount: number
  status: "pending" | "approved" | "rejected" | "expired"
  notes?: string
  createdAt: Date
  expiresAt: Date
  adminNotes?: string
  rejectionReason?: string
}

export const quotes: Quote[] = []

export function getQuoteById(id: string): Quote | undefined {
  return quotes.find((quote) => quote.id === id)
}

export function calculateQuoteTotal(items: QuoteItem[]): number {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
}
