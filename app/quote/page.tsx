"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { QuoteForm } from "@/components/quote-form"
import { QuotationDialog } from "@/components/quotation-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, Calculator, Users } from "lucide-react"
import { useAuth } from "@/lib/auth"
import type { Quote } from "@/lib/quotes"

export default function QuotePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [quoteSubmitted, setQuoteSubmitted] = useState(false)
  const [showQuotationDialog, setShowQuotationDialog] = useState(false)
  const [pendingQuote, setPendingQuote] = useState<Quote | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleQuoteSubmit = (quoteData: Quote) => {
    console.log("Quote submitted:", quoteData)
    setPendingQuote(quoteData)
    setShowQuotationDialog(true)
  }

  const handleConfirmQuote = async () => {
    if (!pendingQuote) return

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: pendingQuote.customerName,
          customerEmail: pendingQuote.customerEmail,
          company: pendingQuote.company,
          phone: pendingQuote.phone,
          items: pendingQuote.items,
          notes: pendingQuote.notes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit quote")
      }

      setShowQuotationDialog(false)
      setQuoteSubmitted(true)
      setPendingQuote(null)

      // Reset after 5 seconds
      setTimeout(() => {
        setQuoteSubmitted(false)
      }, 5000)
    } catch (error) {
      console.error("Error submitting quote:", error)
      // You might want to show an error message to the user
    }
  }

  const handleCancelQuote = () => {
    setShowQuotationDialog(false)
    setPendingQuote(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (quoteSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation centered />

        <main className="container mx-auto py-16 px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>

            <h1 className="text-3xl font-bold text-balance">Quote Request Submitted!</h1>

            <p className="text-lg text-muted-foreground">
              Thank you for your quote request. Our team will review your requirements and get back to you within 24
              hours with a detailed proposal.
            </p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="font-semibold text-emerald-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-emerald-700 space-y-1 text-left">
                <li>• Our sales team will review your requirements</li>
                <li>• We'll prepare a detailed quote with pricing and availability</li>
                <li>• You'll receive the quote via email within 24 hours</li>
                <li>• Our team will follow up to discuss any questions</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation centered />

      <main className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-balance mb-4">Request a Quote</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get personalized pricing for your technology needs. Our team will provide you with a detailed quote tailored
            to your requirements.
          </p>
        </div>

        {/* Services Offered */}
        <div className="mb-12">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-6 text-center">Services Offered</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calculator className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-medium mb-2">Custom Solutions</h4>
                  <p className="text-sm text-muted-foreground">Tailored technology solutions for your business needs</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium mb-2">Installation Services</h4>
                  <p className="text-sm text-muted-foreground">Professional setup and configuration of your equipment</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium mb-2">Technical Support</h4>
                  <p className="text-sm text-muted-foreground">Ongoing maintenance and troubleshooting assistance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quote Form */}
        <div className="max-w-4xl mx-auto">
          <QuoteForm onSubmit={handleQuoteSubmit} />
        </div>

        {/* Quotation Dialog */}
        <QuotationDialog
          open={showQuotationDialog}
          onOpenChange={setShowQuotationDialog}
          quote={pendingQuote}
          onConfirm={handleConfirmQuote}
          onCancel={handleCancelQuote}
          viewOnly={false}
        />
      </main>
    </div>
  )
}
