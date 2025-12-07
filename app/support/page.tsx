"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Phone, Mail, MapPin, Clock, MessageCircle, FileText, Ticket } from "lucide-react"
import { VisitorHeader } from "@/components/visitor-header"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth"
import Link from "next/link"

export default function SupportPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {user ? <Navigation centered /> : <VisitorHeader />}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-balance">Technical Support</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Get help when you need it. Our expert support team is here to assist you with all your technical needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">(0925) 5000-493</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">dc.unicomtec@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Visit Our Store</p>
                  <p className="text-sm text-muted-foreground">Marketing Office : 3F Unique Plaza, Sierra Madre St., Highway Hills, Mandaluyong City</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri: 9AM-6PM, Sat: 10AM-4PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">What are your support hours?</h4>
                <p className="text-sm text-muted-foreground">
                  Our support team is available Monday-Friday 9AM-6PM. Emergency support is available
                  24/7 for critical issues.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Do you offer remote support?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, we provide secure remote support for software issues, troubleshooting, and system maintenance when
                  possible.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">What's included in your warranty?</h4>
                <p className="text-sm text-muted-foreground">
                  All products come with manufacturer warranty plus our 30-day satisfaction guarantee. Labor warranties vary
                  by service type.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Ticket Section for Logged-in Users */}
        {user && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-emerald-600" />
                Support Tickets
              </CardTitle>
              <CardDescription>
                Submit and track your support requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Need help? Submit a support ticket and we'll get back to you quickly.
              </p>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/support-ticket">
                    <Ticket className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/customer/tickets">
                    <FileText className="h-4 w-4 mr-2" />
                    My Tickets
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
