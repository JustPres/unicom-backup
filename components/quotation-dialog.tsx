"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, X, Send } from "lucide-react"
import type { Quote } from "@/lib/quotes"

interface QuotationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    quote: Quote | null
    onConfirm: () => void
    onCancel: () => void
    viewOnly?: boolean
}

export function QuotationDialog({ open, onOpenChange, quote, onConfirm, onCancel, viewOnly = false }: QuotationDialogProps) {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    if (!quote) return null

    const handleExportPDF = async () => {
        setIsGeneratingPDF(true)
        try {
            // Convert logo to base64 to embed in PDF
            const response = await fetch('/unicom_logo.png')
            const blob = await response.blob()
            const reader = new FileReader()

            const logoBase64 = await new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string)
                reader.readAsDataURL(blob)
            })

            // Create a new window for printing
            const printWindow = window.open('', '_blank')
            if (!printWindow) return

            const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Quotation - ${quote.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { max-width: 200px; height: auto; margin-bottom: 15px; }
            .company { font-size: 24px; font-weight: bold; color: #059669; }
            .quote-id { font-size: 18px; color: #666; margin-top: 10px; }
            .customer-info { margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoBase64}" alt="Unicom Logo" class="logo" />
            <div class="quote-id">Quotation #${quote.id}</div>
            <p>Your trusted local provider for electronics and IT solutions</p>
          </div>
          
          <div class="customer-info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${quote.customerName}</p>
            <p><strong>Email:</strong> ${quote.customerEmail}</p>
            ${quote.company ? `<p><strong>Company:</strong> ${quote.company}</p>` : ''}
            ${quote.phone ? `<p><strong>Phone:</strong> ${quote.phone}</p>` : ''}
          </div>

          <h3>Quote Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>₱${item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>₱${(item.quantity * item.unitPrice).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            <p>Total Amount: ₱${quote.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          ${quote.notes ? `
            <div>
              <h3>Additional Notes</h3>
              <p>${quote.notes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>This quotation is valid for 30 days from ${new Date(quote.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Thank you for choosing Unicom Technologies!</p>
          </div>
        </body>
        </html>
      `

            printWindow.document.write(printContent)
            printWindow.document.close()

            // Wait a bit for images to load before printing
            setTimeout(() => {
                printWindow.print()
            }, 500)
        } catch (error) {
            console.error('Error generating PDF:', error)
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">Unicom Technologies</div>
                        <div className="text-lg text-muted-foreground">Quotation #{quote.id.slice(0, 8)}</div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{quote.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{quote.customerEmail}</p>
                                </div>
                                {quote.company && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Company</p>
                                        <p className="font-medium">{quote.company}</p>
                                    </div>
                                )}
                                {quote.phone && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{quote.phone}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quote Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quote Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {quote.items.map((item, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium">{item.productName}</h4>
                                            <Badge variant="outline">₱{item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                            <div>
                                                <span className="font-medium">Quantity:</span> {item.quantity}
                                            </div>
                                            <div>
                                                <span className="font-medium">Unit Price:</span> ₱{item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                            <div>
                                                <span className="font-medium">Subtotal:</span> ₱{(item.quantity * item.unitPrice).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                            {item.customSpecs && (
                                                <div className="col-span-2 md:col-span-4">
                                                    <span className="font-medium">Specifications:</span> {item.customSpecs}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total and Notes */}
                    <div className="space-y-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-600">
                                Total: ₱{quote.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <p className="text-sm text-muted-foreground">Valid for 30 days</p>
                        </div>

                        {quote.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Additional Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{quote.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={handleExportPDF}
                            disabled={isGeneratingPDF}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            {isGeneratingPDF ? "Generating..." : "Export PDF"}
                        </Button>

                        {!viewOnly && (
                            <>
                                <Button
                                    variant="destructive"
                                    onClick={onCancel}
                                    className="flex items-center gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Cancel Quote
                                </Button>

                                <Button
                                    onClick={onConfirm}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Send className="h-4 w-4" />
                                    Request Quote
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
