"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { QuoteForm } from "@/components/quote-form"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, Calculator, Users } from "lucide-react"

export default function QuotePage() {
  const [quoteSubmitted, setQuoteSubmitted] = useState(false)

  const handleQuoteSubmit = (quoteData: any) => {
    console.log("Quote submitted:", quoteData)
    setQuoteSubmitted(true)

    // Reset after 5 seconds
    setTimeout(() => {
      setQuoteSubmitted(false)
    }, 5000)
  }

  if (quoteSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />

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
      <Navigation />

      <main className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-balance mb-4">Request a Quote</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get personalized pricing for your technology needs. Our team will provide you with a detailed quote tailored
            to your requirements.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold mb-2">Custom Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Get competitive pricing tailored to your specific requirements and volume needs.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Fast Response</h3>
              <p className="text-sm text-muted-foreground">
                Receive your detailed quote within 24 hours of submission.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Expert Support</h3>
              <p className="text-sm text-muted-foreground">
                Our technical experts will help you choose the right solutions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quote Form */}
        <div className="max-w-4xl mx-auto">
          <QuoteForm onSubmit={handleQuoteSubmit} />
        </div>
      </main>
    </div>
  )
}
